#!/bin/bash
set -eo pipefail

WATCH_BUNDLE_ID="com.dalryeo.ios.watchkitapp"
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
mkdir -p "$PROFILES_DIR"

echo "=== Watch App Signing Injection ==="

WATCH_PROFILE_UUID=""

# ─────────────────────────────────────────────
# 방법 1: EAS가 설치한 프로파일에서 탐색
# ─────────────────────────────────────────────
echo "[1] 설치된 프로파일 목록:"
for profile in "$PROFILES_DIR"/*.mobileprovision; do
  [ -f "$profile" ] || continue
  PLIST=$(security cms -D -i "$profile" 2>/dev/null) || continue
  APP_ID=$(echo "$PLIST" | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null || echo "")
  echo "    $APP_ID"
  if [[ "$APP_ID" == *".$WATCH_BUNDLE_ID" || "$APP_ID" == "$WATCH_BUNDLE_ID" ]]; then
    WATCH_PROFILE_UUID=$(echo "$PLIST" | plutil -extract UUID raw -o - - 2>/dev/null)
    WATCH_PROFILE_NAME=$(echo "$PLIST" | plutil -extract Name raw -o - - 2>/dev/null)
    echo "    → Watch 프로파일 발견: $WATCH_PROFILE_NAME ($WATCH_PROFILE_UUID)"
  fi
done

# ─────────────────────────────────────────────
# 방법 2: WATCH_APP_PROFILE_BASE64 환경 변수 폴백
# (expo.dev > Environment Variables 에서 설정)
# ─────────────────────────────────────────────
if [ -z "$WATCH_PROFILE_UUID" ] && [ -n "$WATCH_APP_PROFILE_BASE64" ]; then
  echo "[2] WATCH_APP_PROFILE_BASE64 환경 변수로 프로파일 설치..."
  TEMP=$(mktemp /tmp/watch.XXXXXX.mobileprovision)
  echo "$WATCH_APP_PROFILE_BASE64" | base64 --decode > "$TEMP"

  PLIST=$(security cms -D -i "$TEMP" 2>/dev/null)
  APP_ID_CHECK=$(echo "$PLIST" | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null || echo "")

  if [[ "$APP_ID_CHECK" == *"$WATCH_BUNDLE_ID" ]]; then
    WATCH_PROFILE_UUID=$(echo "$PLIST" | plutil -extract UUID raw -o - - 2>/dev/null)
    WATCH_PROFILE_NAME=$(echo "$PLIST" | plutil -extract Name raw -o - - 2>/dev/null)
    cp "$TEMP" "$PROFILES_DIR/$WATCH_PROFILE_UUID.mobileprovision"
    echo "    → 설치 완료: $WATCH_PROFILE_NAME ($WATCH_PROFILE_UUID)"
  else
    echo "    → 오류: 프로파일 번들 ID 불일치 (실제: $APP_ID_CHECK)"
  fi
  rm -f "$TEMP"
fi

# ─────────────────────────────────────────────
# 프로파일을 끝내 못 찾은 경우: 안내 후 종료
# (빌드는 계속 진행 — Xcode 로그에서 원인 확인 가능)
# ─────────────────────────────────────────────
if [ -z "$WATCH_PROFILE_UUID" ]; then
  echo ""
  echo "❌ Watch 앱 프로비저닝 프로파일을 찾지 못했습니다."
  echo "   다음 단계를 따라 해결하세요:"
  echo "   1. Apple Developer Portal에서 com.dalryeo.ios.watchkitapp 프로파일 다운로드"
  echo "   2. base64 인코딩:  base64 -i watch.mobileprovision | pbcopy"
  echo "   3. expo.dev > 프로젝트 > Environment Variables 에 추가:"
  echo "      이름: WATCH_APP_PROFILE_BASE64  /  유형: Secret"
  exit 0
fi

# ─────────────────────────────────────────────
# pbxproj에 PROVISIONING_PROFILE_SPECIFIER 주입
# ─────────────────────────────────────────────
PBXPROJ=$(find ios -name "project.pbxproj" 2>/dev/null | head -1)
if [ -z "$PBXPROJ" ]; then
  echo "❌ project.pbxproj를 찾을 수 없습니다."
  exit 0
fi

echo "[3] pbxproj 주입: $WATCH_PROFILE_UUID"

python3 - "$WATCH_BUNDLE_ID" "$WATCH_PROFILE_UUID" "$PBXPROJ" << 'PYEOF'
import re, sys

watch_bundle = sys.argv[1]
profile_uuid  = sys.argv[2]
pbxproj_path  = sys.argv[3]

with open(pbxproj_path, "r") as f:
    content = f.read()

if watch_bundle not in content:
    print("Watch 앱 번들 ID가 pbxproj에 없습니다.")
    sys.exit(0)

target_str = 'PRODUCT_BUNDLE_IDENTIFIER = "' + watch_bundle + '";'
inject_str  = 'PROVISIONING_PROFILE_SPECIFIER = "' + profile_uuid + '";'

def maybe_inject(match):
    # 해당 빌드 설정 블록(매치 이후 500자)에 이미 있으면 건너뜀
    after = content[match.end(): match.end() + 500]
    if "PROVISIONING_PROFILE_SPECIFIER" in after:
        return match.group(0)
    return match.group(0) + "\n\t\t\t\t" + inject_str

new_content = re.sub(re.escape(target_str), maybe_inject, content)

if new_content == content:
    print("이미 PROVISIONING_PROFILE_SPECIFIER가 설정되어 있습니다.")
else:
    with open(pbxproj_path, "w") as f:
        f.write(new_content)
    count = len(re.findall(re.escape(target_str), content))
    print("✅ " + str(count) + "개 빌드 설정(Debug/Release)에 PROVISIONING_PROFILE_SPECIFIER 주입 완료")
PYEOF
