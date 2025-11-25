// 아이폰이 주체가 되는 워크아웃 매니저

import HealthKit
import CoreLocation

@MainActor
class WorkoutManager: NSObject, WorkoutControlling {
    private enum Constants {
        // 타이머 관련
        static let timerInterval: TimeInterval = 1.0
        static let timerTolerance: TimeInterval = 0.1
        // GPS 관련
        static let gpsDistanceFilter: Double = 2.0
        static let locationAccuracyThreshold: Double = 50.0
        static let maxRealisticSpeed = WorkoutMetrics.Constants.maxRealisticSpeed
        static let highSpeedThreshold = WorkoutMetrics.Constants.highSpeedThreshold
        static let maxDistanceIncrease = WorkoutMetrics.Constants.maxDistanceIncrease
        static let minimumDistanceThreshold = WorkoutMetrics.Constants.minimumDistanceThreshold
        // HealthKit 샘플 저장 주기 (50m)
        static let sampleDistanceInterval: Double = 50.0
        // 에러 모니터링
        static let locationSaveFailureWarningThreshold: Int = 10
        // 권한 요청 대기 시간 (1초)
        static let authorizationWaitTimeNanoseconds: UInt64 = 1_000_000_000
    }
    
    private(set) var metrics = WorkoutMetrics()
    private let healthStore = HKHealthStore()
    private let locationManager = CLLocationManager()
    private var workoutBuilder: HKWorkoutBuilder?
    private var routeBuilder: HKWorkoutRouteBuilder?
    private var totalPausedDuration: TimeInterval = 0
    private var elapsedTimeTimer: Timer?
    private var pausedTime: Date?
    /// 마지막 위치 (거리 계산용)
    private var lastLocation: CLLocation?
    /// 위치 저장 실패 카운터 (모니터링용)
    private var locationSaveFailureCount = 0
    /// 총 위치 포인트 수 (통계용)
    private var totalLocationPoints = 0
    /// 마지막으로 샘플을 추가한 시간
    private var lastSampleTime: Date?
    /// 마지막 샘플 이후 누적된 거리 (미터)
    private var distanceSinceLastSample: Double = 0
    /// 마지막 샘플 이후 누적된 칼로리 (킬로칼로리)
    private var caloriesSinceLastSample: Double = 0
    
    public func hasAllPermissions() -> Bool {
        let hasHealthKit = checkHealthKitWritePermission()
        let hasLocation = checkLocationPermission()
        
        WorkoutLogger.info("권한 상태 - HealthKit: \(hasHealthKit), Location: \(hasLocation)")
        
        return hasHealthKit && hasLocation
    }
    
    /// 위치 권한 변경 콜백
    public var onLocationAuthorizationChange: ((Bool) -> Void)?
    /// 운동 상태 변경 콜백
    public var onWorkoutStateChange: ((HKWorkoutSessionState) -> Void)?
    /// 운동 데이터 업데이트 콜백
    public var onMetricsUpdate: ((WorkoutMetrics) -> Void)?
    
    override init() {
        super.init()
        self.setupLocationManager()
        
        metrics.onWorkoutStateChange = { [weak self] state in
            guard let self = self else { return }
            
            self.onWorkoutStateChange?(state)
        }
        
        metrics.onMetricsUpdate = { [weak self] state in
            guard let self = self else { return }
            
            self.onMetricsUpdate?(state)
        }
    }
}

