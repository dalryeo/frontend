// 애플워치 + 아이폰 (미러링) 워크아웃 매니저
// 애플워치가 주체가 되어 아이폰은 운동 데이터를 직접 수집하지 않습니다.

import HealthKit
import WatchConnectivity

@MainActor
class WatchLedWorkoutManager: NSObject, WorkoutControlling {
    private enum Constants {
        static let timerInterval: TimeInterval = 1.0
        static let timerTolerance: TimeInterval = 0.1
        static let streamBufferSize: Int = 1
        
        // 시간 검증 임계값
        static let timeDriftThreshold: TimeInterval = 1.0  // 허용 가능한 시간 차이
        static let timeDriftCorrectionThreshold: TimeInterval = 2.0  // 강제 보정이 필요한 시간 차이
    }
    
    private(set) var metrics = WorkoutMetrics()
    private let healthStore = HKHealthStore()
    private let asyncStreamTuple = AsyncStream.makeStream(
        of: SessionStateChange.self,
        bufferingPolicy: .bufferingNewest(Constants.streamBufferSize)
    )
    private var session: HKWorkoutSession?
    private var currentPauseStartDate: Date?
    private var totalPausedDuration: TimeInterval = 0
    private var elapsedTimeTimer: Timer?
    
    public var isWorkoutActive: Bool {
      switch metrics.sessionState {
        case .running, .paused:
            return true
        default:
            return false
        }
    }
    /// 위치 권한 변경 콜백
    public var onLocationAuthorizationChange: ((Bool) -> Void)?
    /// 운동 상태 변경 콜백
    public var onWorkoutStateChange: ((HKWorkoutSessionState) -> Void)?
    /// 운동 데이터 업데이트 콜백
    public var onMetricsUpdate: ((WorkoutMetrics) -> Void)?
    
    override init() {
        super.init()
        
        WorkoutLogger.info("WatchLedWorkoutManager 초기화")
        retrieveRemoteSession()
        
        metrics.onWorkoutStateChange = { [weak self] state in
            guard let self = self else { return }
            
            self.onWorkoutStateChange?(state)
        }
        
        metrics.onMetricsUpdate = { [weak self] state in
            guard let self = self else { return }
            
            self.onMetricsUpdate?(state)
        }
        
        Task {
            WorkoutLogger.debug("SessionState 스트림 구독 시작")
            for await value in asyncStreamTuple.stream {
                WorkoutLogger.debug("SessionState 변경 수신: \(value.newState.rawValue)")
                await consumeSessionStateChange(value)
            }
        }
    }
    
    
    
    public func retrieveRemoteSession() {
        WorkoutLogger.info("원격 세션 핸들러 설정")
        
        healthStore.workoutSessionMirroringStartHandler = { [weak self] mirroredSession in
            guard let self = self else { return }
            
            WorkoutLogger.info("미러링 세션 시작됨")
            WorkoutLogger.debug("미러링 세션 정보 - state: \(mirroredSession.state.rawValue), startDate: \(mirroredSession.startDate?.description ?? "nil")")
            
            Task { @MainActor in
                self.resetWorkout()
                self.session = mirroredSession
                mirroredSession.delegate = self
                let currentState = SessionStateChange(newState: mirroredSession.state, date: mirroredSession.startDate ?? Date.now)
                
                WorkoutLogger.debug("초기 상태 전송: \(currentState.newState.rawValue)")
                self.asyncStreamTuple.continuation.yield(currentState)
            }
        }
        
        WorkoutLogger.debug("원격 세션 핸들러 설정 완료")
    }
    
