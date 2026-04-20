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
    
    var onWatchStateChange: (([String: Any]) -> Void)?
    
    override private init() {
        super.init()
        if WCSession.isSupported() {
            self.session = WCSession.default
            self.session?.delegate = self
            self.session?.activate()
        }
    }
    
    // MARK: - Watch 감지
    
    func checkAppleWatchAvailability() async -> Bool {
        guard WCSession.isSupported() else {
            WorkoutLogger.debug("WCSession 미지원")
            return false
        }
        
        let session = WCSession.default
        broadcastWatchState(session)
        
        if session.activationState == .activated {
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
            WorkoutLogger.debug("아이폰 단독모드 매니저 생성")
            return WorkoutManager()
        case .watchMirroring:
            WorkoutLogger.debug("워치 미러링모드 매니저 생성 (깨우기 대기)")
            return WatchLedWorkoutManager()
        }
    }
    
    @MainActor
    func createFallbackManager() -> WorkoutControlling {
        WorkoutLogger.debug("Fallback -> 아이폰 단독모드 전환")
        return WorkoutManager()
    }
    
    @MainActor
    func executeStartWithFallback(currentManager: WorkoutControlling) async throws -> WorkoutControlling {
        do {
            try await currentManager.startWorkout()
            return currentManager
        } catch WorkoutError.watchNotReachable {
            WorkoutLogger.warning("워치 연결 실패: 아이폰 단독 모드로 Fallback 진행")
            let fallbackManager = createFallbackManager()
            try await fallbackManager.startWorkout()
            return fallbackManager
        }
    }

    @MainActor
    func detectWorkoutMode() async -> WorkoutMode {
        guard WCSession.isSupported() else { return .iPhoneOnly }
        let session = WCSession.default
        
        guard session.isPaired && session.isWatchAppInstalled else {
            return .iPhoneOnly
        }
        
        return .watchMirroring
    }
    
    // 실제 통신이 가능한지(화면이 켜져 있는지) 확인하는 액티브 핑
    func checkWatchReachable() async -> Bool {
        let session = WCSession.default
        guard session.isPaired && session.isWatchAppInstalled else { return false }
        
        return await withCheckedContinuation { continuation in
            var isFinished = false
            session.sendMessage(["request": "ping"], replyHandler: { _ in
                if !isFinished {
                    isFinished = true
                    continuation.resume(returning: true)
                }
            }, errorHandler: { _ in
                if !isFinished {
                    isFinished = true
                    continuation.resume(returning: false)
                }
            })
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                if !isFinished {
                    isFinished = true
                    continuation.resume(returning: false)
                }
            }
        }
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        let hasWatch = activationState == .activated && session.isPaired && session.isWatchAppInstalled
        isActivating = false
        pendingContinuations.forEach { $0.resume(returning: hasWatch) }
        pendingContinuations.removeAll()
        broadcastWatchState(session)
    }
    
    func sessionWatchStateDidChange(_ session: WCSession) {
        broadcastWatchState(session)
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        broadcastWatchState(session)
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {
        broadcastWatchState(session)
    }
    
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
        broadcastWatchState(session)
    }
    
    private func broadcastWatchState(_ session: WCSession) {
        let statusPayload: [String: Any] = [
            "isPaired": session.isPaired,
            "isWatchAppInstalled": session.isWatchAppInstalled,
            "isReachable": session.isReachable,
            "isFallback": false
        ]
        
        Task { @MainActor [weak self] in
            self?.onWatchStateChange?(statusPayload)
        }
    }
}
#endif