// MARK: - 운동 제어
extension WorkoutManager {
    public func startWorkout() async throws {
        WorkoutLogger.info("운동 시작 요청")
        
        // 권한 확인
        guard checkHealthKitWritePermission() else {
            WorkoutLogger.error("HealthKit 권한 없음")
            throw WorkoutError.healthKitPermissionDenied
        }
        
        guard checkLocationPermission() else {
            WorkoutLogger.error("위치 권한 없음")
            throw WorkoutError.locationPermissionDenied
        }
        
        guard metrics.sessionState == .notStarted else {
            WorkoutLogger.warning("이미 운동이 진행 중입니다")
            throw WorkoutError.workoutAlreadyInProgress
        }
        
        resetWorkout()
        
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = metrics.activityType
        configuration.locationType = metrics.locationType
        
        workoutBuilder = HKWorkoutBuilder(
            healthStore: healthStore,
            configuration: configuration,
            device: .local()
        )
        
        if let builder = workoutBuilder?.seriesBuilder(for: .workoutRoute()) as? HKWorkoutRouteBuilder {
            routeBuilder = builder
            WorkoutLogger.info("경로 빌더 생성 성공 (seriesBuilder 방식)")
        } else {
            WorkoutLogger.warning("경로 빌더 생성 실패 - 경로 저장 불가")
        }
        
        let startDate = Date.now
        metrics.setStartDate(startDate)
        
        // 일시정지 관련 변수 초기화
        totalPausedDuration = 0
        pausedTime = nil
        
        do {
            try await workoutBuilder?.beginCollection(at: startDate)
            WorkoutLogger.info("HealthKit 데이터 수집 시작")
        } catch {
            WorkoutLogger.error("데이터 수집 시작 실패: \(error.localizedDescription)")
            throw error
        }
        
        locationManager.startUpdatingLocation()
        WorkoutLogger.info("GPS 추적 시작")
        
        metrics.updateSessionState(.running)
        
        startElapsedTimeTimer()
        
        WorkoutLogger.notice("운동 시작 완료! 시작 시간: \(startDate)")
    }
    
    public func pauseWorkout() throws {
        guard metrics.sessionState == .running else {
            WorkoutLogger.warning("일시정지 불가 - 현재 상태: \(self.metrics.sessionState.rawValue)")
            throw WorkoutError.invalidWorkoutState
        }
        
        guard pausedTime == nil else {
            WorkoutLogger.warning("이미 일시정지 상태입니다")
            throw WorkoutError.invalidWorkoutState
        }
        
        WorkoutLogger.info("운동 일시정지")
        
        // 1. 일시정지 시작 시간 기록
        pausedTime = Date.now
        
        // 2. 위치 추적 중지 (배터리 절약)
        locationManager.stopUpdatingLocation()
        
        let pauseEvent = HKWorkoutEvent(type: .pause,
                                        dateInterval: DateInterval(start: pausedTime ?? Date.now, duration: 0),
                                        metadata: nil)
        
        if let builder = workoutBuilder {
            Task {
                do {
                    try await builder.addWorkoutEvents([pauseEvent])
                    WorkoutLogger.info("Pause 이벤트 HealthKit에 추가 완료")
                } catch {
                    WorkoutLogger.error("Pause 이벤트 추가 실패: \(error.localizedDescription)")
                }
            }
        }
        
        stopElapsedTimeTimer()
        
        // 3. 상태 변경
        metrics.updateSessionState(.paused)
        
        WorkoutLogger.debug("일시정지 완료 - 시작 시간: \(self.pausedTime!)")
    }
    
    public func resumeWorkout() throws {
        guard metrics.sessionState == .paused else {
            WorkoutLogger.warning("재개 불가 - 현재 상태: \(self.metrics.sessionState.rawValue)")
            throw WorkoutError.invalidWorkoutState
        }
        
        guard let pausedTime = pausedTime else {
            WorkoutLogger.warning("일시정지 상태가 아닙니다")
            throw WorkoutError.invalidWorkoutState
        }
        
        WorkoutLogger.info("운동 재개")
        
        // 1. 이번 일시정지 구간의 시간 계산
        let pauseDuration = Date.now.timeIntervalSince(pausedTime)
        
        // 2. 총 일시정지 시간에 누적
        totalPausedDuration += pauseDuration
        
        // 3. 일시정지 상태 해제
        self.pausedTime = nil
        
        lastLocation = nil
        WorkoutLogger.info("lastLocation 리셋 완료 - 재개 후 첫 위치부터 거리 계산 시작")
        
        // 4. 위치 추적 재개
        locationManager.startUpdatingLocation()
        
        let resumeEvent = HKWorkoutEvent(
            type: .resume,
            dateInterval: DateInterval(start: Date(), duration: 0),
            metadata: nil
        )
        
        if let builder = workoutBuilder {
            Task {
                do {
                    try await builder.addWorkoutEvents([resumeEvent])
                    WorkoutLogger.info("Resume 이벤트 HealthKit에 추가 완료")
                } catch {
                    WorkoutLogger.error("Resume 이벤트 추가 실패: \(error.localizedDescription)")
                }
            }
        }
        
        // 5. 타이머 재시작 (중지했었다면)
        if elapsedTimeTimer == nil {
            startElapsedTimeTimer()
        }
        
        // 6. 상태 변경
        metrics.updateSessionState(.running)
        
        WorkoutLogger.info("""
            재개 완료
               - 이번 일시정지: \(String(format: "%.1f", pauseDuration))초
               - 총 일시정지: \(String(format: "%.1f", self.totalPausedDuration))초
            """)
    }
    