    private func consumeSessionStateChange(_ change: SessionStateChange) async {
        WorkoutLogger.info("SessionState 처리: \(change.newState.rawValue) at \(change.date)")
        metrics.updateSessionState(change.newState)
        
        switch change.newState {
        case .notStarted:
            WorkoutLogger.debug("notStarted - 타이머 중지")
            stopElapsedTimeTimer()
        case .prepared:
            WorkoutLogger.debug("prepared - 준비 완료")
        case .running:
            WorkoutLogger.debug("running - 타이머 시작")
            if metrics.startDate == nil {
                // 최초 시작
                WorkoutLogger.info("최초 시작 - startDate 설정: \(change.date)")
                metrics.setStartDate(change.date)
                totalPausedDuration = 0
                WorkoutLogger.debug("totalPausedDuration 초기화: 0")
            } else if let pauseStart = currentPauseStartDate {
                let pauseDuration = change.date.timeIntervalSince(pauseStart)
                totalPausedDuration += pauseDuration
                WorkoutLogger.info("재개 - pause 시간: \(String(format: "%.1f", pauseDuration))초, 누적: \(String(format: "%.1f", totalPausedDuration))초")
                currentPauseStartDate = nil
            }
            
            startElapsedTimeTimer()
        case .paused:
            WorkoutLogger.debug("paused - 타이머 중지")
            WorkoutLogger.info("pause 시작 시간 기록: \(change.date)")
            currentPauseStartDate = change.date
            stopElapsedTimeTimer()
        case .stopped:
            WorkoutLogger.info("stopped - 세션 종료 시작")
            WorkoutLogger.debug("최종 통계 - 총 pause: \(String(format: "%.1f", totalPausedDuration))초")
            stopElapsedTimeTimer()
        case .ended:
            WorkoutLogger.debug("ended - 종료됨")
        @unknown default:
            WorkoutLogger.fault("올바르지 않은 상태")
            fatalError("올바르지 않은 상태")
        }
    }
}

// MARK: - 운동 제어
extension WatchLedWorkoutManager {
    public func startWorkout() async throws {
        WorkoutLogger.info("[iPhone] Workout 시작 요청")
        
        // 중복 시작 방지
        guard session == nil else {
            WorkoutLogger.warning("이미 미러링 세션이 활성화되어 있습니다")
            throw WorkoutError.workoutAlreadyInProgress
        }
        
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = metrics.activityType
        configuration.locationType = metrics.locationType
        
        WorkoutLogger.debug("Configuration 설정 - activityType: \(metrics.activityType.rawValue), locationType: \(metrics.locationType.rawValue)")
        
        do {
            WorkoutLogger.debug("Watch 앱 시작 요청 중...")
            try await healthStore.startWatchApp(toHandle: configuration)
            WorkoutLogger.info("Watch 앱 시작 완료")
        } catch {
            WorkoutLogger.error("Watch 앱 시작 실패: \(error.localizedDescription)")
            throw WorkoutError.watchNotReachable
        }
    }
    
    func pauseWorkout() throws {
        guard let session = session else {
            WorkoutLogger.warning("[iPhone] 세션 없음 - 일시정지 불가")
            throw WorkoutError.sessionNotActive
        }
        
        guard session.state == .running else {
            WorkoutLogger.warning("[iPhone] 일시정지 불가 - 현재 상태: \(session.state.rawValue)")
            throw WorkoutError.invalidWorkoutState
        }
        
        WorkoutLogger.info("[iPhone] Workout 일시정지 요청")
        session.pause()
    }
    
    func resumeWorkout() throws {
        guard let session = session else {
            WorkoutLogger.warning("[iPhone] 세션 없음 - 재개 불가")
            throw WorkoutError.sessionNotActive
        }
        
        guard session.state == .paused else {
            WorkoutLogger.warning("[iPhone] 재개 불가 - 현재 상태: \(session.state.rawValue)")
            throw WorkoutError.invalidWorkoutState
        }
        
        WorkoutLogger.info("[iPhone] Workout 재개 요청")
        session.resume()
    }
    
    func endWorkout() async throws {
        guard let session = session else {
            WorkoutLogger.warning("[iPhone] 세션 없음 - 종료 불가")
            throw WorkoutError.sessionNotActive
        }
        
        guard session.state == .running || session.state == .paused else {
            WorkoutLogger.warning("[iPhone] 종료 불가 - 현재 상태: \(session.state.rawValue)")
            throw WorkoutError.invalidWorkoutState
        }
        
        WorkoutLogger.info("[iPhone] Workout 종료 요청")
        session.stopActivity(with: .now)
    }
    
    public func resetWorkout() {
        WorkoutLogger.info("[iPhone] Workout 리셋")
        metrics.reset()
        session = nil
        currentPauseStartDate = nil
        totalPausedDuration = 0
        stopElapsedTimeTimer()
        WorkoutLogger.debug("리셋 완료 - pause 정보 초기화")
    }
}

