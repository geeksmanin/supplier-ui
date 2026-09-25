#!/usr/bin/env bash

# ======================================================================
# Geeksman Universal Android Wrapper CLI Runner
# ======================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="geeksman-android-builder"

# If --help is requested, pass directly to convert.js
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    node "$SCRIPT_DIR/scripts/convert.mjs" --help
    exit 0
fi

# Check for local execution flag
USE_LOCAL=false
for arg in "$@"; do
    if [ "$arg" = "--local" ]; then
        USE_LOCAL=true
    fi
done

# If --local requested, or Docker is not installed, or Docker daemon is not running, run via host Node/Gradle
if [ "$USE_LOCAL" = true ] || ! command -v docker &> /dev/null || ! docker info &> /dev/null; then
    echo "[Runner] Docker daemon inactive or --local specified; executing via host environment..."
    node "$SCRIPT_DIR/scripts/convert.mjs" "$@"
    exit 0
fi

# Build Docker builder image if not already built
if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
    echo "[Docker] Building Android build container image ($IMAGE_NAME)..."
    docker build --platform linux/amd64 -t "$IMAGE_NAME" -f "$SCRIPT_DIR/Dockerfile" "$SCRIPT_DIR"
fi

# Prepare output directory
mkdir -p "$SCRIPT_DIR/dist"

echo "[Docker] Launching Android conversion inside container..."
docker run --rm --platform linux/amd64 \
    -v "$SCRIPT_DIR/dist:/app/dist" \
    -v "$SCRIPT_DIR/config:/app/config:ro" \
    -v "$SCRIPT_DIR/apps.json:/app/apps.json:ro" \
    -w /app \
    "$IMAGE_NAME" \
    node scripts/convert.mjs "$@"
