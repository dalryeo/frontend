import Foundation
import HealthKit

@MainActor
protocol WorkoutControlling {
  var metrics: WorkoutMetrics { get }
  var isWorkoutActive: Bool { get }
  var onMetricsUpdate: ((WorkoutMetrics) -> Void)? { get set }
  var onWorkoutStateChange: ((HKWorkoutSessionState) -> Void)? { get set }
  var onLocationAuthorizationChange: ((Bool) -> Void)? { get set }
  func startWorkout() async throws
  func pauseWorkout() throws
  func resumeWorkout() throws
  func endWorkout() async throws
  func resetWorkout()
  func checkHealthKitWritePermission() -> Bool
  func checkLocationPermission() -> Bool
  func requestLocationAuthorization() async
  func requestHealthAuthorization() async throws
}

enum WorkoutStartMode: String {
    case auto = "auto"
    case watch = "watch"
    case iphone = "iphone"
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
