import ExpoModulesCore
import HealthKit
import CoreLocation

public class WorkoutModule: Module {
    @MainActor private var workoutManager: WorkoutControlling?
    private var isInitializing = false
    
    public func definition() -> ModuleDefinition {
        Name("Workout")
        
        Events(
            WorkoutEvent.metricsUpdate,
            WorkoutEvent.stateChange,
            WorkoutEvent.locationAuthChange,
            WorkoutEvent.error
        )
        
        OnCreate {
            Task { @MainActor in
                await self.initializeProvider()
            }
        }
        
        OnDestroy {
            Task { @MainActor in
                self.workoutManager?.onMetricsUpdate = nil
                self.workoutManager?.onWorkoutStateChange = nil
                self.workoutManager?.onLocationAuthorizationChange = nil
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
                    let manager = await self.ensureProvider()
                    try await manager.startWorkout()
                    promise.resolve(nil)
                } catch WorkoutError.watchNotReachable {
                    await self.fallbackToiPhoneMode()
                    do {
                        try await self.workoutManager?.startWorkout()
                        promise.resolve(nil)
                    } catch let error as WorkoutError {
                        self.rejectAndEmit(promise, error, code: WorkoutErrorCode.startFailed)
                    }
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.startFailed)
                }
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
        
        Function(WorkoutFunction.resetWorkout) {
            Task { @MainActor in
                self.workoutManager?.resetWorkout()
            }
        }
        
        Function(WorkoutFunction.getCurrentMetrics) {
            Task { @MainActor in
                return self.workoutManager?.metrics.toDictionary() ?? [:]
            }
        }
    }
    
    // MARK: - Provider 초기화
    
    @MainActor
    private func initializeProvider() async {
        if let manager = workoutManager, manager.isWorkoutActive {
            return
        }
        
        isInitializing = true
        workoutManager = await DeviceManager.shared.createWorkoutManager()
        setupObservers()
        emitInitialState()
        isInitializing = false
    }
    
    @MainActor
    private func ensureProvider() async -> WorkoutControlling {
        await initializeProvider()
        return workoutManager!
    }
    
    @MainActor
    private func fallbackToiPhoneMode() async {
        WorkoutLogger.debug("워치 연결 실패 → 아이폰 모드로 전환")
        workoutManager = DeviceManager.shared.createFallbackManager()
        setupObservers()
    }
    
    // MARK: - Observers
    
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
    }
    
    @MainActor
    private func emitInitialState() {
        guard let manager = workoutManager else { return }
        sendEvent(WorkoutEvent.metricsUpdate, manager.metrics.toDictionary())
        sendEvent(WorkoutEvent.locationAuthChange, [
            WorkoutKey.locationPermission: manager.checkLocationPermission()
        ])
    }
    
    // MARK: - Error Handling
    
    private func rejectAndEmit(
        _ promise: Promise,
        _ error: WorkoutError,
        code: String
    ) {
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
