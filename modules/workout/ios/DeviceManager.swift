import WatchConnectivity

enum WorkoutMode {
    case iPhoneOnly
    case watchMirroring
}

#if os(iOS)
class DeviceManager: NSObject, WCSessionDelegate {
    static let shared = DeviceManager()
    
    private var session: WCSession?
    private var pendingContinuations: [CheckedContinuation<Bool, Never>] = []
    private var isActivating = false
    
    // MARK: - Watch 감지
    
    func checkAppleWatchAvailability() async -> Bool {
        guard WCSession.isSupported() else {
              WorkoutLogger.debug("WCSession 미지원")
              return false
          }
          
          let session = WCSession.default
          
          if session.activationState == .activated {
              WorkoutLogger.debug("""
                  세션 상태 체크:
                  - isPaired: \(session.isPaired)
                  - isWatchAppInstalled: \(session.isWatchAppInstalled)
                  - isReachable: \(session.isReachable)
              """)
              return session.isPaired && session.isWatchAppInstalled
          }
        
        return await withCheckedContinuation { continuation in
            pendingContinuations.append(continuation)
            
            if !isActivating {
                isActivating = true
                self.session = session
                session.delegate = self
                session.activate()
            }
        }
    }
    
    // MARK: - WorkoutManager 생성
    
    @MainActor
    func createWorkoutManager() async -> WorkoutControlling {
        let mode = await detectWorkoutMode()
        
        switch mode {
        case .iPhoneOnly:
            WorkoutLogger.debug("아이폰 단독모드")
            return WorkoutManager()
        case .watchMirroring:
            WorkoutLogger.debug("워치 미러링모드")
            return WatchLedWorkoutManager()
        }
    }
    
    @MainActor
    func createFallbackManager() -> WorkoutControlling {
        WorkoutLogger.debug("Fallback → 아이폰 단독모드")
        return WorkoutManager()
    }
    
    private func detectWorkoutMode() async -> WorkoutMode {
        guard WCSession.isSupported() else { return .iPhoneOnly }
        
        let hasWatch = await checkAppleWatchAvailability()
        return hasWatch ? .watchMirroring : .iPhoneOnly
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        let hasWatch = activationState == .activated && session.isPaired && session.isWatchAppInstalled
        
        isActivating = false
        
        pendingContinuations.forEach { $0.resume(returning: hasWatch) }
        pendingContinuations.removeAll()
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {}
    
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }
}
#endif
