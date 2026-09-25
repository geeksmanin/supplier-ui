#!/usr/bin/env bash
# ======================================================================
# Geeksman Universal Android APK Builder & Version Publisher
# Usage:
#   bash <path-to-core-ui>/scripts/build-apk.sh [APP_DIR]
# Or from an app root:
#   npm run build:apk
# ======================================================================

set -e

TARGET_DIR="${1:-$(pwd)}"
cd "$TARGET_DIR"

if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in $TARGET_DIR"
  exit 1
fi

if [ ! -d "android" ]; then
  echo "Error: android/ directory not found in $TARGET_DIR. Run 'npx cap add android' first."
  exit 1
fi

APP_PKG_NAME=$(node -p "try { require('./package.json').name } catch(e) { '' }")
APP_PKG_VERSION=$(node -p "try { require('./package.json').version } catch(e) { '1.0.0' }")

echo "=================================================="
echo " Building Android APK for: ${APP_PKG_NAME} (v${APP_PKG_VERSION})"
echo " Target Directory: ${TARGET_DIR}"
echo "=================================================="

# 1. Sync Vendor & Build Web Assets
echo "[1/4] Building web bundle and syncing Capacitor..."
npm run build
npx cap sync android

# 2. Build Release APK via Gradle
echo "[2/4] Compiling release APK with Gradle..."
cd android

if [ -f "./gradlew" ]; then
  chmod +x ./gradlew
  ./gradlew assembleRelease
else
  gradle assembleRelease
fi

cd ..

# 3. Locate & Copy APK into public/downloads/
echo "[3/4] Preparing public/downloads artifact..."
mkdir -p public/downloads

# Determine target APK filename slug
SLUG="${APP_PKG_NAME#@geeksman/}"
SLUG="${SLUG#ajit-}"
SLUG="${SLUG%-catalogue}"
[ -z "$SLUG" ] && SLUG="app"

DEST_APK="public/downloads/${SLUG}.apk"

APK_SOURCE=""
CANDIDATE_PATHS=(
  "android/app/build/outputs/apk/release/app-release-unsigned.apk"
  "android/app/build/outputs/apk/release/app-release.apk"
  "android/app/build/outputs/apk/release/app-release-signed.apk"
)

for cand in "${CANDIDATE_PATHS[@]}"; do
  if [ -f "$cand" ]; then
    APK_SOURCE="$cand"
    break
  fi
done

if [ -n "$APK_SOURCE" ]; then
  cp "$APK_SOURCE" "$DEST_APK"
  echo "  --> Copied APK to $DEST_APK ($(du -h "$DEST_APK" | cut -f1))"
else
  echo "Error: No release APK found under android/app/build/outputs/apk/release/"
  exit 1
fi

# 4. Extract Android Gradle Version & Generate version.json
echo "[4/4] Generating version.json..."
GRADLE_FILE="android/app/build.gradle"
VERSION=""
BUILD=""
PACKAGE_ID=""

if [ -f "$GRADLE_FILE" ]; then
  VERSION=$(grep 'versionName' "$GRADLE_FILE" | head -1 | awk -F '"' '{print $2}')
  BUILD=$(grep 'versionCode' "$GRADLE_FILE" | head -1 | awk '{print $2}')
  PACKAGE_ID=$(grep 'applicationId' "$GRADLE_FILE" | head -1 | awk -F '"' '{print $2}')
fi

[ -z "$VERSION" ] && VERSION="$APP_PKG_VERSION"
[ -z "$BUILD" ] && BUILD="1"
[ -z "$PACKAGE_ID" ] && PACKAGE_ID="com.geeksmanos.${SLUG}"

VERSION_JSON="public/downloads/version.json"

cat <<EOF > "$VERSION_JSON"
{
  "app_name": "${APP_PKG_NAME}",
  "package_id": "${PACKAGE_ID}",
  "version": "${VERSION}",
  "version_code": ${BUILD},
  "min_version": "1.0.0",
  "apk_url": "/downloads/${SLUG}.apk",
  "changelog": "Native Android release with self-updater and push notification support.",
  "force_update": false
}
EOF

echo "  --> Generated $VERSION_JSON (v${VERSION} build ${BUILD})"
echo "=================================================="
echo " APK & Version Meta successfully prepared for deployment!"
echo "=================================================="
