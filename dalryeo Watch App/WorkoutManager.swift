// 애플워치 주도 워크아웃

import HealthKit

@MainActor
@Observable
class WorkoutManager: NSObject, WorkoutControlling {
  static let shared = WorkoutManager()
  
  private enum Constants {
    static let timerInterval: TimeInterval = 1.0
    static let timerTolerance: TimeInterval = 0.1
    static let streamBufferSize: Int = 1
    static let metersPerSecondToKmh: Double = 3.6
    
    // 속도 및 거리 임계값
    static let maxRealisticSpeed = WorkoutMetrics.Constants.maxRealisticSpeed
    static let highSpeedThreshold = WorkoutMetrics.Constants.highSpeedThreshold
    static let maxDistanceIncrease = WorkoutMetrics.Constants.maxDistanceIncrease
  }
  
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
      WorkoutLogger.debug("데이터 수집 종료 중...")
      try await builder.endCollection(at: endDate)
      
      WorkoutLogger.debug("Workout 저장 중...")
      try await builder.finishWorkout()
      
      WorkoutLogger.debug("세션 종료 중...")
      session.end()
      
      WorkoutLogger.info("Workout 종료 완료")
    } catch {
      WorkoutLogger.error("Workout 종료 중 오류 발생: \(error.localizedDescription)")
      WorkoutLogger.debug("강제 세션 종료")
      session.end()
      throw error
    }
  }
  
  // 미러링 아이폰으로 데이터 전달
  private func sendData(_ data: Data) async throws {
    guard let session = session else {
      WorkoutLogger.warning("세션 없음 - 데이터 전송 불가")
      throw WorkoutError.sessionNotActive
    }
    
    WorkoutLogger.debug("iPhone으로 데이터 전송 중... (\(data.count) bytes)")
    
    do {
      try await session.sendToRemoteWorkoutSession(data: data)
      WorkoutLogger.debug("데이터 전송 성공")
    } catch {
      WorkoutLogger.error("데이터 전송 실패: \(error.localizedDescription)")
      throw WorkoutError.dataSendingFailed
    }
  }
}

// MARK: - 운동 제어
extension WorkoutManager {
  public func startWorkout() async throws {
    WorkoutLogger.info("Workout 시작 요청")
    
    // 중복 시작 방지
    guard session == nil else {
      WorkoutLogger.warning("이미 운동이 진행 중입니다")
      throw WorkoutError.workoutAlreadyInProgress
    }
    
    resetWorkout()
    
    let startDate = Date.now
    WorkoutLogger.debug("시작 시간: \(startDate)")
    
    let configuration = HKWorkoutConfiguration()
    configuration.activityType = metrics.activityType
    configuration.locationType = metrics.locationType
    WorkoutLogger.debug("Configuration 설정 완료 - activityType: \(metrics.activityType.rawValue), locationType: \(metrics.locationType.rawValue)")
    
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
      // 미러링 실패는 치명적이지 않으므로 계속 진행
      // 단, 사용자에게 알려야 함
    }
    
    WorkoutLogger.debug("Activity 시작 중...")
    session?.startActivity(with: startDate)
    
    do {
      WorkoutLogger.debug("데이터 수집 시작 중...")
      try await builder?.beginCollection(at: startDate)
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
    WorkoutLogger.debug("시작 날짜 설정: \(startDate)")
    
    guard let syncData = try? JSONEncoder().encode(initialSync) else {
      WorkoutLogger.warning("초기 동기화 데이터 인코딩 실패")
      throw WorkoutError.dataEncodingFailed
    }
    
    do {
      WorkoutLogger.debug("초기 동기화 데이터 전송 중...")
      try await sendData(syncData)
    } catch {
      WorkoutLogger.warning("초기 동기화 데이터 전송 실패 - 계속 진행")
      // 초기 동기화 실패는 치명적이지 않음
    }
    
    WorkoutLogger.info("Workout 시작 프로세스 완료")
  }
  
