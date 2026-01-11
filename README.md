# Chrome LifeOS Extension

A Chrome extension built with React, TypeScript, Vite, and Tailwind CSS.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Building for Chrome Extension

1. Build the extension:
```bash
npm run build
```

This will:
- Compile TypeScript
- Build the React app with Vite
- Copy `manifest.json` to the `dist` folder

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project
   - The extension should now appear in your extensions list

3. Test the extension:
   - Click the extension icon in your Chrome toolbar
   - The popup should open showing the LifeOS interface

## Project Structure

- `popup.html` - The HTML entry point for the Chrome extension popup
- `popup.tsx` - The React entry point that renders the ChromeExtensionPopup component
- `manifest.json` - Chrome extension manifest (Manifest V3)
- `components/ChromeExtensionPopup.tsx` - The main popup component
- `dist/` - Build output directory (created after running `npm run build`)

## Notes

- The extension uses Chrome's storage API (via localStorage in the component)
- The popup is sized to 400x500px
- Icons referenced in manifest.json should be added to the dist folder (or create placeholder icons)