// MARK: - 운동 경과 시간 처리
extension WatchLedWorkoutManager {
    private func updateElapsedTime() {
        guard let startDate = metrics.startDate else {
            metrics.updateElapsedTime(0)
            return
        }
        
        // 현재까지의 총 경과 시간
        let totalElapsed = Date.now.timeIntervalSince(startDate)
        // pause 시간을 제외한 실제 운동 시간
        let elapsedTime = totalElapsed - totalPausedDuration
        
        // 음수 방지 (시스템 시간 변경 등의 예외 상황)
        if elapsedTime < 0 {
            WorkoutLogger.warning("elapsedTime 음수 감지: \(elapsedTime) - 0으로 설정")
            metrics.updateElapsedTime(0)
        } else {
            metrics.updateElapsedTime(elapsedTime)
        }
    }
    
    private func stopElapsedTimeTimer() {
        WorkoutLogger.debug("경과 시간 타이머 중지")
        elapsedTimeTimer?.invalidate()
        elapsedTimeTimer = nil
    }
    
    private func startElapsedTimeTimer() {
        WorkoutLogger.debug("경과 시간 타이머 시작")
        stopElapsedTimeTimer()
        updateElapsedTime()
        
        elapsedTimeTimer = Timer.scheduledTimer(
            withTimeInterval: Constants.timerInterval,
            repeats: true
        ) { [weak self] _ in
            guard let self = self else { return }
            
            Task { @MainActor in
                self.updateElapsedTime()
            }
        }
        
        elapsedTimeTimer?.tolerance = Constants.timerTolerance
        RunLoop.current.add(elapsedTimeTimer!, forMode: .common)
        WorkoutLogger.info("경과 시간 타이머 시작 완료")
    }
}

// MARK: - 데이터 수신 처리
extension WatchLedWorkoutManager {
    private func handleReceivedData(_ data: Data) throws {
        WorkoutLogger.debug("원격 데이터 수신: \(data.count) bytes")
        
        // 초기 동기화 데이터 처리
        if let initialSync = try? JSONDecoder().decode(WorkoutInitialSync.self, from: data) {
            WorkoutLogger.info("초기 동기화 데이터 수신")
            WorkoutLogger.debug("동기화 정보 - startDate: \(initialSync.workoutStartDate), elapsedTime: \(String(format: "%.1f", initialSync.currentElapsedTime))초, pauseDuration: \(String(format: "%.1f", initialSync.totalPausedDuration))초")
            
            metrics.setStartDate(initialSync.workoutStartDate)
            totalPausedDuration = initialSync.totalPausedDuration
            startElapsedTimeTimer()
            
            WorkoutLogger.info("초기 동기화 완료")
            return
        }
        
        // 운동 상태 업데이트 처리
        if let message = try? WorkoutStatePayload.decode(from: data) {
            WorkoutLogger.debug("운동 상태 업데이트 수신")
            WorkoutLogger.debug("심박수: \(String(format: "%.0f", message.state.heartRate)) bpm")
            WorkoutLogger.debug("칼로리: \(String(format: "%.1f", message.state.calories)) kcal")
            WorkoutLogger.debug("거리: \(String(format: "%.0f", message.state.distance)) m")
            WorkoutLogger.debug("페이스: \(String(format: "%.2f", message.state.pace)) min/km")
            WorkoutLogger.debug("경과시간: \(String(format: "%.0f", message.state.elapsedTime)) 초")
            
            metrics.updateHeartRate(message.state.heartRate)
            metrics.updateCalories(message.state.calories)
            metrics.updateDistance(message.state.distance)
            metrics.updatePace(message.state.pace)
            
            do {
                try validateAndCorrectElapsedTime(watchElapsedTime: message.state.elapsedTime)
            } catch {
                WorkoutLogger.error("시간 검증 실패: \(error.localizedDescription)")
                // 시간 검증 실패는 치명적이지 않으므로 계속 진행
            }
            
            WorkoutLogger.debug("상태 업데이트 완료")
            return
        }
        
        // 알 수 없는 데이터 형식
        WorkoutLogger.warning("알 수 없는 데이터 포맷")
        throw WorkoutError.invalidDataFormat
    }
    
