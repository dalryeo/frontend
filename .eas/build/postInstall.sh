#!/bin/bash
set -eo pipefail

WATCH_BUNDLE_ID="com.dalryeo.ios.watchkitapp"
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
PBXPROJ="ios/dalryeo.xcodeproj/project.pbxproj"

echo "=== Watch App Signing Injection ==="
echo "Looking for profile: $WATCH_BUNDLE_ID"

# EAS가 설치한 프로비저닝 프로파일 중 Watch 앱 것을 찾는다
WATCH_PROFILE_UUID=""
for profile in "$PROFILES_DIR"/*.mobileprovision; do
  [ -f "$profile" ] || continue
  PLIST=$(security cms -D -i "$profile" 2>/dev/null) || continue
  APP_ID=$(echo "$PLIST" | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null || echo "")
  if [[ "$APP_ID" == *".$WATCH_BUNDLE_ID" || "$APP_ID" == "$WATCH_BUNDLE_ID" ]]; then
    WATCH_PROFILE_UUID=$(echo "$PLIST" | plutil -extract UUID raw -o - - 2>/dev/null)
    WATCH_PROFILE_NAME=$(echo "$PLIST" | plutil -extract Name raw -o - - 2>/dev/null)
    echo "Found: $WATCH_PROFILE_NAME ($WATCH_PROFILE_UUID)"
    break
  fi
done

if [ -z "$WATCH_PROFILE_UUID" ]; then
  echo "No Watch app profile found. Available profiles:"
  for p in "$PROFILES_DIR"/*.mobileprovision; do
    [ -f "$p" ] || continue
    ID=$(security cms -D -i "$p" 2>/dev/null | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null || echo "unknown")
    echo "  $ID"
  done
  echo "Skipping Watch app profile injection."
  exit 0
fi

# pbxproj에 PROVISIONING_PROFILE_SPECIFIER 주입
python3 - << PYEOF
watch_bundle = "$WATCH_BUNDLE_ID"
profile_uuid = "$WATCH_PROFILE_UUID"
pbxproj_path = "$PBXPROJ"

with open(pbxproj_path, "r") as f:
    content = f.read()

if watch_bundle not in content:
    print("Watch app bundle ID not found in pbxproj. Skipping.")
    exit(0)

if "PROVISIONING_PROFILE_SPECIFIER" in content:
    print("PROVISIONING_PROFILE_SPECIFIER already set. Skipping.")
    exit(0)

# PRODUCT_BUNDLE_IDENTIFIER = "com.dalryeo.ios.watchkitapp"; 바로 뒤에 주입
target = f'PRODUCT_BUNDLE_IDENTIFIER = "{watch_bundle}";'
inject = f'PROVISIONING_PROFILE_SPECIFIER = "{profile_uuid}";'
new_content = content.replace(target, target + "\n\t\t\t\t" + inject)

with open(pbxproj_path, "w") as f:
    f.write(new_content)

print(f"Injected PROVISIONING_PROFILE_SPECIFIER: {profile_uuid}")
PYEOF
