import ExpoModulesCore
import HealthKit
import CoreLocation

public class WorkoutModule: Module {
    @MainActor private var workoutManager: WorkoutControlling?
    @MainActor private var initializationTask: Task<WorkoutControlling, Never>?
    
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
                await self.ensureProvider()
            }
        }
        
        OnDestroy {
            Task { @MainActor in
                // 인스턴스 및 태스크 정리
                self.initializationTask = nil
                self.workoutManager?.onMetricsUpdate = nil
                self.workoutManager?.onWorkoutStateChange = nil
                self.workoutManager?.onLocationAuthorizationChange = nil
                self.workoutManager = nil
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
                    let manager = self.fallbackToiPhoneMode()
                    try await manager.startWorkout()
                    promise.resolve(nil)
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
    private func ensureProvider() async -> WorkoutControlling {
        // 1. 이미 인스턴스가 있다면 즉시 반환
        if let manager = workoutManager {
            return manager
        }
        
        // 2. 이미 초기화 태스크가 진행 중이라면 그 태스크의 결과를 기다림
        if let existingTask = initializationTask {
            return await existingTask.value
        }
        
        // 3. 진행 중인 태스크가 없다면 새로운 초기화 태스크 생성 및 저장
        let newTask = Task { @MainActor in
            WorkoutLogger.debug("매니저 초기화 시작")
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
    private func fallbackToiPhoneMode() -> WorkoutControlling {
        WorkoutLogger.debug("워치 연결 실패 → 아이폰 모드로 전환")
        let manager = DeviceManager.shared.createFallbackManager()
        
        self.workoutManager = manager
        setupObservers()
        
        return manager
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

