
import HealthKit
import Foundation

struct WorkoutState: Codable {
    // 운동 데이터
    let heartRate: Double
    let averageHeartRate: Double
    let calories: Double
    let distance: Double
    let pace: Double
    let elapsedTime: TimeInterval
}

struct WorkoutStatePayload: Codable {
    let state: WorkoutState
    
    func encode() throws -> Data {
        try JSONEncoder().encode(self)
    }
    
    static func decode(from data: Data) throws -> WorkoutStatePayload {
        try JSONDecoder().decode(WorkoutStatePayload.self, from: data)
    }
}

struct WorkoutInitialSync: Codable {
    let workoutStartDate: Date
    let currentElapsedTime: TimeInterval
    let totalPausedDuration: TimeInterval
}

struct SessionStateChange {
    let newState: HKWorkoutSessionState
    let date: Date
}

@Observable
final class WorkoutMetrics {
    enum Constants {
        // 기본 단위 상수
        static let metersPerKilometer: Double = 1000.0
        static let secondsPerMinute: Double = 60.0
        // 페이스 유효성 범위 (min/km) - 기획 고정값
        static let minimumValidPace: Double = 2.0   // 2분/km
        static let maximumValidPace: Double = 20.0  // 20분/km
        // 속도 임계값 (m/s) - 페이스로부터 정확히 계산
        static let maxRealisticSpeed: Double = metersPerKilometer / (minimumValidPace * secondsPerMinute)
        static let minRealisticSpeed: Double = metersPerKilometer / (maximumValidPace * secondsPerMinute)
        // 경고 임계값
        static let highSpeedThreshold: Double = 6.0  // 6.0 m/s (21.6 km/h, 페이스 2.78 min/km)
        // 거리 임계값
        static let maxDistanceIncrease: Double = 100.0  // meters - 극단적 GPS 오류 방지
        static let minimumDistanceThreshold: Double = 1.0  // meters - GPS 떨림 방지
        // 페이스 스무딩
        static let defaultSmoothingFactor: Double = 0.3
        // 칼로리 계산
        static let calorieWeightMultiplier: Double = 1.036
    }
    
    private(set) var sessionState: HKWorkoutSessionState = .notStarted {
        didSet {
            guard oldValue != sessionState else { return }
            onWorkoutStateChange?(sessionState)
        }}
    private(set) var activityType: HKWorkoutActivityType = .running
    private(set) var locationType: HKWorkoutSessionLocationType = .outdoor
    private(set) var startDate: Date? = nil
    private(set) var endDate: Date? = nil
    private(set) var heartRate: Double = 0
    private(set) var averageHeartRate: Double = 0
    private(set) var calories: Double = 0
    private(set) var distance: Double = 0
    private(set) var pace: Double = 0
    private(set) var elapsedTime: TimeInterval = 0
    private(set) var smoothedPace: Double?
    private(set) var smoothingFactor: Double = Constants.defaultSmoothingFactor
    // 사용자 입력 데이터
    private(set) var bodyMass: Double?      // 몸무게 (kg)
    private(set) var bodyHeight: Double?    // 신장 (cm)
    
    // 운동 상태 변경 콜백
    public var onWorkoutStateChange: ((HKWorkoutSessionState) -> Void)?
    // 메트릭 상태 변경 콜백
    public var onMetricsUpdate: ((WorkoutMetrics) -> Void)?
    
    private func notifyMetricsChanged() {
        onMetricsUpdate?(self)
    }
    
    var isBodyMassAndHeightAvailable: Bool {
        bodyMass != nil && bodyHeight != nil
    }
    /// 미터당 칼로리
    var caloriesPerMeter: Double {
        // TODO: 초기값 처리하기 (70.0)
        let bodyMass = bodyMass ?? 70.0
        let caloriesPerMeter = (bodyMass * Constants.calorieWeightMultiplier) / Constants.metersPerKilometer
        
        return caloriesPerMeter
    }
    
    static func stateToString(_ state: HKWorkoutSessionState) -> String {
        switch state {
        case .notStarted: return "notStarted"
        case .prepared: return "prepared"
        case .running: return "running"
        case .paused: return "paused"
        case .ended: return "ended"
        case .stopped: return "stopped"
        @unknown default: return "notStarted"
        }
    }
    
