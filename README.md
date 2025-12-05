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
| Node.js              | 20+     |                          |
| Xcode                | 15+     | App Store에서 설치       |
| iOS 기기             | iOS 17+ | **시뮬레이터 제한 있음** |
| watchOS              | 10+     | Watch 미러링 시 필요     |
| Apple Developer 계정 | -       | 실기기 테스트 필수       |

### ⚠️ 시뮬레이터 제한사항

| 기능                |   시뮬레이터   | 실제 기기 |
| ------------------- | :------------: | :-------: |
| HealthKit 읽기/쓰기 |       ❌       |    ✅     |
| 심박수 측정         |       ❌       |    ✅     |
| GPS 위치            | ⚠️ 가상 위치만 |    ✅     |
| 운동 세션           |       ❌       |    ✅     |
| Watch 연동          |       ❌       |    ✅     |

> 💡 **핵심 기능 테스트는 반드시 실제 기기에서 진행하세요.**

---

## CNG (Continuous Native Generation) 이해하기

Expo의 CNG는 `app.json` 설정을 기반으로 네이티브 프로젝트(ios/, android/)를 자동 생성하는 방식입니다.

```
app.json + 네이티브 모듈 설정
          ↓
    npx expo prebuild
          ↓
    ios/ , android/ 폴더 생성
          ↓
    Xcode/Android Studio에서 빌드
```

### 핵심 명령어 비교

| 명령어                      | 용도                         | 언제 사용?                       |
| --------------------------- | ---------------------------- | -------------------------------- |
| `npx expo prebuild`         | 네이티브 폴더 생성/업데이트  | 최초 설정, 네이티브 설정 변경 시 |
| `npx expo prebuild --clean` | 네이티브 폴더 삭제 후 재생성 | 빌드 오류, 캐시 문제             |
| `npx pod-install`           | iOS 의존성만 재설치          | Podfile 변경, pod 관련 에러      |

### ✅ `--clean` 사용 가능

CNG 환경 최적화가 완료되어 언제든 `--clean`을 사용할 수 있습니다.

```bash
npx expo prebuild --clean
```

> ⚠️ **주의:** 실행 후 Xcode에서 **iPhone, Watch 타겟 모두 Team 재설정**이 필요합니다.

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

### 3. Xcode에서 프로젝트 열기

```bash
# ios 폴더에서 .xcworkspace 파일을 Xcode로 열기
xed ios
```

> ⚠️ `.xcodeproj`가 아닌 `.xcworkspace`를 열어야 합니다.

### 4. Apple Developer 계정 설정

> ⚠️ **`prebuild --clean` 실행 시마다 이 설정이 초기화됩니다.**

**iPhone 타겟과 Watch 타겟 모두** 서명 설정이 필요합니다:

1. Xcode 좌측 네비게이터에서 **프로젝트 선택** (파란 아이콘)
2. **TARGETS**에서 각각 선택:
   - `dalryeo` (iPhone)
   - `dalryeo Watch App` (Watch)
3. **Signing & Capabilities** 탭 클릭
4. **Team** 드롭다운에서 계정 선택
   - 계정이 없으면: `Add Account...` → Apple ID 로그인
5. **Bundle Identifier** 고유하게 변경

```
   com.yourname.dalryeo  # 예시
```

### 5. 실제 기기에서 실행

1. iPhone을 Mac에 USB 연결 (Watch 미러링 테스트 시 Watch도 페어링 상태 유지)
2. iPhone에서 "이 컴퓨터를 신뢰" 허용
3. Xcode 상단에서 연결된 기기 선택
4. ▶️ Run 버튼 클릭 (또는 `Cmd + R`)

### 6. 기기에서 앱 신뢰 설정 (최초 1회)

무료 개발자 계정 사용 시:

1. iPhone → **설정** → **일반** → **VPN 및 기기 관리**
2. 개발자 앱에서 본인 Apple ID 선택
3. **"[Apple ID] 신뢰"** 탭

---

## 문제 해결

| 증상                       | 해결                                                 |
| -------------------------- | ---------------------------------------------------- |
| Pod 관련 오류              | `npx pod-install`                                    |
| 빌드 오류, 설정 꼬임       | `npx expo prebuild --clean` → Team 재설정            |
| Xcode 캐시 문제            | Xcode → Product → Clean Build Folder (`Cmd+Shift+K`) |
| Watch 앱 설치 안 됨        | iPhone-Watch 페어링 확인, Watch "개발자" 모드 활성화 |
| "Untrusted Developer" 오류 | 위 **기기에서 앱 신뢰 설정** 참고                    |
| HealthKit 권한이 안 뜸     | 시뮬레이터 불가 → 실제 기기 사용                     |

---

## 프로젝트 구조

```
├── modules/workout/
│   ├── ios/
│   │   ├── Shared/                   # iPhone-Watch 공유 코드
│   │   │   ├── WorkoutMetrics.swift
│   │   │   ├── WorkoutControlling.swift
│   │   │   └── WorkoutError.swift
│   │   ├── WorkoutModule.swift       # Expo 모듈 진입점
│   │   ├── WorkoutManager.swift      # iPhone 단독 모드
│   │   ├── WatchLedWorkoutManager.swift  # Watch 미러링 모드
│   │   └── DeviceManager.swift       # 기기 감지
│   ├── src/
│   │   ├── WorkoutModule.ts
│   │   ├── Workout.types.ts
│   │   └── WorkoutError.ts
│   └── index.ts
│
├── dalryeo Watch App/                # watchOS 앱
│   ├── DalryeoWatchApp.swift
│   ├── WorkoutManager.swift
│   ├── ContentView.swift
│   ├── MetricsView.swift
│   └── ControlsView.swift
│
├── plugin/                           # Expo Config Plugins
│   ├── src/index.ts                  # 진입점
│   └── ios/
│       ├── withIosRunning.ts         # iPhone 권한 설정
│       └── withWatchRunning.ts       # Watch 타겟 자동 생성
│
└── app.json                          # Expo 설정
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
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [WatchConnectivity](https://developer.apple.com/documentation/watchconnectivity)