    public func endWorkout() async throws {
        WorkoutLogger.info("운동 종료 요청")
        
        guard metrics.sessionState == .running || metrics.sessionState == .paused else {
            WorkoutLogger.error("종료 불가 - 활성화된 운동 없음")
            throw WorkoutError.noActiveWorkout
        }
        
        // 일시정지 상태였다면 마지막 일시정지 시간도 누적
        if let pausedTime = pausedTime {
            let pauseDuration = Date().timeIntervalSince(pausedTime)
            totalPausedDuration += pauseDuration
            self.pausedTime = nil
            WorkoutLogger.debug("종료 시 마지막 일시정지 시간 누적: \(pauseDuration)초")
        }
        
        locationManager.stopUpdatingLocation()
        stopElapsedTimeTimer()
        
        let endDate = Date.now
        
        WorkoutLogger.debug("최종 통계 - 거리: \(self.metrics.distance), 시간: \(self.metrics.elapsedTime), 칼로리: \(self.metrics.calories)")
        
        guard let builder = workoutBuilder else {
            WorkoutLogger.error("운동 빌더가 초기화되지 않음")
            throw WorkoutError.builderNotInitialized
        }
        
        // 마지막 샘플 저장
        if distanceSinceLastSample > 0 || caloriesSinceLastSample > 0 {
            let sampleStartTime = lastSampleTime ?? metrics.startDate ?? Date.now
            
            do {
                if distanceSinceLastSample > 0 {
                    try await addDistanceSample(
                        distance: distanceSinceLastSample,
                        startDate: sampleStartTime,
                        endDate: endDate
                    )
                    WorkoutLogger.info("마지막 거리 샘플 저장: \(self.distanceSinceLastSample)m")
                }
                
                if caloriesSinceLastSample > 0 {
                    try await addCalorieSample(
                        calories: caloriesSinceLastSample,
                        startDate: sampleStartTime,
                        endDate: endDate
                    )
                    WorkoutLogger.info("마지막 칼로리 샘플 저장: \(self.caloriesSinceLastSample)kcal")
                }
            } catch {
                WorkoutLogger.error("마지막 샘플 저장 실패: \(error.localizedDescription)")
                // 마지막 샘플 저장 실패는 치명적이지 않으므로 계속 진행
            }
        }
        
        do {
            try await builder.endCollection(at: endDate)
            WorkoutLogger.info("데이터 수집 종료")
        } catch {
            WorkoutLogger.error("데이터 수집 종료 실패: \(error.localizedDescription)")
            throw error
        }
        
        guard let workout = try await builder.finishWorkout() else {
            WorkoutLogger.error("운동 생성 실패")
            throw WorkoutError.workoutCreationFailed
        }
        
        metrics.setEndDate(endDate)
        metrics.updateSessionState(.ended)
        
        WorkoutLogger.notice("""
            운동 저장 완료!
               - 운동 ID: \(workout.uuid)
               - 총 시간: \(String(format: "%.1f", workout.duration))초
               - 일시정지 시간: \(String(format: "%.1f", self.totalPausedDuration))초
               - 실제 운동 시간: \(String(format: "%.1f", self.metrics.elapsedTime))초
               - 거리: \(self.metrics.distance)
               - 칼로리: \(self.metrics.calories)
               - 총 위치 포인트: \(self.totalLocationPoints)개
               - 위치 저장 실패: \(self.locationSaveFailureCount)회
            """)
    }
    
