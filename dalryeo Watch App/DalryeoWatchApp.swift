import SwiftUI
import WatchKit
import HealthKit

class WatchAppDelegate: NSObject, WKExtensionDelegate {
  func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
    Task { @MainActor in
      do {
        await WorkoutManager.shared.resetWorkout()
        try await Task.sleep(nanoseconds: 500_000_000)
        try await WorkoutManager.shared.prepareWorkout(with: workoutConfiguration)
        try await Task.sleep(nanoseconds: 200_000_000)
        try await WorkoutManager.shared.startWorkout()
        
      } catch {
        WorkoutLogger.error("WatchAppDelegate 핸들링 에러: \(error.localizedDescription)")
      }
    }
  }
}

@main
struct Dalryeo_Watch_AppApp: App {
  @WKExtensionDelegateAdaptor(WatchAppDelegate.self) var extensionDelegate
  
  var body: some Scene {
    WindowGroup {
      ContentView()
    }
  }
}