  public func pauseWorkout() throws {
    guard let session = session else {
      WorkoutLogger.warning("세션 없음 - 일시정지 불가")
      throw WorkoutError.sessionNotActive
    }
    
    guard session.state == .running else {
      WorkoutLogger.warning("일시정지 불가 - 현재 상태: \(session.state.rawValue)")
      throw WorkoutError.invalidWorkoutState
    }
    
    WorkoutLogger.info("Workout 일시정지 요청")
    session.pause()
  }
  
  public func resumeWorkout() throws {
    guard let session = session else {
      WorkoutLogger.warning("세션 없음 - 재개 불가")
      throw WorkoutError.sessionNotActive
    }
    
    guard session.state == .paused else {
      WorkoutLogger.warning("재개 불가 - 현재 상태: \(session.state.rawValue)")
      throw WorkoutError.invalidWorkoutState
    }
    
    WorkoutLogger.info("Workout 재개 요청")
    session.resume()
  }
  
  public func endWorkout() throws {
    guard let session = session else {
      WorkoutLogger.warning("세션 없음 - 종료 불가")
      throw WorkoutError.sessionNotActive
    }
    
    guard session.state == .running || session.state == .paused else {
      WorkoutLogger.warning("종료 불가 - 현재 상태: \(session.state.rawValue)")
      throw WorkoutError.invalidWorkoutState
    }
    
    let endDate = Date.now
    WorkoutLogger.info("Workout 종료 요청 - endDate: \(endDate)")
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
    WorkoutLogger.debug("리셋 완료")
  }
}

// MARK: - 운동 경과 시간 처리
extension WorkoutManager {
  private func stopElapsedTimeTimer() {
    WorkoutLogger.debug("경과 시간 타이머 중지")
    elapsedTimeTimer?.invalidate()
    elapsedTimeTimer = nil
  }
  
  private func startElapsedTimeTimer() {
    WorkoutLogger.debug("경과 시간 타이머 시작")
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
    WorkoutLogger.info("경과 시간 타이머 시작 완료")
  }
}

// MARK: - 운동 권한 처리
extension WorkoutManager {
  public func requestHealthAuthorization() async throws  {
    guard HKHealthStore.isHealthDataAvailable() else {
      WorkoutLogger.error("HealthKit 사용 불가")
      throw WorkoutError.healthKitNotAvailable
    }
    
    WorkoutLogger.info("HealthKit 권한 요청 시작")
    
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
    
    WorkoutLogger.debug("요청 권한 - Write: \(typesToWrite.count)개, Read: \(typesToRead.count)개")
    
    do {
      WorkoutLogger.debug("권한 요청 중...")
      try await healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead)
      WorkoutLogger.info("HealthKit 권한 요청 완료")
    } catch {
      WorkoutLogger.error("HealthKit 권한 요청 실패: \(error.localizedDescription)")
      throw WorkoutError.permissionDenied
    }
  }
  
  /// HealthKit 쓰기 권한이 있는지 확인
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
  
  func checkLocationPermission() -> Bool {
    return true
  }
  
  func requestLocationAuthorization() async {}
}

// MARK: - 운동 데이터 필터링 처리
extension WorkoutManager {
  private func processHealthKitStatistics(
    _ statistics: HKStatistics,
    for quantityType: HKQuantityType
  ){
    WorkoutLogger.debug("통계 처리: \(quantityType.identifier)")
    
    switch statistics.quantityType {
    case HKQuantityType(.heartRate):
      processHeartRate(statistics)
    case HKQuantityType(.activeEnergyBurned):
      processCalories(statistics)
    case HKQuantityType(.distanceWalkingRunning):
      processDistance(statistics)
    case HKQuantityType(.runningSpeed):
      processSpeed(statistics)
    default:
      WorkoutLogger.debug("미처리 타입: \(quantityType.identifier)")
      return
    }
  }
  
