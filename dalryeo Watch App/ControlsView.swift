import SwiftUI
import HealthKit

/// 워크아웃 컨트롤 버튼 (Watch용)
struct ControlsView: View {
    let workoutState: HKWorkoutSessionState
    let onStart: () -> Void
    let onPause: () -> Void
    let onResume: () -> Void
    let onEnd: () -> Void
    let onReset: () -> Void
    
    var body: some View {
        VStack(spacing: 10) {
            switch workoutState {
            case .notStarted:
                // 시작 버튼
                Button(action: {
                    // 햅틱 피드백으로 즉각적인 반응 제공
                    WKInterfaceDevice.current().play(.click)
                    onStart()
                }) {
                    Label("시작", systemImage: "play.fill")
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
                
            case .prepared:
                // 시작 중 로딩 표시
                VStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("시작 중...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
            case .running:
                // 일시정지 & 종료 버튼
                HStack(spacing: 10) {
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        onPause()
                    }) {
                        Label("일시정지", systemImage: "pause.fill")
                    }
                    .buttonStyle(.bordered)
                    
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        onEnd()
                    }) {
                        Label("종료", systemImage: "stop.fill")
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }
                
            case .paused:
                // 재개 & 종료 버튼
                HStack(spacing: 10) {
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        onResume()
                    }) {
                        Label("재개", systemImage: "play.fill")
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        onEnd()
                    }) {
                        Label("종료", systemImage: "stop.fill")
                    }
                    .buttonStyle(.bordered)
                    .tint(.red)
                }
                
            case .stopped:
                // 종료 중 로딩 표시
                VStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("종료 중...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
            case .ended:
                // 완료 메시지
                VStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.title2)
                    Text("완료")
                        .foregroundColor(.secondary)
                    Button(action: {
                        WKInterfaceDevice.current().play(.click)
                        onReset()
                    }) {
                        Label("재시작", systemImage: "arrow.clockwise")
                    }
                }
            @unknown default:
                fatalError("올바르지 않은 상태")
            }
        }
    }
}