    public func resetWorkout() {
        metrics.reset()
        stopElapsedTimeTimer()
        workoutBuilder = nil
        routeBuilder = nil
        lastLocation = nil
        locationSaveFailureCount = 0
        totalLocationPoints = 0
        distanceSinceLastSample = 0
        caloriesSinceLastSample = 0
        lastSampleTime = nil
        totalPausedDuration = 0
        pausedTime = nil
    }
}

// MARK: - GPS 운동 처리
extension WorkoutManager {
    /// 위치 권한이 있는지 확인
    public func checkLocationPermission() -> Bool {
        let status = locationManager.authorizationStatus
        
        switch status {
        case .authorizedAlways, .authorizedWhenInUse:
            WorkoutLogger.info("위치 권한 있음")
            return true
        case .denied, .restricted:
            WorkoutLogger.warning("위치 권한 거부됨 또는 제한됨")
            return false
        case .notDetermined:
            WorkoutLogger.info("위치 권한 상태 미정")
            return false
        @unknown default:
            WorkoutLogger.warning("위치 알 수 없는 권한 상태")
            return false
        }
    }
    
    /// 위치 권한 요청
    public func requestLocationAuthorization() async {
        let status = locationManager.authorizationStatus
        
        WorkoutLogger.debug("현재 위치 권한 상태: \(status.rawValue)")
        
        if status == .notDetermined {
            WorkoutLogger.info("위치 권한 요청 중...")
            locationManager.requestWhenInUseAuthorization()
            try? await Task.sleep(nanoseconds: Constants.authorizationWaitTimeNanoseconds)
        }
        
        WorkoutLogger.info("위치 권한 요청 완료")
    }
    
