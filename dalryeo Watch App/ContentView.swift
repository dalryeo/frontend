//
//  ContentView.swift
//  watch-led-wc Watch App
//
//  Created by jeongbae bang on 11/7/25.
//

import SwiftUI
import WatchKit
import Combine

// MARK: - Main Content View
struct ContentView: View {
    @State var workoutManager = WorkoutManager.shared
    @State private var isActive = false
    
    var body: some View {
        VStack {
            if workoutManager.isAuthorized {
                StartButton {
                    Task {
                        try? await workoutManager.prepareWorkout()
                        workoutManager.updateCountingDownState(true)
                        isActive = true
                    }
                }
            } else {
                Button("권한 허용 및 시작") {
                    Task {
                        do {
                            try await workoutManager.requestHealthAuthorization()
                        } catch {
                            WorkoutLogger.error("권한 요청 실패: \(error.localizedDescription)")
                            workoutManager.updateAuthStatus(false,
                            """
                            권한이 거부되었습니다.
                            건강 > 앱 설정에서 허용해주세요.
                            """)
                        }
                    }
                }
                .tint(.blue)
            }
        }
        .onAppear {
            // 앱 실행 시 미리 체크
            if workoutManager.checkHealthKitWritePermission() {
                workoutManager.updateAuthorizedState(true)
            } else {
                workoutManager.updateAuthorizedState(false)
            }
        }
        .onChange(of: workoutManager.currentDisplayState) { oldValue, newValue in
            if newValue != .idle {
                isActive = true
            } else {
                isActive = false
            }
        }
        .alert("건강 데이터 권한", isPresented: $workoutManager.showAuthAlert) {
            Button("확인", role: .cancel) { }
        } message: {
            Text(workoutManager.authErrorMessage)
        }
        .fullScreenCover(isPresented: $isActive) {
            WorkoutSessionContainer(isActive: $isActive)
                .environment(workoutManager)
        }
    }
}

// MARK: - Start Button
struct StartButton: View {
    @State private var isAnimating = true
    public let onPress: () -> Void
    
    var body: some View {
        Button(action: {
            onPress()
        }) {
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.6))
                    .scaleEffect(isAnimating ? 1.6 : 1.0)
                    .blur(radius: isAnimating ? 20 : 10)
                    .opacity(isAnimating ? 0.2 : 0.6)
                    .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: isAnimating)
                
                Circle()
                    .fill(Color.neonGreen)
                    .shadow(color: .neonGreen.opacity(0.6), radius: 10, x: 0, y: 0)
                
                VStack {
                    Image(systemName: "figure.run")
                        .font(.system(.largeTitle, design: .rounded, weight: .semibold))
                    Text("START")
                        .font(.system(.title3, design: .rounded, weight: .semibold))
                }
                .foregroundColor(.black)
            }
            .onAppear { isAnimating = false }
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
        .aspectRatio(1.0, contentMode: .fit)
        .padding(10)
    }
}

// MARK: - Session Container
struct WorkoutSessionContainer: View {
    @Environment(\.dismiss) var dismiss
    @Environment(WorkoutManager.self) var workoutManager
    @Binding var isActive: Bool
    
    var body: some View {
        ZStack {
            switch workoutManager.currentDisplayState {
            case .countdown:
                CountdownView {
                    withAnimation {
                        workoutManager.updateCountingDownState(false)
                        workoutManager.updateStartingState(true)
                        Task {
                            do {
                                try await workoutManager.startWorkout()
                            } catch {
                                WorkoutLogger.error("운동 시작 에러")
                            }
                            workoutManager.updateStartingState(false)
                        }
                    }
                }
            case .active:
                RunningView()
            case .paused:
                PauseMenuView()
            case .summary:
                SummaryView(isActive: $isActive)
            case .idle:
                EmptyView()
            }
        }
        .ignoresSafeArea(.all)
        .toolbar(.hidden, for: .navigationBar)
    }
}

// MARK: - Running View
struct RunningView: View {
    @Environment(WorkoutManager.self) private var workoutManager
    
    var body: some View {
        GeometryReader { geometry in
            let screenHeight = geometry.size.height
            let screenWidth = geometry.size.width
            
            Color.neonGreen.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // 상단 메트릭 영역 (전체 높이의 약 35%)
                HStack(alignment: .center) {
                    Spacer()
                    MetricItem(value: String(format: "%.2f", workoutManager.metrics.distance / 1000), unit: "KM", color: .neonGreen)
                    Spacer()
                    MetricItem(value: "\(Int(workoutManager.metrics.heartRate.rounded()))", unit: "BPM", color: .neonGreen)
                    Spacer()
                    MetricItem(value: formatElapsedTime(workoutManager.metrics.elapsedTime), unit: "시간", color: .neonGreen)
                    Spacer()
                }
                .padding(.top, geometry.safeAreaInsets.top > 0 ? 15 : 25)
                .padding(.bottom, 5)
                .frame(height: screenHeight * 0.35)
                .background(Color.gray900)
                .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 25, bottomTrailingRadius: 25))
                
                VStack(spacing: 0) {
                    Spacer(minLength: 0)
                    
                    // 중앙 페이스 영역
                    VStack(spacing: 5) {
                        Text(formatPace(workoutManager.metrics.pace))
                            .font(.system(size: screenWidth * 0.25, weight: .bold, design: .rounded))
                            .monospacedDigit()
                            .foregroundColor(.black)
                            .minimumScaleFactor(0.5)
                        
                        // 하단 버튼 영역
                        Button(action: {
                            try? workoutManager.pauseWorkout()
                        }) {
                            Image(systemName: "pause.fill")
                                .font(.title2)
                                .foregroundStyle(Color.neonGreen)
                                .frame(width: screenHeight * 0.3, height: screenHeight * 0.3)
                                .maxFrame(maxWidth: 55, maxHeight: 55)
                                .background(.black)
                                .clipShape(Circle())
                        }
                        .buttonStyle(.plain)
                        .padding(.bottom, 10)
                    }
                    Spacer()
                }
                .frame(height: screenHeight * 0.65)
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - Summary View
struct SummaryView: View {
    @Environment(WorkoutManager.self) var workoutManager
    @Binding var isActive: Bool
    
