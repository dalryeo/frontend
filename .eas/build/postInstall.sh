#!/usr/bin/env bash
set -euo pipefail

sed -i "s/com\.dalryeo\.ios\.cujdev\.watchkitapp/com.dalryeo.ios.watchkitapp/g" ios/dalryeo.xcodeproj/project.pbxproj
sed -i "s/com\.dalryeo\.ios\.cujdev/com.dalryeo.ios/g" ios/dalryeo.xcodeproj/project.pbxproj
echo "Bundle IDs updated for CI build"
