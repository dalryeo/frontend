// MARK: - WatchAppDelegate 및 App Entry
import SwiftUI
import HealthKit

// MARK: - WorkoutManager

enum AppDisplayState {
    case idle, countdown, active, paused, summary
}

@MainActor
@Observable
class WorkoutManager: NSObject, WorkoutControlling {
    private enum Constants {
        static let timerInterval: TimeInterval = 1.0
        static let timerTolerance: TimeInterval = 0.1
        static let streamBufferSize: Int = 1
        static let metersPerSecondToKmh: Double = 3.6
        
        static let maxRealisticSpeed = WorkoutMetrics.Constants.maxRealisticSpeed
        static let highSpeedThreshold = WorkoutMetrics.Constants.highSpeedThreshold
        static let maxDistanceIncrease = WorkoutMetrics.Constants.maxDistanceIncrease
    }
    
    static let shared = WorkoutManager()
    
    private(set) var metrics = WorkoutMetrics()
    private let healthStore = HKHealthStore()
    private let asyncStreamTuple = AsyncStream.makeStream(
        of: SessionStateChange.self,
        bufferingPolicy: .bufferingNewest(Constants.streamBufferSize)
    )
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var elapsedTimeTimer: Timer?
    private var lastValidDistance: Double = 0
    private var lastDistanceUpdateTime: Date?
    private var isCountingDown: Bool = false
    private var isStarting: Bool = false
    
    private(set) var isAuthorized = false
    private(set) var authErrorMessage = ""
    
    public var showAuthAlert = false
    public var currentDisplayState: AppDisplayState {
        if isCountingDown { return .countdown }
        if isStarting { return .active }
        
        switch metrics.sessionState {
        case .notStarted, .prepared: return .idle
        case .running: return .active
        case .paused: return .paused
        case .ended, .stopped: return .summary
        @unknown default: return .idle
        }
    }
    
    public var isWorkoutActive: Bool {
        switch metrics.sessionState {
        case .running, .paused:
            return true
        default:
            return false
        }
    }
    
    public var onLocationAuthorizationChange: ((Bool) -> Void)?
    public var onWorkoutStateChange: ((HKWorkoutSessionState) -> Void)?
    public var onMetricsUpdate: ((WorkoutMetrics) -> Void)?
    
    public func updateCountingDownState(_ isCountingDown: Bool) {
        self.isCountingDown = isCountingDown
    }
    
    public func updateStartingState(_ isStarting: Bool) {
        self.isStarting = isStarting
    }
    
    public func updateAuthorizedState(_ isAuthorized: Bool) {
        self.isAuthorized = isAuthorized
    }
    
    private override init() {
        super.init()
        WorkoutLogger.info("WorkoutManager 초기화")
        resetWorkout()
        
        Task {
            WorkoutLogger.debug("SessionState 스트림 구독 시작")
            for await value in asyncStreamTuple.stream {
                WorkoutLogger.debug("SessionState 변경 수신: \(value.newState.rawValue)")
                await consumeSessionStateChange(value)
            }
        }
    }
    
    private func consumeSessionStateChange(_ change: SessionStateChange) async {
        WorkoutLogger.info("🔄 SessionState 처리: \(change.newState.rawValue) at \(change.date)")
        metrics.updateSessionState(change.newState)
        
        switch change.newState {
        case .notStarted:
            WorkoutLogger.debug("notStarted - 타이머 중지")
            stopElapsedTimeTimer()
        case .prepared:
            WorkoutLogger.debug("prepared - 준비 완료")
        case .running:
            WorkoutLogger.debug("running - 타이머 시작")
            startElapsedTimeTimer()
        case .paused:
            WorkoutLogger.debug("paused - 타이머 중지")
            stopElapsedTimeTimer()
        case .stopped:
            WorkoutLogger.info("stopped - 세션 종료 시작")
            stopElapsedTimeTimer()
            do {
                try await terminateWorkoutSession(builder, session, endDate: change.date)
                WorkoutLogger.info("세션 종료 완료")
            } catch {
                WorkoutLogger.error("세션 종료 실패: \(error.localizedDescription)")
            }
        case .ended:
            WorkoutLogger.debug("ended - 종료됨")
        @unknown default:
            WorkoutLogger.fault("올바르지 않은 상태")
            fatalError("올바르지 않은 상태")
        }
    }
    