    private func validateAndCorrectElapsedTime(watchElapsedTime: TimeInterval) throws {
        let localElapsedTime = metrics.elapsedTime
        let drift = abs(localElapsedTime - watchElapsedTime)
        
        WorkoutLogger.debug("시간 검증 - iPhone: \(String(format: "%.1f", localElapsedTime))초, Watch: \(String(format: "%.1f", watchElapsedTime))초, 차이: \(String(format: "%.1f", drift))초")
        
        // 임계값 이상 차이나는 경우 처리
        if drift > Constants.timeDriftThreshold {
            WorkoutLogger.warning("시간 불일치 감지: \(String(format: "%.1f", drift))초")
            
            // Watch 시간이 더 크거나 보정 임계값 이상 차이나면 보정
            if watchElapsedTime > localElapsedTime || drift > Constants.timeDriftCorrectionThreshold {
                guard let startDate = metrics.startDate else {
                    WorkoutLogger.error("startDate 없음 - 보정 불가")
                    throw WorkoutError.timeValidationFailed
                }
                
                WorkoutLogger.info("시간 보정 중...")
                
                let timeSinceStart = Date.now.timeIntervalSince(startDate)
                let oldPauseDuration = totalPausedDuration
                
                // 보정: totalPausedDuration = (현재까지 경과 시간) - (Watch의 실제 운동 시간)
                totalPausedDuration = timeSinceStart - watchElapsedTime
                
                // 음수 방지
                if totalPausedDuration < 0 {
                    WorkoutLogger.error("보정 결과 음수 - 보정 취소")
                    totalPausedDuration = oldPauseDuration
                    throw WorkoutError.timeValidationFailed
                }
                
                WorkoutLogger.debug("보정 결과 - 이전 pause: \(String(format: "%.1f", oldPauseDuration))초 → 새 pause: \(String(format: "%.1f", totalPausedDuration))초")
                
                updateElapsedTime()
                
                WorkoutLogger.info("시간 보정 완료")
            } else {
                WorkoutLogger.debug("작은 차이 - 보정 생략")
            }
        }
    }
}