    /// 속도(m/s)를 페이스(min/km)로 변환
    /// - Parameter metersPerSecond: 속도 (m/s)
    /// - Returns: 페이스 (min/km), 속도가 0이면 0
    static func calculatePaceBySpeed(from metersPerSecond: Double) -> Double {
        guard metersPerSecond > 0 else { return 0 }
        
        // 공식: 1km 이동에 걸리는 시간(초) ÷ 60 = 분/km
        // 예시: 3 m/s (metersPerSecond) → (1000m ÷ 3 m/s) ÷ 60 = 5.56 min/km
        return Constants.metersPerKilometer / metersPerSecond / Constants.secondsPerMinute
    }
    
    /// 시간과 거리로 페이스 계산 (iPhone GPS용)
    /// - Parameters:
    ///   - timeInterval: 경과 시간 (초)
    ///   - distance: 이동 거리 (m)
    /// - Returns: 페이스 (min/km), 거리가 0이면 0
    static func calculatePaceByGPS(_ timeInterval: TimeInterval, _ distance: Double) -> Double {
        guard distance > 0 else { return 0 }
        
        let metersPerSecond = distance / timeInterval
        return calculatePaceBySpeed(from: metersPerSecond)
    }
    
    static func isValidSpeed(_ speed: Double) -> Bool {
        return speed >= Constants.minRealisticSpeed &&
        speed <= Constants.maxRealisticSpeed
    }
    
    static func isHighSpeed(_ speed: Double) -> Bool {
        return speed > Constants.highSpeedThreshold
    }
    
    static func isCorrectPace(_ currentPace: Double) -> Bool {
        return currentPace >= Constants.minimumValidPace &&
        currentPace <= Constants.maximumValidPace
    }
    
    public func setStartDate(_ date: Date) {
        self.startDate = date
        notifyMetricsChanged()
    }
    
    public func setEndDate(_ date: Date) {
        self.endDate = date
        notifyMetricsChanged()
    }
    
    public func updateHeartRate(_ bpm: Double) {
        self.heartRate = bpm
        notifyMetricsChanged()
    }
    
    public func updateAverageHeartRate(_ averageHeartRate: Double) {
        self.averageHeartRate = averageHeartRate
        notifyMetricsChanged()
    }
    
    public func updateCalories(_ calories: Double) {
        self.calories = calories
        notifyMetricsChanged()
    }
    
    func addCalories(_ calories: Double) {
        self.calories += calories
        notifyMetricsChanged()
    }
    
    public func updateDistance(_ distance: Double) {
        self.distance = distance
        notifyMetricsChanged()
    }
    
    public func addDistance(_ distance: Double) {
        self.distance += distance
        notifyMetricsChanged()
    }
    
    public func updatePace(_ pace: Double) {
        self.pace = pace
        notifyMetricsChanged()
    }
    
    public func updateElapsedTime(_ time: TimeInterval) {
        self.elapsedTime = time
        notifyMetricsChanged()
    }
    
    public func updateSessionState(_ state: HKWorkoutSessionState) {
        self.sessionState = state
        notifyMetricsChanged()
    }
    
    public func updateSmoothedPace(_ smoothedPace: Double) {
        self.smoothedPace = smoothedPace
    }
    
    public func updateBodyMass(_ mass: Double) {
        self.bodyMass = mass
        notifyMetricsChanged()
    }
    
    public func updateBodyHeight(_ height: Double) {
        self.bodyHeight = height
        notifyMetricsChanged()
    }
    
    // 애플워치 -> 아이폰 데이터 전송용
    public func createPayload() -> Data?  {
        let workoutState =  WorkoutState(
            heartRate: self.heartRate,
            averageHeartRate: self.averageHeartRate,
            calories: self.calories,
            distance: self.distance,
            pace: self.pace,
            elapsedTime: self.elapsedTime
        )
        
        guard let payload = try? WorkoutStatePayload(state: workoutState).encode() else {
            return nil
        }
        
        return payload
    }
    
    public func toDictionary() -> [String: Any] {
        return [
            "sessionState": WorkoutMetrics.stateToString(self.sessionState),
            "elapsedTime": self.elapsedTime,
            "distance": self.distance,
            "pace": self.pace,
            "calories": self.calories,
            "heartRate": self.heartRate,
            "averageHeartRate": self.averageHeartRate
        ]
    }
    
    public func reset() {
        self.startDate = nil
        self.endDate = nil
        self.smoothedPace = nil
        self.heartRate = 0
        self.calories = 0
        self.distance = 0
        self.pace = 0
        self.elapsedTime = 0
        self.sessionState = .notStarted
        notifyMetricsChanged()
    }
}