    private func terminateWorkoutSession(_ builder: HKLiveWorkoutBuilder?, _ session: HKWorkoutSession?, endDate: Date) async throws {
        guard let builder, let session else {
            WorkoutLogger.warning("builder 또는 session이 nil - 종료 불가")
            throw WorkoutError.sessionNotActive
        }
        
        WorkoutLogger.info("Workout 종료 프로세스 시작")
        
        do {
            try await builder.endCollection(at: endDate)
            try await builder.finishWorkout()
            session.end()
            WorkoutLogger.info("Workout 종료 완료")
        } catch {
            WorkoutLogger.error("Workout 종료 중 오류 발생: \(error.localizedDescription)")
            session.end()
            throw error
        }
    }
    
    private func sendData(_ data: Data) async throws {
        guard let session = session else {
            WorkoutLogger.warning("세션 없음 - 데이터 전송 불가")
            throw WorkoutError.sessionNotActive
        }
        
        do {
            try await session.sendToRemoteWorkoutSession(data: data)
            WorkoutLogger.debug("데이터 전송 성공 (\(data.count) bytes)")
        } catch {
            WorkoutLogger.error("데이터 전송 실패: \(error.localizedDescription)")
            throw WorkoutError.dataSendingFailed
        }
    }
}

// MARK: - 운동 제어
extension WorkoutManager {
    
    public func prepareWorkout(with externalConfig: HKWorkoutConfiguration? = nil) async throws {
        WorkoutLogger.info("Workout prepare 요청")
        
        session?.end()
        resetWorkout()
        
        let configuration = externalConfig ?? {
            let config = HKWorkoutConfiguration()
            config.activityType = metrics.activityType
            config.locationType = metrics.locationType
            return config
        }()
        
        WorkoutLogger.debug("Configuration 설정 완료 - activityType: \(configuration.activityType.rawValue), locationType: \(configuration.locationType.rawValue)")
        
        do {
            WorkoutLogger.debug("HKWorkoutSession 생성 중...")
            session = try HKWorkoutSession(healthStore: healthStore, configuration: configuration)
            builder = session?.associatedWorkoutBuilder()
            session?.delegate = self
            builder?.delegate = self
            builder?.dataSource = HKLiveWorkoutDataSource(
                healthStore: healthStore,
                workoutConfiguration: configuration
            )
            WorkoutLogger.info("Session 및 Builder 생성 완료")
        } catch {
            WorkoutLogger.error("Session 생성 실패: \(error.localizedDescription)")
            throw WorkoutError.sessionCreationFailed
        }
        
        WorkoutLogger.debug("Session prepare 중...")
        session?.prepare()
        
        do {
            WorkoutLogger.debug("iPhone 미러링 시작 중...")
            try await session?.startMirroringToCompanionDevice()
            WorkoutLogger.info("미러링 시작 완료")
        } catch {
            WorkoutLogger.warning("미러링 시작 실패: \(error.localizedDescription)")
        }
    }
    
    // 워치 단독 실행 시 호출되는 카운트다운 포함 시작 함수 (추가됨)
    public func startWorkoutWithCountdown(seconds: Int = 3) async throws {
        WorkoutLogger.info("워치 단독 실행: \(seconds)초 카운트다운 시작")
        
        updateCountingDownState(true)
        
        do {
            try await Task.sleep(nanoseconds: UInt64(seconds) * 1_000_000_000)
        } catch {
            WorkoutLogger.warning("카운트다운 취소됨")
            updateCountingDownState(false)
            throw error
        }
        
        updateCountingDownState(false)
        try await startWorkout()
    }
    
