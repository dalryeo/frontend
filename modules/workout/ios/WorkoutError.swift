import Foundation

struct WorkoutErrorState: Codable {
    let timeStamp: Date
    let code: String
    let suggestion: String
    let message: String
    
    func toDictionary() -> [String: Any] {
        let formatter = ISO8601DateFormatter()
        
        return [
            "timeStamp": formatter.string(from: self.timeStamp),
            "code": self.code,
            "suggestion": self.suggestion,
            "message": self.message
        ]
    }
}

struct WorkoutErrorStatePayload: Codable {
    let state: WorkoutErrorState
    
    func toJSONString() -> String? {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601 // JS Date 호환버전
        
        guard let jsonData = try? encoder.encode(self),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            return nil
        }
        return jsonString
    }
}

enum WorkoutError: Error, Sendable {
    // 기본 에러
    case healthKitNotAvailable
    case workoutAlreadyInProgress
    case noActiveWorkout
    case builderNotInitialized
    case workoutCreationFailed
    case locationSaveFailed
    case permissionDenied
    case locationPermissionDenied
    case healthKitPermissionDenied
    case invalidWorkoutState
    
    // Apple Watch 관련 에러
    case sessionNotActive
    case sessionCreationFailed
    case mirroringFailed
    case remoteDeviceDisconnected
    case dataEncodingFailed
    case dataSendingFailed
    case dataCollectionFailed
    
    // Watch-Led 특화 에러
    case watchAppStartFailed
    case dataDecodingFailed
    case syncFailed
    case timeValidationFailed
    case invalidDataFormat
    
    var message: String {
        switch self {
        case .healthKitNotAvailable:
            return "이 기기에서는 HealthKit을 사용할 수 없습니다."
        case .workoutAlreadyInProgress:
            return "이미 진행 중인 운동이 있습니다."
        case .noActiveWorkout:
            return "진행 중인 운동이 없습니다."
        case .builderNotInitialized:
            return "운동 빌더가 초기화되지 않았습니다."
        case .workoutCreationFailed:
            return "운동 생성에 실패했습니다."
        case .locationSaveFailed:
            return "위치 데이터 저장에 실패했습니다."
        case .permissionDenied:
            return "필요한 권한이 없습니다."
        case .locationPermissionDenied:
            return "위치 접근 권한이 필요합니다."
        case .healthKitPermissionDenied:
            return "건강 데이터 접근 권한이 필요합니다."
        case .invalidWorkoutState:
            return "잘못된 운동 상태입니다."
        case .sessionNotActive:
            return "활성화된 세션이 없습니다."
        case .sessionCreationFailed:
            return "세션 생성에 실패했습니다."
        case .mirroringFailed:
            return "Apple Watch 연결에 실패했습니다."
        case .remoteDeviceDisconnected:
            return "Apple Watch와의 연결이 끊어졌습니다."
        case .dataEncodingFailed:
            return "데이터 변환에 실패했습니다."
        case .dataSendingFailed:
            return "데이터 전송에 실패했습니다."
        case .dataCollectionFailed:
            return "데이터 수집에 실패했습니다."
        case .watchAppStartFailed:
            return "Apple Watch 앱 시작에 실패했습니다."
        case .dataDecodingFailed:
            return "수신 데이터 해석에 실패했습니다."
        case .syncFailed:
            return "데이터 동기화에 실패했습니다."
        case .timeValidationFailed:
            return "시간 검증에 실패했습니다."
        case .invalidDataFormat:
            return "잘못된 데이터 형식입니다."
        @unknown default:
            return "알 수 없는 오류가 발생했습니다."
        }
    }
    
    var suggestion: String {
        switch self {
        case .healthKitNotAvailable:
            return "HealthKit을 지원하는 기기가 필요합니다."
        case .workoutAlreadyInProgress:
            return "현재 운동을 종료한 후 다시 시도해주세요."
        case .noActiveWorkout:
            return "먼저 운동을 시작해주세요."
        case .builderNotInitialized:
            return "앱을 다시 시작해주세요."
        case .workoutCreationFailed:
            return "네트워크 연결을 확인하고 다시 시도해주세요."
        case .locationSaveFailed:
            return "GPS 신호를 확인해주세요."
        case .permissionDenied:
            return "설정에서 필요한 권한을 허용해주세요."
        case .locationPermissionDenied:
            return "설정 > 개인정보 보호 > 위치 서비스에서 권한을 허용해주세요."
        case .healthKitPermissionDenied:
            return "설정 > 개인정보 보호 > 건강에서 권한을 허용해주세요."
        case .invalidWorkoutState:
            return "운동을 다시 시작해주세요."
        case .sessionNotActive:
            return "운동 세션을 다시 시작해주세요."
        case .sessionCreationFailed:
            return "앱을 다시 시작하고 시도해주세요."
        case .mirroringFailed:
            return "Apple Watch와의 연결을 확인해주세요."
        case .remoteDeviceDisconnected:
            return "Apple Watch를 가까이 두고 다시 시도해주세요."
        case .dataEncodingFailed:
            return "잠시 후 다시 시도해주세요."
        case .dataSendingFailed:
            return "Apple Watch와의 연결을 확인해주세요."
        case .dataCollectionFailed:
            return "센서 연결을 확인하고 다시 시도해주세요."
        case .watchAppStartFailed:
            return "Apple Watch가 근처에 있고 켜져있는지 확인해주세요."
        case .dataDecodingFailed:
            return "잠시 후 다시 시도해주세요."
        case .syncFailed:
            return "Apple Watch와의 연결을 확인하고 다시 시도해주세요."
        case .timeValidationFailed:
            return "운동을 재시작해주세요."
        case .invalidDataFormat:
            return "앱을 최신 버전으로 업데이트해주세요."
        @unknown default:
            return "개발자에게 문의해주세요."
        }
    }
}

