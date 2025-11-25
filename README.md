# Workout Module

> React Native Expo 기반 운동 추적 네이티브 모듈

## 현재 상태

- ✅ **iPhone 단독 모드** - HealthKit + 위치 기반 러닝 추적
- 🚧 **Apple Watch 미러링** - 개발 예정 (WatchConnectivity 연동)

---

## 시작하기 전에

### 필수 요구사항

| 항목                 | 버전    | 비고                     |
| -------------------- | ------- | ------------------------ |
| Node.js              | 18+     |                          |
| Xcode                | 15+     | App Store에서 설치       |
| iOS 기기             | iOS 17+ | **시뮬레이터 제한 있음** |
| Apple Developer 계정 | -       | 계정 확인 필요           |

### ⚠️ 시뮬레이터 제한사항

| 기능                |   시뮬레이터   | 실제 기기 |
| ------------------- | :------------: | :-------: |
| HealthKit 읽기/쓰기 |       ❌       |    ✅     |
| 심박수 측정         |       ❌       |    ✅     |
| GPS 위치            | ⚠️ 가상 위치만 |    ✅     |
| 운동 세션           |       ❌       |    ✅     |

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
| `npx expo prebuild --clean` | 네이티브 폴더 삭제 후 재생성 | 심각한 빌드 오류, 캐시 문제      |
| `npx pod-install`           | iOS 의존성만 재설치          | Podfile 변경, pod 관련 에러      |

### ⚠️ `--clean` 주의사항

```bash
# 🚨 이 명령은 ios/, android/ 폴더를 완전히 삭제합니다
npx expo prebuild --clean
```

**사용하면 안 되는 경우:**

- 네이티브 코드를 직접 수정한 경우 (Swift/Kotlin 파일 등)
- Apple Watch 타겟을 수동으로 추가한 경우
- Xcode 프로젝트 설정을 커스텀한 경우

> 🔮 **향후 Apple Watch 미러링 구현 시**, Watch 타겟이 수동 추가되므로 `--clean` 사용 시 Watch 설정이 모두 삭제됩니다.

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 네이티브 프로젝트 생성

```bash
# 첫 프로젝트 로드시
npx expo prebuild --clean
```

### 3. Xcode에서 프로젝트 열기

```bash
# ios 폴더에서 .xcworkspace 파일을 Xcode로 열기
xed ios
```

> ⚠️ `.xcodeproj`가 아닌 `.xcworkspace`를 열어야 합니다.

### 4. Apple Developer 계정 설정

Xcode에서 실제 기기 빌드를 위해 서명 설정이 필요합니다.

1. Xcode 좌측 네비게이터에서 **프로젝트 선택** (파란 아이콘)
2. **Signing & Capabilities** 탭 클릭
3. **Team** 드롭다운에서 계정 선택
   - 계정이 없으면: `Add Account...` → Apple ID 로그인
4. **Bundle Identifier** 고유하게 변경
   ```
   com.yourname.workoutapp  # 예시
   ```

### 5. 실제 기기에서 실행

1. iPhone을 Mac에 USB 연결
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

### Pod 설치 오류

```bash
# Podfile.lock 삭제 후 재설치
cd ios && rm -rf Pods Podfile.lock && cd ..
npx pod-install
```

### 빌드 캐시 문제

```bash
# Xcode 캐시 정리
rm -rf ~/Library/Developer/Xcode/DerivedData

# 그래도 안 되면 (네이티브 수정사항 없을 때만!)
npx expo prebuild --clean
```

### "Untrusted Developer" 오류

→ 위 **기기에서 앱 신뢰 설정** 참고

### HealthKit 권한이 안 뜸

- 시뮬레이터에서는 HealthKit 불가 → 실제 기기 사용
- `ios/[앱이름]/Info.plist`에 권한 설명 확인

---

## 프로젝트 구조

```
├── modules/workout/
│   ├── index.ts              # 모듈 진입점
│   ├── src/
│   │   ├── WorkoutModule.ts  # Native 모듈 바인딩
│   │   ├── Workout.types.ts  # 타입 정의
│   │   └── WorkoutError.ts   # 에러 핸들링
│   └── ios/                  # Swift 네이티브 코드
├── hooks/
│   ├── useWorkout.ts         # 통합 훅
│   └── useWorkoutPermissions.ts
└── app.json                  # Expo 설정
```

---

## 로드맵

- [x] iPhone 단독 러닝 추적
- [x] HealthKit 연동
- [x] 실시간 메트릭 이벤트
- [ ] Apple Watch 미러링
- [x] 백그라운드 위치 추적
- [ ] Android 지원

---

## 참고 문서

- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
