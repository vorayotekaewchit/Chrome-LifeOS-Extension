#!/bin/bash

# Script to create Chrome extension icons
# This is automatically called during the build process

DIST_DIR="dist"
SOURCE_IMAGE=""

# Try to find a suitable source image
if [ -f "public/android-chrome-512x512.png" ]; then
  SOURCE_IMAGE="public/android-chrome-512x512.png"
elif [ -f "public/favicon.ico" ]; then
  SOURCE_IMAGE="public/favicon.ico"
elif [ -f "public/android-chrome-192x192.png" ]; then
  SOURCE_IMAGE="public/android-chrome-192x192.png"
fi

if [ -z "$SOURCE_IMAGE" ]; then
  echo "Warning: No source image found. Icons will not be created."
  exit 0
fi

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: dist folder not found. Please run 'npm run build' first."
  exit 1
fi

echo "Creating icons from $SOURCE_IMAGE..."

# Create icons using sips (macOS built-in tool)
sips -z 16 16 "$SOURCE_IMAGE" --out "$DIST_DIR/icon16.png" 2>/dev/null
sips -z 48 48 "$SOURCE_IMAGE" --out "$DIST_DIR/icon48.png" 2>/dev/null
sips -z 128 128 "$SOURCE_IMAGE" --out "$DIST_DIR/icon128.png" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✓ Icons created successfully in $DIST_DIR/"
  echo "  - icon16.png (16x16)"
  echo "  - icon48.png (48x48)"
  echo "  - icon128.png (128x128)"
else
  echo "Warning: Failed to create icons using sips."
  exit 0
fi