    private func setupLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .fitness
        locationManager.distanceFilter = Constants.gpsDistanceFilter
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        
        WorkoutLogger.debug("위치 관리자 설정 완료")
    }
    
    /// 위치 정확도 검증
    private func validateLocationAccuracy(_ location: CLLocation) -> Bool {
        // horizontalAccuracy가 음수면 무효한 데이터
        guard location.horizontalAccuracy >= 0 else {
            WorkoutLogger.warning("무효한 위치 데이터 (정확도 음수)")
            return false
        }
        
        // 임계값 이상의 오차는 GPS 신호 약함
        guard location.horizontalAccuracy < Constants.locationAccuracyThreshold else {
            WorkoutLogger.debug("위치 정확도 낮음: \(String(format: "%.1f", location.horizontalAccuracy))m")
            return false
        }
        
        return true
    }
    
    private func updateUIMetrics(distance: Double, location: CLLocation, lastLocation: CLLocation) {
        // 거리 추가
        metrics.addDistance(distance)
        
        // 페이스 계산
        let timeDiff = location.timestamp.timeIntervalSince(lastLocation.timestamp)
        if timeDiff > 0 && distance > 0 {
            let paceMinPerKm = WorkoutMetrics.calculatePaceByGPS(timeDiff, distance)
            
            guard WorkoutMetrics.isCorrectPace(paceMinPerKm) else {
                WorkoutLogger.debug("비정상 페이스 무시: \(String(format: "%.2f", paceMinPerKm)) min/km")
                return
            }
            
            // 지수 이동 평균 로직
            if let prev = metrics.smoothedPace {
                metrics.updateSmoothedPace(metrics.smoothingFactor * paceMinPerKm + (1 - metrics.smoothingFactor) * prev)
                WorkoutLogger.debug("페이스 스무딩 - 원본: \(String(format: "%.2f", paceMinPerKm)), 스무딩: \(String(format: "%.2f", metrics.smoothedPace!)) min/km")
            } else {
                metrics.updateSmoothedPace(paceMinPerKm)
                WorkoutLogger.debug("페이스 초기화: \(String(format: "%.2f", paceMinPerKm)) min/km")
            }
            
            metrics.updatePace(metrics.smoothedPace!)
        }
        
        // 칼로리 계산
        let calories = distance * metrics.caloriesPerMeter
        metrics.addCalories(calories)
        
        WorkoutLogger.debug("메트릭 업데이트 - 거리: +\(String(format: "%.1f", distance))m, 누적: \(self.metrics.distance)")
    }
    
    private func processLocation(_ location: CLLocation) {
        // 1단계: 위치 정확도 검증
        guard validateLocationAccuracy(location) else {
            WorkoutLogger.debug("위치 정확도가 낮아서 무시")
            return
        }
        
        // 2단계: 첫 위치인지 확인
        guard let lastLoc = lastLocation else {
            lastLocation = location
            lastSampleTime = location.timestamp
            saveLocationToHealthKit(location)
            totalLocationPoints += 1
            WorkoutLogger.debug("첫 위치 기록 - 기준점 설정 (\(location.coordinate.latitude), \(location.coordinate.longitude))")
            return
        }
        
        // 3단계: 거리 및 시간 계산
        let distance = location.distance(from: lastLoc)
        let timeDiff = location.timestamp.timeIntervalSince(lastLoc.timestamp)
        
        // 4단계: 최소 거리 체크 (GPS 떨림 방지)
        guard distance >= Constants.minimumDistanceThreshold else {
            WorkoutLogger.debug("거리가 너무 작음 \(String(format: "%.2f", distance))m - 무시 (GPS 떨림)")
            return
        }
        
        // 5단계: 속도 기반 검증 (애플워치와 동일)
        if timeDiff > 0 {
            let impliedSpeed = distance / timeDiff
            
            guard WorkoutMetrics.isValidSpeed(impliedSpeed) else {
                let kmh = impliedSpeed * 3.6
                WorkoutLogger.warning("[iPhone] 비현실적인 속도 무시: \(String(format: "%.1f", impliedSpeed)) m/s (\(String(format: "%.1f", kmh)) km/h)")
                return
            }
            
            if WorkoutMetrics.isHighSpeed(impliedSpeed) {
                let kmh = impliedSpeed * 3.6
                WorkoutLogger.debug("[iPhone] 높은 속도 감지: \(String(format: "%.1f", impliedSpeed)) m/s (\(String(format: "%.1f", kmh)) km/h)")
            }
        }
        
        // 6단계: 거리 절대값 체크 (극단적 오류 방지)
        guard distance < Constants.maxDistanceIncrease else {
            WorkoutLogger.warning("비정상 증가 무시: \(String(format: "%.1f", distance))m")
            return
        }
        
        // 7단계: 모든 검증 통과 - 저장 및 업데이트
        saveLocationToHealthKit(location)
        updateUIMetrics(distance: distance, location: location, lastLocation: lastLoc)
        accumulateAndSaveSamples(distance: distance, location: location)
        
        lastLocation = location
        totalLocationPoints += 1
    }
}

// MARK: - HealthKit 처리
extension WorkoutManager {
    public func requestHealthAuthorization() async throws {
        WorkoutLogger.info("권한 요청 시작")
        
        guard HKHealthStore.isHealthDataAvailable() else {
            WorkoutLogger.error("HealthKit을 사용할 수 없는 기기")
            throw WorkoutError.healthKitNotAvailable
        }
        
        let typesToShare: Set<HKSampleType> = [
            HKWorkoutType.workoutType(),
            HKSeriesType.workoutRoute(),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.heartRate)
        ]
        