  private func processHeartRate(_ statistics: HKStatistics) {
    let unit = HKUnit.count().unitDivided(by: .minute())
    let heartRate = statistics.mostRecentQuantity()?.doubleValue(for: unit) ?? 0
    let averageHeartRate = statistics.averageQuantity()?.doubleValue(for: unit) ?? 0
    
    WorkoutLogger.debug("심박수 - 현재: \(Int(heartRate)) bpm, 평균: \(Int(averageHeartRate)) bpm")
    
    metrics.updateHeartRate(heartRate)
    metrics.updateAverageHeartRate(averageHeartRate)
  }
  
  private func processCalories(_ statistics: HKStatistics) {
    let unit = HKUnit.kilocalorie()
    let calories = statistics.sumQuantity()?.doubleValue(for: unit) ?? 0
    
    WorkoutLogger.debug("칼로리: \(String(format: "%.1f", calories)) kcal")
    
    metrics.updateCalories(calories)
  }
  
  private func processDistance(_ statistics: HKStatistics) {
    let unit = HKUnit.meter()
    let distance = statistics.sumQuantity()?.doubleValue(for: unit) ?? 0
    
    guard distance >= 0 else {
      WorkoutLogger.warning("음수 거리 무시: \(distance)")
      return
    }
    guard distance >= lastValidDistance else {
      WorkoutLogger.warning("거리 감소 무시: \(distance) < \(lastValidDistance)")
      return
    }
    
    let increase = distance - lastValidDistance
    let now = Date.now
    let timeSinceLastUpdate = now.timeIntervalSince(lastDistanceUpdateTime ?? now)
    
    // 속도 기반 검증
    if timeSinceLastUpdate > 0 {
      let impliedSpeed = increase / timeSinceLastUpdate
      
      guard WorkoutMetrics.isValidSpeed(impliedSpeed) else {
        let kmh = impliedSpeed * Constants.metersPerSecondToKmh
        WorkoutLogger.warning("[Watch] 비현실적인 속도 무시: \(String(format: "%.1f", impliedSpeed)) m/s (\(String(format: "%.1f", kmh)) km/h)")
        return
      }
      
      if WorkoutMetrics.isHighSpeed(impliedSpeed) {
        let kmh = impliedSpeed * Constants.metersPerSecondToKmh
        WorkoutLogger.debug("[Watch] 높은 속도 감지: \(String(format: "%.1f", impliedSpeed)) m/s (\(String(format: "%.1f", kmh)) km/h)")
      }
    }
    
    // 거리 절대값 체크
    guard increase < Constants.maxDistanceIncrease else {
      WorkoutLogger.warning("비정상 증가 무시: \(String(format: "%.1f", increase))m")
      return
    }
    
    lastValidDistance = distance
    lastDistanceUpdateTime = now
    
    WorkoutLogger.debug("거리 업데이트 - 증가: +\(String(format: "%.1f", increase))m, 누적: \(String(format: "%.1f", distance))m")
    
    metrics.updateDistance(distance)
  }
  
  private func processSpeed(_ statistics: HKStatistics) {
    let unit = HKUnit.meter().unitDivided(by: .second())
    let speed = statistics.mostRecentQuantity()?.doubleValue(for: unit) ?? 0
    
    WorkoutLogger.debug("속도: \(String(format: "%.2f", speed)) m/s")
    
    guard WorkoutMetrics.isValidSpeed(speed) else {
      WorkoutLogger.warning("비현실적인 속도 무시: \(String(format: "%.2f", speed)) m/s")
      return
    }
    
    let paceMinPerKm = WorkoutMetrics.calculatePaceBySpeed(from: speed)
    
    guard WorkoutMetrics.isCorrectPace(paceMinPerKm) else {
      WorkoutLogger.debug("비정상 페이스 무시: \(String(format: "%.2f", paceMinPerKm)) min/km")
      return
    }
    
    if let prev = metrics.smoothedPace {
      metrics.updateSmoothedPace(metrics.smoothingFactor * paceMinPerKm + (1 - metrics.smoothingFactor) * prev)
      WorkoutLogger.debug("페이스 스무딩 - 원본: \(String(format: "%.2f", paceMinPerKm)), 스무딩: \(String(format: "%.2f", metrics.smoothedPace!)) min/km")
    } else {
      metrics.updateSmoothedPace(paceMinPerKm)
      WorkoutLogger.debug("페이스 초기화: \(String(format: "%.2f", paceMinPerKm)) min/km")
    }
    
    metrics.updatePace(metrics.smoothedPace!)
  }
}

