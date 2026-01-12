# Chrome LifeOS Extension

A Chrome extension built with React, TypeScript, Vite, and Tailwind CSS.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server (for web preview only):
```bash
npm run dev
```

**Note:** The dev server is for web preview. For Chrome extension testing, you must build the extension first.

## Building for Chrome Extension

1. Build the extension:
```bash
npm run build
```

This will:
- Compile TypeScript
- Build the React app with Vite
- Copy `manifest.json` to the `dist` folder
- Copy `background.js` to the `dist` folder

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - **IMPORTANT:** Select the `dist` folder from this project (NOT the root folder)
   - The extension should now appear in your extensions list

3. Test the extension:
   - Click the extension icon in your Chrome toolbar
   - The popup should open showing the LifeOS interface

## Troubleshooting CSP Errors

If you see Content Security Policy errors:

1. **Make sure you're loading from the `dist` folder**, not the root folder
2. **Rebuild the extension** after making changes:
   ```bash
   npm run build
   ```
3. **Reload the extension** in Chrome (click the reload icon on the extension card)
4. **Clear browser cache** if errors persist

The `Life-OS-Productivity-App` folder in the root directory is a reference project and should NOT be loaded as an extension. Only load the `dist` folder.

## Project Structure

- `popup.html` - The HTML entry point for the Chrome extension popup
- `popup.tsx` - The React entry point that renders the ChromeExtensionPopup component
- `manifest.json` - Chrome extension manifest (Manifest V3)
- `components/ChromeExtensionPopup.tsx` - The main popup component
- `public/background.js` - Background service worker for notifications
- `dist/` - Build output directory (created after running `npm run build`)

## Notes

- The extension uses Chrome's storage API (chrome.storage.sync with localStorage fallback)
- The popup is sized to 360x500px
- Icons referenced in manifest.json should be added to the dist folder (or create placeholder icons)
- The extension includes mission-based productivity features with XP, streaks, and progress tracking