        let typesToRead: Set<HKObjectType> = [
            HKWorkoutType.workoutType(),
            HKSeriesType.workoutRoute(),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.heartRate)
        ]
        
        try await healthStore.requestAuthorization(toShare: typesToShare, read: typesToRead)
        WorkoutLogger.info("HealthKit 권한 요청 완료")
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
    
    private func saveLocationToHealthKit(_ location: CLLocation) {
        guard let routeBuilder = routeBuilder else {
            WorkoutLogger.error("routeBuilder 없음")
            return
        }
        
        Task { [weak self] in
            do {
                try await routeBuilder.insertRouteData([location])
                WorkoutLogger.debug("위치 저장 성공: (\(location.coordinate.latitude), \(location.coordinate.longitude))")
            } catch {
                self?.locationSaveFailureCount += 1
                WorkoutLogger.error("위치 저장 실패 (\(self?.locationSaveFailureCount ?? 0)회): \(error.localizedDescription)")
                
                if let count = self?.locationSaveFailureCount, count >= Constants.locationSaveFailureWarningThreshold {
                    WorkoutLogger.error("GPS 데이터 저장에 문제가 있습니다. 경로가 정확하지 않을 수 있습니다.")
                }
            }
        }
    }
    
    private func accumulateAndSaveSamples(distance: Double, location: CLLocation) {
        let calories = distance * metrics.caloriesPerMeter
        caloriesSinceLastSample += calories
        distanceSinceLastSample += distance
        
        // 샘플 간격 도달 시 저장
        if distanceSinceLastSample >= Constants.sampleDistanceInterval {
            let sampleStartTime = lastSampleTime ?? metrics.startDate ?? Date()
            let sampleEndTime = location.timestamp
            
            let distanceToSave = distanceSinceLastSample
            let caloriesToSave = caloriesSinceLastSample
            
            Task { [weak self] in
                guard let self = self else { return }
                
                do {
                    // 거리 샘플 저장
                    try await self.addDistanceSample(
                        distance: distanceToSave,
                        startDate: sampleStartTime,
                        endDate: sampleEndTime
                    )
                    
                    // 칼로리 샘플 저장
                    try await self.addCalorieSample(
                        calories: caloriesToSave,
                        startDate: sampleStartTime,
                        endDate: sampleEndTime
                    )
                    
                    // 성공 시에만 메인 스레드에서 누적값 리셋
                    await MainActor.run {
                        self.distanceSinceLastSample = 0
                        self.caloriesSinceLastSample = 0
                        self.lastSampleTime = sampleEndTime
                    }
                    
                    WorkoutLogger.info("HealthKit 샘플 저장 완료 - 거리: \(String(format: "%.1f", distanceToSave))m, 칼로리: \(String(format: "%.1f", caloriesToSave))kcal")
                    
                } catch {
                    WorkoutLogger.error("HealthKit 샘플 추가 실패: \(error.localizedDescription)")
                    // 실패해도 누적값은 유지 (다음 기회에 다시 시도)
                    // 다음에 샘플 간격을 넘어가면 더 큰 값으로 저장됨
                }
            }
        }
    }
    
    private func addDistanceSample(distance: Double, startDate: Date, endDate: Date) async throws {
        guard let builder = workoutBuilder else {
            WorkoutLogger.warning("WorkoutBuilder가 없어서 거리 샘플을 추가할 수 없음")
            return
        }
        
        guard distance > 0 else {
            WorkoutLogger.debug("거리가 0이므로 샘플 추가 스킵")
            return
        }
        
        let distanceType = HKQuantityType(.distanceWalkingRunning)
        let distanceQuantity = HKQuantity(unit: .meter(), doubleValue: distance)
        
        let distanceSample = HKQuantitySample(
            type: distanceType,
            quantity: distanceQuantity,
            start: startDate,
            end: endDate,
            metadata: [
                HKMetadataKeyIndoorWorkout: metrics.locationType == .indoor
            ]
        )
        
        try await builder.addSamples([distanceSample])
        WorkoutLogger.debug("거리 샘플 추가 성공: \(distance)m")
    }
    
    private func addCalorieSample(calories: Double, startDate: Date, endDate: Date) async throws {
        guard let builder = workoutBuilder else {
            return
        }
        
        guard calories > 0 else {
            return
        }
        
        let calorieType = HKQuantityType(.activeEnergyBurned)
        let calorieQuantity = HKQuantity(unit: .kilocalorie(), doubleValue: calories)
        
        let calorieSample = HKQuantitySample(
            type: calorieType,
            quantity: calorieQuantity,
            start: startDate,
            end: endDate
        )
        
        try await builder.addSamples([calorieSample])
        WorkoutLogger.debug("칼로리 샘플 추가 성공: \(calories)kcal")
    }
}