    // 즉시 실행 함수 (모바일 요청 처리용)
    public func startWorkout() async throws {
        WorkoutLogger.info("Workout 시작 요청")
        
        if metrics.sessionState == .running {
            WorkoutLogger.warning("이미 운동이 진행 중입니다")
            throw WorkoutError.workoutAlreadyInProgress
        }
        
        guard let session = session, let builder = builder else {
            WorkoutLogger.error("준비된 세션이 없습니다.")
            throw WorkoutError.sessionCreationFailed
        }
        
        let startDate = Date.now
        session.startActivity(with: startDate)
        
        do {
            try await builder.beginCollection(at: startDate)
            WorkoutLogger.info("데이터 수집 시작 완료")
        } catch {
            WorkoutLogger.error("데이터 수집 시작 실패: \(error.localizedDescription)")
            throw WorkoutError.dataCollectionFailed
        }
        
        let initialSync = WorkoutInitialSync(
            workoutStartDate: startDate,
            currentElapsedTime: 0,
            totalPausedDuration: 0
        )
        
        metrics.setStartDate(startDate)
        
        guard let syncData = try? JSONEncoder().encode(initialSync) else {
            throw WorkoutError.dataEncodingFailed
        }
        
        do {
            try await sendData(syncData)
        } catch {
            WorkoutLogger.warning("초기 동기화 데이터 전송 실패 - 계속 진행")
        }
        
        WorkoutLogger.info("Workout 시작 프로세스 완료")
    }
    
    public func pauseWorkout() throws {
        guard let session = session else { throw WorkoutError.sessionNotActive }
        guard session.state == .running else { throw WorkoutError.invalidWorkoutState }
        session.pause()
    }
    
    public func resumeWorkout() throws {
        guard let session = session else { throw WorkoutError.sessionNotActive }
        guard session.state == .paused else { throw WorkoutError.invalidWorkoutState }
        session.resume()
    }
    
    public func endWorkout() throws {
        guard let session = session else { throw WorkoutError.sessionNotActive }
        guard session.state == .running || session.state == .paused else { throw WorkoutError.invalidWorkoutState }
        let endDate = Date.now
        metrics.setEndDate(endDate)
        session.stopActivity(with: endDate)
    }
    
    public func resetWorkout() {
        WorkoutLogger.info("Workout 리셋")
        metrics.reset()
        builder = nil
        session = nil
        stopElapsedTimeTimer()
        lastValidDistance = 0
        lastDistanceUpdateTime = nil
    }
}

// MARK: - 운동 경과 시간 처리
extension WorkoutManager {
    private func stopElapsedTimeTimer() {
        elapsedTimeTimer?.invalidate()
        elapsedTimeTimer = nil
    }
    
    private func startElapsedTimeTimer() {
        stopElapsedTimeTimer()
        metrics.updateElapsedTime(self.builder?.elapsedTime ?? 0)
        elapsedTimeTimer = Timer.scheduledTimer(
            withTimeInterval: Constants.timerInterval,
            repeats: true
        ) { [weak self] _ in
            guard let self = self else { return }
            Task { @MainActor in
                let elapsedTime = self.builder?.elapsedTime ?? 0
                self.metrics.updateElapsedTime(elapsedTime)
            }
        }
        elapsedTimeTimer?.tolerance = Constants.timerTolerance
        RunLoop.current.add(elapsedTimeTimer!, forMode: .common)
    }
}

// MARK: - 운동 권한 처리
extension WorkoutManager {
    public func requestHealthAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else {
            updateAuthStatus(false, "해당 기기에서는 건강 데이터를 사용할 수 없습니다.")
            throw WorkoutError.healthKitNotAvailable
        }
        
        if checkHealthKitWritePermission() {
            updateAuthStatus(true)
            return
        }
        
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
        
        do {
            try await healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead)
            for _ in 1...3 {
                if checkHealthKitWritePermission() {
                    updateAuthStatus(true)
                    return
                }
                try await Task.sleep(nanoseconds: 200_000_000)
            }
            throw WorkoutError.permissionDenied
        } catch {
            throw WorkoutError.permissionDenied
        }
    }
    
    public func checkHealthKitWritePermission() -> Bool {
        let status = healthStore.authorizationStatus(for: HKWorkoutType.workoutType())
        return status == .sharingAuthorized
    }
    
    func checkLocationPermission() -> Bool { return true }
    func requestLocationAuthorization() async {}
    
    func updateAuthStatus(_ status: Bool, _ message: String = "") {
        self.isAuthorized = status
        if !status && !message.isEmpty {
            self.authErrorMessage = message
            self.showAuthAlert = true
        }
    }
}

