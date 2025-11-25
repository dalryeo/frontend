// WorkoutModule.swift

import ExpoModulesCore
import HealthKit
import CoreLocation

public class WorkoutModule: Module {
    @MainActor private let workoutManager = WorkoutManager()
    
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
                self.setupMetricsObserver()
                self.setupLocationAuthObserver()
                self.emitCurrentMetrics()
                self.emitCurrentLocationAuth()
            }
        }
        
        OnDestroy {
            Task { @MainActor in
                self.workoutManager.onMetricsUpdate = nil
                self.workoutManager.onWorkoutStateChange = nil
                self.workoutManager.onLocationAuthorizationChange = nil
            }
        }
        
        AsyncFunction(WorkoutFunction.checkPermissions) { (promise: Promise) in
            Task { @MainActor in
                let permissions: [String: Bool] = [
                    WorkoutKey.healthKit: self.workoutManager.checkHealthKitWritePermission(),
                    WorkoutKey.location: self.workoutManager.checkLocationPermission()
                ]
                promise.resolve(permissions)
            }
        }
        
        AsyncFunction(WorkoutFunction.requestLocationAuthorization) {
            Task { @MainActor in
                await self.workoutManager.requestLocationAuthorization()
            }
        }
        
        AsyncFunction(WorkoutFunction.requestHealthAuthorization) { (promise: Promise) in
            Task { @MainActor in
                do {
                    try await self.workoutManager.requestHealthAuthorization()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.permissionRequestFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.startWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    try await self.workoutManager.startWorkout()
                    promise.resolve(nil)
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.startFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.pauseWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    try self.workoutManager.pauseWorkout()
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.pauseFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.resumeWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    try self.workoutManager.resumeWorkout()
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.resumeFailed)
                }
            }
        }
        
        AsyncFunction(WorkoutFunction.endWorkout) { (promise: Promise) in
            Task { @MainActor in
                do {
                    try await self.workoutManager.endWorkout()
                } catch let error as WorkoutError {
                    self.rejectAndEmit(promise, error, code: WorkoutErrorCode.endFailed)
                }
            }
        }
        
        Function(WorkoutFunction.resetWorkout) {
            Task { @MainActor in
                self.workoutManager.resetWorkout()
            }
        }
        
        Function(WorkoutFunction.getCurrentMetrics) {
            Task { @MainActor in
                return self.workoutManager.metrics.toDictionary()
            }
        }
        
    }
    
    @MainActor
    private func setupLocationAuthObserver() {
        workoutManager.onLocationAuthorizationChange = { [weak self] hasPermission in
            guard let self = self else { return }
            
            self.sendEvent(WorkoutEvent.locationAuthChange, [
                WorkoutKey.locationPermission: hasPermission
            ])
        }
    }
    
    @MainActor
    private func setupMetricsObserver() {
        workoutManager.onMetricsUpdate = { [weak self] metrics in
            guard let self = self else { return }
            
            self.sendEvent(WorkoutEvent.metricsUpdate, workoutManager.metrics.toDictionary())
        }
        
        workoutManager.onWorkoutStateChange = { [weak self] state in
            guard let self = self else { return }
            
            self.sendEvent(WorkoutEvent.stateChange, [
                WorkoutKey.sessionState: WorkoutMetrics.stateToString(state)
            ])
        }
    }
    
    @MainActor
    private func emitCurrentMetrics() {
        sendEvent(WorkoutEvent.metricsUpdate, workoutManager.metrics.toDictionary())
    }
    
    @MainActor
    private func emitCurrentLocationAuth() {
        sendEvent(WorkoutEvent.locationAuthChange, [
            WorkoutKey.locationPermission: workoutManager.checkLocationPermission()
        ])
    }
    
    private func rejectAndEmit(
        _ promise: Promise,
        _ error: WorkoutError,
        code: String
    ) {
        sendEvent(WorkoutEvent.error, error.toErrorState(code: code).toDictionary())
        promise.reject(error.toException(code: code))
    }
    
}

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