// MARK: - 타이머 처리
extension WorkoutManager {
    /// 1초마다 경과 시간 업데이트하는 타이머 시작
    func startElapsedTimeTimer() {
        elapsedTimeTimer?.invalidate()
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
        WorkoutLogger.debug("타이머 시작")
    }
    
    /// 타이머 중지
    func stopElapsedTimeTimer() {
        elapsedTimeTimer?.invalidate()
        elapsedTimeTimer = nil
        WorkoutLogger.debug("타이머 중지")
    }
    
    /// 일시정지 시간을 제외한 실제 운동 시간을 계산합니다
    private func updateElapsedTime() {
        Task { @MainActor in
            guard let startDate = metrics.startDate else { return }
            let now = Date.now
            
            // 1. 전체 경과 시간 계산 (시작부터 현재까지)
            let totalElapsed = now.timeIntervalSince(startDate)
            
            // 2. 현재 일시정지 중이라면, 현재 일시정지 구간의 시간도 계산
            var currentPauseDuration: TimeInterval = 0
            if let pausedTime = pausedTime {
                currentPauseDuration = now.timeIntervalSince(pausedTime)
            }
            
            // 3. 실제 운동 시간 = 전체 시간 - (이전 일시정지들의 합 + 현재 일시정지)
            let actualElapsed = totalElapsed - (totalPausedDuration + currentPauseDuration)
            
            // 4. UI 업데이트
            metrics.updateElapsedTime(actualElapsed)
            
            WorkoutLogger.debug("""
                 시간 업데이트:
                    - 전체 경과: \(String(format: "%.1f", totalElapsed))초
                    - 총 일시정지: \(String(format: "%.1f", totalPausedDuration))초
                    - 현재 일시정지: \(String(format: "%.1f", currentPauseDuration))초
                    - 실제 운동: \(String(format: "%.1f", actualElapsed))초
                 """)
        }
    }
}

// MARK: - 델리게이터 처리
extension WorkoutManager: CLLocationManagerDelegate {
    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didUpdateLocations locations: [CLLocation]
    ) {
        guard let location = locations.last else { return }
        
        Task { @MainActor in
            guard metrics.sessionState == .running else { return }
            processLocation(location)
        }
        
    }
    
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let hasPermission: Bool
        let status = manager.authorizationStatus
        
        WorkoutLogger.info("위치 권한 변경: \(status.rawValue)")
        
        switch status {
        case .authorizedAlways:
            WorkoutLogger.info("위치 권한: 항상 허용")
            hasPermission = true
        case .authorizedWhenInUse:
            WorkoutLogger.info("위치 권한: 사용 중 허용")
            hasPermission = true
        case .denied:
            WorkoutLogger.error("위치 권한: 거부됨")
            hasPermission = false
        case .restricted:
            WorkoutLogger.error("위치 권한: 제한됨")
            hasPermission = false
        case .notDetermined:
            WorkoutLogger.debug("위치 권한: 미결정")
            hasPermission = false
        @unknown default:
            WorkoutLogger.warning("알 수 없는 위치 권한 상태")
            hasPermission = false
        }
        
        Task { @MainActor in
            onLocationAuthorizationChange?(hasPermission)
        }
    }
    
    nonisolated func locationManager(
        _ manager: CLLocationManager,
        didFailWithError error: Error
    ) {
        WorkoutLogger.error("위치 에러: \(error.localizedDescription)")
    }
}
