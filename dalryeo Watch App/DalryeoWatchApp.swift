import SwiftUI
import WatchKit
import HealthKit

class WatchAppDelegate: NSObject, WKExtensionDelegate {
  func handle(_ workoutConfiguration: HKWorkoutConfiguration) {
    WorkoutManager.shared.resetWorkout()
    
    Task { @MainActor in
      try await WorkoutManager.shared.startWorkout()
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
