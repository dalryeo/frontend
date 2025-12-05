# Workout Module

> React Native Expo 기반 러닝 추적 네이티브 모듈

## 현재 상태

- ✅ **iPhone 단독 모드** - HealthKit + 위치 기반 러닝 추적
- ✅ **Apple Watch 미러링** - WatchConnectivity 기반 실시간 동기화
- ✅ **CNG 최적화 완료** - `npx expo prebuild --clean` 언제든 사용 가능

---

## 운동 모드

API 호출 시 **자동으로 기기 상태를 감지**하여 적절한 모드로 운동을 시작합니다.

| 모드             | 조건               | 동작                                             |
| ---------------- | ------------------ | ------------------------------------------------ |
| **Watch 미러링** | Apple Watch 연결됨 | Watch에서 운동 세션 실행, iPhone과 실시간 동기화 |
| **iPhone 단독**  | Watch 미연결       | iPhone에서 직접 HealthKit 세션 실행              |

```typescript
// 개발자는 단순히 API만 호출
const result = await workoutModule.start();
// → 내부에서 Watch 연결 여부 감지 후 적절한 모드로 시작
```

---

## 시작하기 전에

### 필수 요구사항

| 항목                 | 버전    | 비고                     |
| -------------------- | ------- | ------------------------ |
| Node.js              | 18+     |                          |
| Xcode                | 15+     | App Store에서 설치       |
| iOS 기기             | iOS 17+ | **시뮬레이터 제한 있음** |
| watchOS              | 10+     | Watch 미러링 시 필요     |
| Apple Developer 계정 | -       | 실기기 테스트 필수       |

### ⚠️ 시뮬레이터 제한사항

| 기능                | 시뮬레이터 | 실제 기기 |
| ------------------- | :--------: | :-------: |
| HealthKit 읽기/쓰기 |     ❌     |    ✅     |
| 심박수 측정         |     ❌     |    ✅     |
| GPS 위치            | ⚠️ 가상만  |    ✅     |
| Watch 연동          |     ❌     |    ✅     |

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 네이티브 프로젝트 생성

```bash
npx expo prebuild --clean
```

### 3. Xcode에서 실행

```bash
xed ios
```

### 4. Apple Developer 계정 설정

> ⚠️ **`prebuild --clean` 실행 시마다 이 설정이 초기화됩니다.**

**iPhone 타겟과 Watch 타겟 모두** 서명 설정이 필요합니다:

1. Xcode 좌측에서 프로젝트 선택 (파란 아이콘)
2. **TARGETS**에서 각각 선택:
   - `dalryeo` (iPhone)
   - `dalryeo Watch App` (Watch)
3. **Signing & Capabilities** → **Team** 선택
4. Bundle Identifier 고유하게 변경

### 5. 기기에서 실행

1. iPhone + Apple Watch를 Mac에 연결
2. Xcode 상단에서 기기 선택
3. ▶️ Run (`Cmd + R`)

---

## 문제 해결

### Pod 설치 오류

```bash
cd ios && rm -rf Pods Podfile.lock && cd ..
npx pod-install
```

### 빌드 캐시 문제

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
npx expo prebuild --clean
```

> ⚠️ `--clean` 후 반드시 **Team 재설정** 필요

### Watch 앱이 설치 안 됨

- iPhone과 Watch가 페어링 상태인지 확인
- Watch 앱에서 "개발자" 모드 활성화

---

## 프로젝트 구조

```
├── modules/workout/
│   ├── ios/
│   │   ├── Shared/           # iPhone-Watch 공유 코드
│   │   ├── WorkoutModule.swift
│   │   ├── WorkoutManager.swift      # iPhone 단독
│   │   └── WatchLedWorkoutManager.swift  # Watch 미러링
│   ├── src/
│   │   ├── WorkoutModule.ts
│   │   └── Workout.types.ts
│   └── index.ts
│
├── dalryeo Watch App/        # watchOS 앱
│   ├── WorkoutManager.swift
│   ├── ContentView.swift
│   └── MetricsView.swift
│
└── plugin/                   # Expo Config Plugins
    ├── src/index.ts          # 진입점
    └── ios/
        ├── withIosRunning.ts     # iPhone 권한
        └── withWatchRunning.ts   # Watch 타겟 자동 생성
```

---

## 로드맵

- [x] iPhone 단독 러닝 추적
- [x] HealthKit 연동
- [x] 실시간 메트릭 이벤트
- [x] Apple Watch 미러링
- [x] 백그라운드 위치 추적
- [x] CNG 환경 최적화
- [ ] Android 지원

---

## 참고 문서

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [WatchConnectivity](https://developer.apple.com/documentation/watchconnectivity)
