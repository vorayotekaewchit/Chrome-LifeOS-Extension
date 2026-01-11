#!/bin/bash

# Script to create Chrome extension icons from a source image
# Usage: ./create-icons.sh path/to/your-icon.png

if [ -z "$1" ]; then
    echo "Usage: ./create-icons.sh path/to/your-icon.png"
    echo "This will create icon16.png, icon48.png, and icon128.png in the dist folder"
    exit 1
fi

SOURCE_IMAGE="$1"
DIST_DIR="dist"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    exit 1
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
    echo "Error: Failed to create icons. Make sure 'sips' is available."
    exit 1
fi
