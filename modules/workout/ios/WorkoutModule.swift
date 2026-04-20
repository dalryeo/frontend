import ExpoModulesCore
import WatchConnectivity
import HealthKit
import CoreLocation

public class WorkoutModule: Module {
    @MainActor private var workoutManager: WorkoutControlling?
    @MainActor private var initializationTask: Task<WorkoutControlling, Never>?
    
    // 방송 수신기를 담을 변수
    private var resetObserver: NSObjectProtocol?
    
    public func definition() -> ModuleDefinition {
        Name("Workout")
        
        Events(
            WorkoutEvent.metricsUpdate,
            WorkoutEvent.stateChange,
            WorkoutEvent.locationAuthChange,
            WorkoutEvent.error,
            "onWatchStateChange"
        )
        
        OnCreate {
            Task { @MainActor in
                // 매니저 확보 (워치 앱 설치 여부에 따라 클래스 결정)
                let manager = await self.ensureProvider()
                
                // 실제 통신 가능 여부(핑) 테스트
                let pingSuccess = await DeviceManager.shared.checkWatchReachable()
                
                // 현재 활성화된 매니저가 '워치 전용'인지 체크
                let isWatchModeActive = manager is WatchLedWorkoutManager
                
                // JS로 초기 상태 전송
                self.sendEvent("onWatchStateChange", [
                    "isPaired": WCSession.default.isPaired,
                    "isWatchAppInstalled": WCSession.default.isWatchAppInstalled,
                    "isReachable": pingSuccess,
                    "isWatchMode": isWatchModeActive,
                    "isFallback": false
                ])
                
                WorkoutLogger.info("초기화 완료: \(isWatchModeActive ? "워치 모드" : "아이폰 모드") / 핑 결과: \(pingSuccess)")
            }
            
            // 2. 워치 강제 종료 대응 수신기 등록
            self.resetObserver = NotificationCenter.default.addObserver(
                forName: NSNotification.Name("WatchDidRequestReset"),
                object: nil,
                queue: .main
            ) { [weak self] _ in
                Task { @MainActor in
                    guard let self = self else { return }
                    await self.workoutManager?.resetWorkout()
                    
                    self.sendEvent(WorkoutEvent.stateChange, [
                        WorkoutKey.sessionState: "notStarted"
                    ])
                    WorkoutLogger.info("워치 연결 끊김 감지: JS로 상태 초기화(notStarted) 전송 완료")
                }
            }
        }
        
        OnDestroy {
            if let observer = self.resetObserver {
                NotificationCenter.default.removeObserver(observer)
            }
            
            Task { @MainActor in
                self.initializationTask = nil
                self.workoutManager?.onMetricsUpdate = nil
                self.workoutManager?.onWorkoutStateChange = nil
                self.workoutManager?.onLocationAuthorizationChange = nil
                self.workoutManager = nil
            }
        }
        
        // MARK: - Async Functions (JS 공개 메서드)
        
        AsyncFunction("getWorkoutMode") { (promise: Promise) in
            Task {
                let mode = await DeviceManager.shared.detectWorkoutMode()
                let modeString = mode == .watchMirroring ? "watchMirroring" : "iPhoneOnly"
                promise.resolve(modeString)
            }
        }
        
        AsyncFunction(WorkoutFunction.checkPermissions) { (promise: Promise) in
            Task { @MainActor in
                let manager = await self.ensureProvider()
                let permissions: [String: Bool] = [
                    WorkoutKey.healthKit: manager.checkHealthKitWritePermission(),
                    WorkoutKey.location: manager.checkLocationPermission()
                ]
                promise.resolve(permissions)
            }
        }
        
        AsyncFunction(WorkoutFunction.requestLocationAuthorization) {
            Task { @MainActor in
                let manager = await self.ensureProvider()
                await manager.requestLocationAuthorization()
            }
        }
        
        AsyncFunction(WorkoutFunction.requestHealthAuthorization) { (promise: Promise) in
            Task { @MainActor in
                do {
                    let manager = await self.ensureProvider()
                    try await manager.requestHealthAuthorization()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.permissionRequestFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.startWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    let manager = await self.updateProviderForCurrentEnvironment()
                    let activeManager = try await DeviceManager.shared.executeStartWithFallback(currentManager: manager)
                    
                    if activeManager !== manager {
                        self.workoutManager = activeManager
                        self.setupObservers()
                        self.emitInitialState()
                        
                        // Fallback 발생 시 상태 업데이트 알림
                        self.sendEvent("onWatchStateChange", [
                            "isPaired": WCSession.default.isPaired,
                            "isWatchAppInstalled": WCSession.default.isWatchAppInstalled,
                            "isReachable": false,
                            "isWatchMode": false,
                            "isFallback": true
                        ])
                    }
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.startFailed)
                }
            }
        }
        
