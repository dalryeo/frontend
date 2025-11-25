import Foundation

@MainActor
protocol WorkoutControlling {
    func startWorkout() async throws
    func pauseWorkout() throws
    func resumeWorkout() throws
    func endWorkout() async throws
    func resetWorkout()
}

enum WorkoutEvent {
    static let metricsUpdate = "onMetricsUpdate"
    static let stateChange = "onWorkoutStateChange"
    static let locationAuthChange = "onLocationAuthChange"
    static let error = "onWorkoutError"
}

enum WorkoutFunction {
    static let checkPermissions = "checkPermissions"
    static let requestLocationAuthorization = "requestLocationAuthorization"
    static let requestHealthAuthorization = "requestHealthAuthorization"
    static let startWorkout = "startWorkout"
    static let pauseWorkout = "pauseWorkout"
    static let resumeWorkout = "resumeWorkout"
    static let endWorkout = "endWorkout"
    static let resetWorkout = "resetWorkout"
    static let getCurrentMetrics = "getCurrentMetrics"
}

enum WorkoutErrorCode {
    static let permissionRequestFailed = "PERMISSION_REQUEST_FAILED"
    static let startFailed = "START_WORKOUT_FAILED"
    static let pauseFailed = "PAUSE_WORKOUT_FAILED"
    static let resumeFailed = "RESUME_WORKOUT_FAILED"
    static let endFailed = "END_WORKOUT_FAILED"
}

enum WorkoutKey {
    static let healthKit = "healthKit"
    static let location = "location"
    static let locationPermission = "locationPermission"
    static let sessionState = "sessionState"
}