// MARK: - HealthKit 처리
extension WatchLedWorkoutManager {
    public func requestHealthAuthorization() async throws {
        WorkoutLogger.info("권한 요청 시작")
        
        guard HKHealthStore.isHealthDataAvailable() else {
            WorkoutLogger.error("HealthKit을 사용할 수 없는 기기")
            throw WorkoutError.healthKitNotAvailable
        }
        // 운동 권한 항목
        let typesToWrite: Set<HKSampleType> = [
            HKWorkoutType.workoutType(),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.heartRate),
            HKQuantityType(.runningSpeed)
        ]
        let typesToRead: Set<HKObjectType> = [
            HKWorkoutType.workoutType(),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.heartRate),
            HKQuantityType(.runningSpeed)
        ]
        
        try await healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead)
        WorkoutLogger.info("HealthKit 권한 요청 완료")
    }
    
    public func checkHealthKitWritePermission() -> Bool {
        let workoutType = HKWorkoutType.workoutType()
        let status = healthStore.authorizationStatus(for: workoutType)
        
        switch status {
        case .sharingAuthorized:
            WorkoutLogger.info("HealthKit 쓰기 권한 있음")
            return true
        case .sharingDenied:
            WorkoutLogger.warning("HealthKit 쓰기 권한 거부됨")
            return false
        case .notDetermined:
            WorkoutLogger.info("HealthKit 권한 상태 미정")
            return false
        @unknown default:
            WorkoutLogger.warning("HealthKit 알 수 없는 권한 상태")
            return false
        }
    }
    
    public func checkLocationPermission() -> Bool {
      return true
    }
    
    public func requestLocationAuthorization() async { }
}
// MARK: - 델리게이터 처리
extension WatchLedWorkoutManager: HKWorkoutSessionDelegate {
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didChangeTo toState: HKWorkoutSessionState,
        from fromState: HKWorkoutSessionState,
        date: Date
    ) {
        WorkoutLogger.info("[Delegate] Session 상태 변경: \(fromState.rawValue) → \(toState.rawValue)")
        
        let change = SessionStateChange(newState: toState, date: date)
        asyncStreamTuple.continuation.yield(change)
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didFailWithError error: Error
    ) {
        WorkoutLogger.error("[Delegate] Session 에러: \(error.localizedDescription)")
        
        Task { @MainActor in
            let nsError = error as NSError
            
            if nsError.domain == HKErrorDomain {
                switch nsError.code {
                case HKError.errorAuthorizationNotDetermined.rawValue:
                    WorkoutLogger.error("HealthKit 권한 미결정")
                case HKError.errorAuthorizationDenied.rawValue:
                    WorkoutLogger.error("HealthKit 권한 거부됨")
                case HKError.errorDatabaseInaccessible.rawValue:
                    WorkoutLogger.error("HealthKit 데이터베이스 접근 불가")
                default:
                    WorkoutLogger.error("기타 HealthKit 에러: \(nsError.code) - \(nsError.localizedDescription)")
                }
            } else {
                WorkoutLogger.error("비 HealthKit 에러 - domain: \(nsError.domain), code: \(nsError.code)")
            }
            
            // UI에 에러 알림 (예: 토스트, 얼럿)
            // NotificationCenter나 콜백을 통해 상위 레이어로 전달
        }
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didBeginActivityWith workoutConfiguration: HKWorkoutConfiguration,
        date: Date
    ) {
        WorkoutLogger.info("[Delegate] Activity 시작 - date: \(date), activityType: \(workoutConfiguration.activityType.rawValue)")
        
        let change = SessionStateChange(newState: workoutSession.state, date: date)
        asyncStreamTuple.continuation.yield(change)
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didEndActivityWith workoutConfiguration: HKWorkoutConfiguration,
        date: Date
    ) {
        WorkoutLogger.info("[Delegate] Activity 종료 - date: \(date)")
        
        let change = SessionStateChange(newState: workoutSession.state, date: date)
        asyncStreamTuple.continuation.yield(change)
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didGenerate event: HKWorkoutEvent
    ) {
        WorkoutLogger.debug("[Delegate] 이벤트 생성: \(event.type.rawValue)")
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didDisconnectFromRemoteDeviceWithError error: Error?
    ) {
        if let error = error {
            WorkoutLogger.error("[Delegate] 원격 기기 연결 끊김 (에러): \(error.localizedDescription)")
        } else {
            WorkoutLogger.warning("[Delegate] 원격 기기 연결 끊김 (정상)")
        }
        
        Task { @MainActor in
            // 연결 끊김 처리
            // - 재연결 시도
            // - 사용자에게 알림
            // - 로컬 데이터 보존
        }
    }
    
    nonisolated func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didReceiveDataFromRemoteWorkoutSession data: [Data]
    ) {
        WorkoutLogger.debug("[Delegate] 원격 데이터 수신: \(data.count)개 패킷, 총 \(data.reduce(0) { $0 + $1.count }) bytes")
        
        Task { @MainActor in
            var successCount = 0
            var errorCount = 0
            
            for (index, payload) in data.enumerated() {
                WorkoutLogger.debug("패킷 \(index + 1)/\(data.count) 처리 중... (\(payload.count) bytes)")
                
                do {
                    try self.handleReceivedData(payload)
                    successCount += 1
                } catch WorkoutError.invalidDataFormat {
                    WorkoutLogger.error("패킷 \(index + 1) - 잘못된 데이터 형식")
                    errorCount += 1
                } catch WorkoutError.timeValidationFailed {
                    WorkoutLogger.error("패킷 \(index + 1) - 시간 검증 실패")
                    errorCount += 1
                } catch {
                    WorkoutLogger.error("패킷 \(index + 1) - 처리 실패: \(error.localizedDescription)")
                    errorCount += 1
                }
            }
            
            WorkoutLogger.debug("데이터 처리 완료 - 성공: \(successCount), 실패: \(errorCount)")
            
            // 모든 패킷이 실패한 경우 사용자에게 알림
            if errorCount > 0 && successCount == 0 {
                WorkoutLogger.error("모든 데이터 패킷 처리 실패")
                // UI 알림 필요
            }
        }
    }
}