        AsyncFunction("syncWatchState") { (promise: Promise) in
            Task { @MainActor in
                // 1. 매니저 확보 (필요시 교체까지 수행)
                let manager = await self.updateProviderForCurrentEnvironment()
                
                // 2. 현재 워치 상태 체크
                let pingSuccess = await DeviceManager.shared.checkWatchReachable()
                
                // 3. 상태 방송 (이 이벤트를 JS 리스너가 받게 됨)
                self.sendEvent("onWatchStateChange", [
                    "isPaired": WCSession.default.isPaired,
                    "isWatchAppInstalled": WCSession.default.isWatchAppInstalled,
                    "isReachable": pingSuccess,
                    "isWatchMode": manager is WatchLedWorkoutManager,
                    "isFallback": false
                ])
                
                promise.resolve(nil)
            }
        }
        
        AsyncFunction(WorkoutFunction.pauseWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    let manager = await self.ensureProvider()
                    try manager.pauseWorkout()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.pauseFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.resumeWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    let manager = await self.ensureProvider()
                    try manager.resumeWorkout()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.resumeFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.endWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    let manager = await self.ensureProvider()
                    try await manager.endWorkout()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.endFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.resetWorkout) { (promise: Promise) in
            Task { @MainActor in
                await self.workoutManager?.resetWorkout()
                promise.resolve(nil)
            }
        }
        
