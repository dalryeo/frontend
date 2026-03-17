import SwiftUI
import WatchKit
import HealthKit

class WatchAppDelegate: NSObject, WKExtensionDelegate {
    func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
        Task { @MainActor in
            do {
                WorkoutManager.shared.resetWorkout()
                try await WorkoutManager.shared.prepareWorkout(with: workoutConfiguration)                
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
