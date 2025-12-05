import SwiftUI

/// 운동 데이터 표시 뷰 (Watch용)
struct MetricsView: View {
    let elapsedTime: TimeInterval
    let heartRate: Double
    let calories: Double
    let distance: Double
    let pace: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // 경과 시간
            MetricRow(
                label: "시간",
                value: formatElapsedTime(elapsedTime),
                unit: ""
            )
            
            // 심박수
            MetricRow(
                label: "심박수",
                value: "\(heartRate)",
                unit: "bpm"
            )
            
            // 칼로리
            MetricRow(
                label: "칼로리",
                value: String(format: "%.1f", calories),
                unit: "kcal"
            )
            
            // 거리
            MetricRow(
                label: "거리",
                value: String(format: "%.2f", distance / 1000),
                unit: "km"
            )
            
            // 평균 속도
            MetricRow(
                label: "속도",
                value:  String(format: "%d'%02d", Int(pace), Int((pace - Double(Int(pace))) * 60)),
                unit: ""
            )
        }
    }
    
    /// 경과 시간 포맷팅 (HH:MM:SS)
    private func formatElapsedTime(_ time: TimeInterval) -> String {
        let hours = Int(time) / 3600
        let minutes = (Int(time) % 3600) / 60
        let seconds = Int(time) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
}

/// 단일 메트릭 행
private struct MetricRow: View {
    let label: String
    let value: String
    let unit: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            if !unit.isEmpty {
                Text(unit)
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
        }
    }
}