        AsyncFunction(WorkoutFunction.getCurrentMetrics) { (promise: Promise) in
            Task { @MainActor in
                promise.resolve(self.workoutManager?.metrics.toDictionary() ?? [:])
            }
        }
    }
    
    // MARK: - Internal Methods
    
    @MainActor
    private func ensureProvider() async -> WorkoutControlling {
        if let manager = workoutManager { return manager }
        if let existingTask = initializationTask { return await existingTask.value }
        
        let newTask = Task { @MainActor in
            let manager = await DeviceManager.shared.createWorkoutManager()
            self.workoutManager = manager
            setupObservers()
            emitInitialState()
            return manager
        }
        self.initializationTask = newTask
        return await newTask.value
    }
    
    @MainActor
    private func updateProviderForCurrentEnvironment() async -> WorkoutControlling {
        // 1. 현재 매니저를 가져옵니다.
        let manager = await ensureProvider()
        let state = manager.metrics.sessionState
        
        // 운동 중일 때는 데이터 유실 방지를 위해 절대 매니저를 교체하지 않습니다.
        guard state == .notStarted || state == .ended else { return manager }
        
        // 2. 현재 기기 환경(워치 페어링/앱 설치 여부)을 다시 체크합니다.
        let currentMode = await DeviceManager.shared.detectWorkoutMode()
        let isCurrentlyWatch = manager is WatchLedWorkoutManager
        let isCurrentlyiPhone = manager is WorkoutManager
        
        var needsReplacement = false
        
        // 현재 모드와 매니저 객체 타입이 맞지 않으면 교체 대상으로 판단
        if currentMode == .watchMirroring && !isCurrentlyWatch {
            needsReplacement = true
        } else if currentMode == .iPhoneOnly && !isCurrentlyiPhone {
            needsReplacement = true
        }
        
        if needsReplacement {
            WorkoutLogger.info("🔄 환경 변화 감지: 매니저 객체 교체 시작 (\(isCurrentlyWatch ? "Watch -> iPhone" : "iPhone -> Watch"))")
            
            // 3. 기존 옵저버 해제
            self.workoutManager?.onMetricsUpdate = nil
            self.workoutManager?.onWorkoutStateChange = nil
            self.workoutManager?.onLocationAuthorizationChange = nil
            
            // 4. 새로운 환경에 맞는 매니저 생성 및 할당
            let newManager = await DeviceManager.shared.createWorkoutManager()
            self.workoutManager = newManager
            
            // 5. 옵저버 재설정 및 초기 상태 방송
            setupObservers()
            emitInitialState()
            
            // 6. JS에 객체 타입이 바뀌었음을 즉시 전파
            // 핑 성공 여부와 상관없이 'isWatchMode'가 true면 미러링 대기 상태임을 알립니다.
            let pingSuccess = await DeviceManager.shared.checkWatchReachable()
            self.sendEvent("onWatchStateChange", [
                "isPaired": WCSession.default.isPaired,
                "isWatchAppInstalled": WCSession.default.isWatchAppInstalled,
                "isReachable": pingSuccess,
                "isWatchMode": newManager is WatchLedWorkoutManager, 
                "isFallback": false
            ])
            
            WorkoutLogger.info("✅ 매니저 교체 완료: \(newManager is WatchLedWorkoutManager ? "WatchLed (Mirroring)" : "iPhoneOnly")")
            return newManager
        }
        
        return manager
    }
    
    @MainActor
    private func setupObservers() {
        workoutManager?.onMetricsUpdate = { [weak self] metrics in
            self?.sendEvent(WorkoutEvent.metricsUpdate, metrics.toDictionary())
        }
        workoutManager?.onWorkoutStateChange = { [weak self] state in
            self?.sendEvent(WorkoutEvent.stateChange, [
                WorkoutKey.sessionState: WorkoutMetrics.stateToString(state)
            ])
        }
        workoutManager?.onLocationAuthorizationChange = { [weak self] hasPermission in
            self?.sendEvent(WorkoutEvent.locationAuthChange, [
                WorkoutKey.locationPermission: hasPermission
            ])
        }
        DeviceManager.shared.onWatchStateChange = { [weak self] payload in
            guard let self = self else { return }
            var extendedPayload = payload
            extendedPayload["isWatchMode"] = self.workoutManager is WatchLedWorkoutManager
            self.sendEvent("onWatchStateChange", extendedPayload)
        }
    }
    
    @MainActor
    private func emitInitialState() {
        guard let manager = workoutManager else { return }
        sendEvent(WorkoutEvent.metricsUpdate, manager.metrics.toDictionary())
        sendEvent(WorkoutEvent.locationAuthChange, [
            WorkoutKey.locationPermission: manager.checkLocationPermission()
        ])
    }
    
    private func rejectAndEmit(_ promise: Promise, _ error: WorkoutError, code: String) {
        sendEvent(WorkoutEvent.error, error.toErrorState(code: code).toDictionary())
        promise.reject(error.toException(code: code))
    }
}

// MARK: - Extensions

extension WorkoutError {
    func toErrorState(code: String) -> WorkoutErrorState {
        return WorkoutErrorState(
            timeStamp: Date.now,
            code: code,
            suggestion: self.suggestion,
            message: self.message
        )
    }
    
    func toException(code: String) -> Exception {
        let errorState = self.toErrorState(code: code)
        let payload = WorkoutErrorStatePayload(state: errorState)
        
        return Exception(
            name: "WorkoutError",
            description: payload.toJSONString() ?? self.localizedDescription,
            code: code
        )
    }
}

extension Promise {
    func rejectWithWorkoutError(_ error: WorkoutError, code: String) {
        self.reject(error.toException(code: code))
    }
}

