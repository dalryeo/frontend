//
//  ContentView.swift
//  watch-led-wc Watch App
//
//  Created by jeongbae bang on 11/7/25.
//

import SwiftUI

struct ContentView: View {
    @State var workoutManager = WorkoutManager.shared
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // 운동 데이터 표시
                MetricsView(
                    elapsedTime: workoutManager.metrics.elapsedTime,
                    heartRate: workoutManager.metrics.heartRate,
                    calories: workoutManager.metrics.calories,
                    distance: workoutManager.metrics.distance,
                    pace: workoutManager.metrics.pace
                )
                
                // 컨트롤 버튼 - 낙관적 상태 사용
                ControlsView(
                    workoutState: workoutManager.metrics.sessionState,
                    onStart: {
                        Task {
                            try await workoutManager.startWorkout()
                        }
                    },
                    onPause: {
                        try? workoutManager.pauseWorkout()
                    },
                    onResume: {
                        try? workoutManager.resumeWorkout()
                    },
                    onEnd: {
                        try? workoutManager.endWorkout()
                    },
                    onReset: {
                        workoutManager.resetWorkout()
                    }
                )
            }
            .padding()
            .onAppear {
                Task {
                    do {
                        try await  workoutManager.requestHealthAuthorization()
                    }catch {
                        WorkoutLogger.error("❌ HealthKit 권한 요청 실패: \(error.localizedDescription)")
                    }
                    
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