// MARK: - 델리게이터 처리
extension WorkoutManager: HKWorkoutSessionDelegate {
  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession,
                                  didChangeTo toState: HKWorkoutSessionState,
                                  from fromState: HKWorkoutSessionState,
                                  date: Date) {
    Task { @MainActor in
      WorkoutLogger.info("[Delegate] Session 상태 변경: \(fromState.rawValue) → \(toState.rawValue)")
    }
    let sessionStateChange = SessionStateChange(newState: toState, date: date)
    asyncStreamTuple.continuation.yield(sessionStateChange)
  }
  
  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession,
                                  
                                  didFailWithError error: Error) {
    Task { @MainActor in
      
      WorkoutLogger.error("[Delegate] Session 에러: \(error.localizedDescription)")
    }
    
    
    Task { @MainActor in
      // 에러 상태 처리 - UI에 알림
      // 예: 세션이 실패하면 사용자에게 알림
    }
  }
  
  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession,
                                  didDisconnectFromRemoteDeviceWithError error: Error?) {
    if let error = error {
      Task { @MainActor in
        WorkoutLogger.error("[Delegate] 원격 기기 연결 끊김 (에러): \(error.localizedDescription)")
      }
      
    } else {
      
      Task { @MainActor in
        WorkoutLogger.warning("[Delegate] 원격 기기 연결 끊김")
      }
      
    }
    
    Task { @MainActor in
      // 연결 끊김 처리
      // 사용자에게 알림 또는 재연결 시도
    }
  }
  
  /// iPhone에서 온 원격 제어 명령 수신
  nonisolated func workoutSession(_ workoutSession: HKWorkoutSession,
                                  didReceiveDataFromRemoteWorkoutSession data: [Data]) {
    
    Task { @MainActor in
      WorkoutLogger.debug("[Delegate] 원격 데이터 수신: \(data.count)개, 총 \(data.reduce(0) { $0 + $1.count }) bytes")
    }
    // 원격 제어 명령 처리
    // 예: iPhone에서 보낸 제어 명령 파싱 및 실행
  }
}

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
  nonisolated func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder,
    didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    
    
    Task { @MainActor in
      WorkoutLogger.debug("[Delegate] 데이터 수집됨: \(collectedTypes.count)개 타입")
      for type in collectedTypes {
        guard let quantityType = type as? HKQuantityType,
              let statistics = workoutBuilder.statistics(for: quantityType) else {
          WorkoutLogger.debug("비 Quantity 타입 또는 통계 없음: \(type.identifier)")
          continue
        }
        
        processHealthKitStatistics(statistics, for: quantityType)
      }
      
      guard let payload = metrics.createPayload() else {
        WorkoutLogger.warning("페이로드 생성 실패")
        return
      }
      
      do {
        WorkoutLogger.debug("메트릭 페이로드 생성 및 전송: \(payload.count) bytes")
        try await sendData(payload)
      } catch WorkoutError.sessionNotActive {
        WorkoutLogger.warning("세션 비활성 - 데이터 전송 스킵")
      } catch WorkoutError.dataSendingFailed {
        WorkoutLogger.error("데이터 전송 실패 - iPhone 연결 확인 필요")
      } catch {
        WorkoutLogger.error("예상치 못한 데이터 전송 오류: \(error.localizedDescription)")
      }
    }
  }
  
  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
    Task { @MainActor in
      WorkoutLogger.debug("[Delegate] 이벤트 수집됨: \(workoutBuilder.workoutEvents.count)개")
    }
  }
}