    var body: some View {
        GeometryReader { geometry in
            let screenWidth = geometry.size.width
            
            VStack(spacing: 0) {
                Spacer(minLength: geometry.safeAreaInsets.top > 0 ? 15 : 25)
                
                // 메인 페이스
                VStack(spacing: 0) {
                    Text(formatPace(workoutManager.metrics.pace))
                        .font(.system(size: screenWidth * 0.26, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundColor(.neonGreen)
                        .minimumScaleFactor(0.8)
                }
                
                Spacer()
                
                // 보조 지표 섹션
                VStack(spacing: 8) {
                    SummaryMetricRow(value: String(format: "%.2f", workoutManager.metrics.distance / 1000) + "km")
                    SummaryMetricRow(value: "\(Int(workoutManager.metrics.heartRate.rounded())) BPM")
                    SummaryMetricRow(value: formatElapsedTime(workoutManager.metrics.elapsedTime))
                }
                
                Spacer()
                
                // 하단 버튼
                Button(action: {
                    Task {
                        workoutManager.resetWorkout()
                        isActive = false
                    }
                }) {
                    Text("확인")
                        .font(.system(.title3, design: .rounded, weight: .bold))
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: 44, maxHeight: 52)
                        .background(Color.gray900)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
                .padding(.bottom, 12)
            }
            .padding(.horizontal, 12)
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .background(Color.appBackground) 
        .ignoresSafeArea()
    }
}

// MARK: - Pause Menu View
struct PauseMenuView: View {
    @Environment(WorkoutManager.self) var workoutManager
    
    var body: some View {
        GeometryReader { geometry in
            let screenHeight = geometry.size.height
            let availableHeight = screenHeight - geometry.safeAreaInsets.top - geometry.safeAreaInsets.bottom
            let buttonHeight = (availableHeight * 0.6) / 2
            
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 12) {
                Spacer()
                
                PauseMenuButton(
                    title: "러닝 완료",
                    systemImage: "checkmark.circle.fill",
                    height: buttonHeight,
                    action: { try? workoutManager.endWorkout() }
                )
                
                PauseMenuButton(
                    title: "러닝 재개",
                    systemImage: "play.fill",
                    height: buttonHeight,
                    action: { try? workoutManager.resumeWorkout() }
                )
                
                Spacer()
            }
            .padding(.horizontal, 12)
        }
    }
}

struct PauseMenuButton: View {
    let title: String
    let systemImage: String
    let height: CGFloat
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.system(.title2, design: .rounded, weight: .semibold))
                
                Text(title)
                    .font(.system(.title3, design: .rounded, weight: .bold))
            }
            .foregroundStyle(.black)
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .background(Color.neonGreen)
            .clipShape(RoundedRectangle(cornerRadius: 15, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

struct CountdownView: View {
    @State private var remainingSeconds = 3
    @State private var scale: CGFloat = 1.0
    
    public let onFinished: () -> Void
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.black.ignoresSafeArea()
                
                Text("\(remainingSeconds)")
                    .font(.system(size: geometry.size.height * 0.5, weight: .semibold, design: .rounded))
                    .foregroundColor(.neonGreen)
                    .scaleEffect(scale)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .ignoresSafeArea(.all)
        .onReceive(timer) { _ in
            if remainingSeconds > 1 {
                remainingSeconds -= 1
                WKInterfaceDevice.current().play(.directionUp)
                
                withAnimation(.easeInOut(duration: 0.2)) {
                    scale = 1.2
                }
                withAnimation(.easeInOut(duration: 0.2).delay(0.2)) {
                    scale = 1.0
                }
            } else {
                remainingSeconds = 3
                WKInterfaceDevice.current().play(.start)
                onFinished()
            }
        }
    }
}

struct MetricItem: View {
    let value: String
    let unit: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .center, spacing: 2) {
            Text(value)
                .font(.system(.body, design: .rounded, weight: .semibold))
                .monospacedDigit()
            Text(unit)
                .font(.system(.caption, design: .rounded))
                .foregroundColor(color)
        }
    }
}

struct SummaryMetricRow: View {
    let value: String
    var body: some View {
        Text(value)
            .font(.system(.body, design: .rounded, weight: .medium))
            .foregroundStyle(.gray300) 
            .monospacedDigit()
    }
}

extension View {
    func maxFrame(maxWidth: CGFloat, maxHeight: CGFloat) -> some View {
        self.frame(maxWidth: maxWidth, maxHeight: maxHeight)
    }
}

// MARK: - Global Helper Functions
func formatElapsedTime(_ time: TimeInterval) -> String {
    let totalSeconds = Int(time)
    let hours = totalSeconds / 3600
    let minutes = (totalSeconds % 3600) / 60
    let seconds = totalSeconds % 60
    
    if hours > 0 {
        // 1시간 이상일 경우: "01:05:30"
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    } else {
        // 1시간 미만일 경우: "05:30"
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

func formatPace(_ pace: Double) -> String {
    let minutes = Int(pace)
    let seconds = Int((pace - Double(minutes)) * 60)
    return String(format: "%d'%02d\"", minutes, seconds)
}

#Preview {
    ContentView()
}
