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
    private var lastSyncedWatchTime: TimeInterval = 0
    private var lastSyncLocalTimestamp: Date = Date.now
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
        WorkoutLogger.info("원격 세션 수신기(Handler) 설정 및 재활성화")
        
        healthStore.workoutSessionMirroringStartHandler = { [weak self] mirroredSession in
            guard let self = self else { return }
            
            WorkoutLogger.info("미러링 세션 시작됨")
            WorkoutLogger.debug("미러링 세션 정보 - state: \(mirroredSession.state.rawValue), startDate: \(mirroredSession.startDate?.description ?? "nil")")
            
            Task { @MainActor in
                await self.performReset(shouldReRegisterHandler: false)
                
                self.session = mirroredSession
                mirroredSession.delegate = self
                
                let currentState = SessionStateChange(newState: mirroredSession.state, date: mirroredSession.startDate ?? Date.now)
                
                WorkoutLogger.debug("초기 상태 전송: \(currentState.newState.rawValue)")
                self.asyncStreamTuple.continuation.yield(currentState)
            }
        }
        
        WorkoutLogger.debug("원격 세션 핸들러 설정 완료")
    }
    
    private func performReset(shouldReRegisterHandler: Bool) async {
        WorkoutLogger.info("[iPhone] Workout 로컬 상태 초기화 진행")
        
        if let activeSession = session {
            WorkoutLogger.info("활성화된 세션 강제 종료 요청")
            activeSession.delegate = nil
            
            if activeSession.state == .running || activeSession.state == .paused {
                activeSession.stopActivity(with: Date.now)
            }
            if activeSession.state != .ended {
                activeSession.end()
            }
                       
        }
        
        metrics.reset()
        session = nil
        stopElapsedTimeTimer()
        
        lastSyncedWatchTime = 0
        lastSyncLocalTimestamp = Date.now
        
        // 강제 종료 후 HealthKit 귀가 멀어지는 현상을 방지하기 위해 수신기를 재부팅.
        if shouldReRegisterHandler {
            WorkoutLogger.debug("다음 미러링 세션을 받기 위해 핸들러 재등록 수행")
            retrieveRemoteSession()
        }
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
                WorkoutLogger.debug("totalPausedDuration 초기화: 0")
            }
            lastSyncLocalTimestamp = Date.now
            startElapsedTimeTimer()
        case .paused:
            WorkoutLogger.debug("paused - 타이머 중지")
            WorkoutLogger.info("pause 시작 시간 기록: \(change.date)")
            lastSyncedWatchTime = metrics.elapsedTime
            stopElapsedTimeTimer()
        case .stopped:
            WorkoutLogger.info("stopped - 세션 종료 시작")
            stopElapsedTimeTimer()
        case .ended:
            WorkoutLogger.debug("ended - 종료됨")
            stopElapsedTimeTimer()
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
        
        if metrics.sessionState == .ended {
            WorkoutLogger.info("이전 미러링 세션이 종료된 상태입니다. 내부 데이터를 초기화합니다.")
            await resetWorkout()
        }
        
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
    
    public func resetWorkout() async {
        await performReset(shouldReRegisterHandler: true)
        WorkoutLogger.debug("리셋 완료 - pause 정보 초기화")
    }
}

// MARK: - 운동 경과 시간 처리
extension WatchLedWorkoutManager {
    private func updateElapsedTime() {
        guard metrics.startDate != nil else {
            metrics.updateElapsedTime(0)
            return
        }
        
        guard metrics.sessionState == .running else { return }
        
        // 마지막으로 워치와 동기화된 시점으로부터 아이폰 내부에서 흐른 시간 계산
        let timeSinceLastSync = Date.now.timeIntervalSince(lastSyncLocalTimestamp)
        let currentExtrapolatedTime = lastSyncedWatchTime + timeSinceLastSync
        
        metrics.updateElapsedTime(currentExtrapolatedTime)
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
        // 1. 초기 동기화 데이터 처리
        if let initialSync = try? JSONDecoder().decode(WorkoutInitialSync.self, from: data) {
            metrics.setStartDate(initialSync.workoutStartDate)
            
            // 절대 기준점 갱신
            self.lastSyncedWatchTime = initialSync.currentElapsedTime
            self.lastSyncLocalTimestamp = Date.now
            
            startElapsedTimeTimer()
            return
        }
        
        // 2. 운동 상태 업데이트 처리 (1초마다 수신)
        if let message = try? WorkoutStatePayload.decode(from: data) {
            metrics.updateHeartRate(message.state.heartRate)
            metrics.updateCalories(message.state.calories)
            metrics.updateDistance(message.state.distance)
            metrics.updatePace(message.state.pace)
            
            self.lastSyncedWatchTime = message.state.elapsedTime
            self.lastSyncLocalTimestamp = Date.now
            metrics.updateElapsedTime(self.lastSyncedWatchTime)
            return
        }
        
        // 알 수 없는 데이터 형식
        WorkoutLogger.warning("알 수 없는 데이터 포맷")
        throw WorkoutError.invalidDataFormat
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
            
            WorkoutLogger.info("워치 앱이 종료되었거나 연결이 끊어졌습니다. 아이폰 상태를 자동으로 초기화합니다.")
            
            // 1. 아이폰 쪽에 남아있는 찌꺼기 세션을 완전히 파기
            await self.performReset(shouldReRegisterHandler: true)
            
            // 2. JS(React Native) 쪽으로 "완전히 초기화되었다"는 이벤트를 강제로 한 번 쏴주어 UI 즉시 렌더링
            NotificationCenter.default.post(name: NSNotification.Name("WatchDidRequestReset"), object: nil)
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