// MARK: - 운동 데이터 필터링 처리
extension WorkoutManager {
    private func processHealthKitStatistics(_ statistics: HKStatistics, for quantityType: HKQuantityType) {
        switch statistics.quantityType {
        case HKQuantityType(.heartRate): processHeartRate(statistics)
        case HKQuantityType(.activeEnergyBurned): processCalories(statistics)
        case HKQuantityType(.distanceWalkingRunning): processDistance(statistics)
        case HKQuantityType(.runningSpeed): processSpeed(statistics)
        default: return
        }
    }
    
    private func processHeartRate(_ statistics: HKStatistics) {
        let unit = HKUnit.count().unitDivided(by: .minute())
        let heartRate = statistics.mostRecentQuantity()?.doubleValue(for: unit) ?? 0
        let averageHeartRate = statistics.averageQuantity()?.doubleValue(for: unit) ?? 0
        metrics.updateHeartRate(heartRate)
        metrics.updateAverageHeartRate(averageHeartRate)
    }
    
    private func processCalories(_ statistics: HKStatistics) {
        let calories = statistics.sumQuantity()?.doubleValue(for: HKUnit.kilocalorie()) ?? 0
        metrics.updateCalories(calories)
    }
    
    private func processDistance(_ statistics: HKStatistics) {
        let distance = statistics.sumQuantity()?.doubleValue(for: HKUnit.meter()) ?? 0
        guard distance >= 0, distance >= lastValidDistance else { return }
        
        let increase = distance - lastValidDistance
        let now = Date.now
        let timeSinceLastUpdate = now.timeIntervalSince(lastDistanceUpdateTime ?? now)
        
        if timeSinceLastUpdate > 0 {
            let impliedSpeed = increase / timeSinceLastUpdate
            guard WorkoutMetrics.isValidSpeed(impliedSpeed) else { return }
        }
        
        guard increase < Constants.maxDistanceIncrease else { return }
        
        lastValidDistance = distance
        lastDistanceUpdateTime = now
        metrics.updateDistance(distance)
    }
    
    private func processSpeed(_ statistics: HKStatistics) {
        let speed = statistics.mostRecentQuantity()?.doubleValue(for: HKUnit.meter().unitDivided(by: .second())) ?? 0
        guard WorkoutMetrics.isValidSpeed(speed) else { return }
        
        let paceMinPerKm = WorkoutMetrics.calculatePaceBySpeed(from: speed)
        guard WorkoutMetrics.isCorrectPace(paceMinPerKm) else { return }
        
        if let prev = metrics.smoothedPace {
            metrics.updateSmoothedPace(metrics.smoothingFactor * paceMinPerKm + (1 - metrics.smoothingFactor) * prev)
        } else {
            metrics.updateSmoothedPace(paceMinPerKm)
        }
        
        metrics.updatePace(metrics.smoothedPace!)
    }
}

// MARK: - 델리게이터 처리
extension WorkoutManager: HKWorkoutSessionDelegate {
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        let sessionStateChange = SessionStateChange(newState: toState, date: date)
        asyncStreamTuple.continuation.yield(sessionStateChange)
    }
    
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        Task { @MainActor in WorkoutLogger.error("[Delegate] Session 에러: \(error.localizedDescription)") }
    }
    
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didDisconnectFromRemoteDeviceWithError error: Error?) { }
    
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didReceiveDataFromRemoteWorkoutSession data: [Data]) { }
}

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    nonisolated func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        Task { @MainActor in
            for type in collectedTypes {
                guard let quantityType = type as? HKQuantityType,
                      let statistics = workoutBuilder.statistics(for: quantityType) else { continue }
                processHealthKitStatistics(statistics, for: quantityType)
            }
            
            guard let payload = metrics.createPayload() else { return }
            do {
                try await sendData(payload)
            } catch {
                WorkoutLogger.error("데이터 전송 오류: \(error.localizedDescription)")
            }
        }
    }
    
    nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) { }
}
