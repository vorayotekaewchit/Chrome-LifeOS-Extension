# Chrome Extension Debugging Guide

## How to Debug Your Extension

### 1. Check Extension Errors
1. Open Chrome and go to `chrome://extensions/`
2. Find your "LifeOS Extension"
3. Click "Inspect views: popup.html" (or click the "service worker" link if it shows errors)
4. This opens Chrome DevTools for your extension

### 2. View Console Logs
- In the DevTools, go to the "Console" tab
- Look for any red error messages
- Check for warnings (yellow messages)

### 3. Common Issues to Check

#### JavaScript Not Loading
- Check if you see errors like "Failed to load resource" for popup.js or popup.css
- Make sure you've run `npm run build` after making changes
- Reload the extension in chrome://extensions/

#### Popup Not Showing
- Right-click the extension icon → "Inspect popup"
- Check if React is mounting correctly (look for the #root div)
- Check if there are any console errors

#### Styles Not Loading
- Check if popup.css is loading in the Network tab
- Make sure Tailwind CSS classes are being applied
- Check the Elements tab to see computed styles

#### localStorage Issues
- Check Application tab → Local Storage in DevTools
- Look for `lifeOsTheme` and `lifeOsTasks` keys
- Chrome extensions use a separate localStorage from web pages

### 4. Quick Debug Checklist
- ✅ Build completed without errors (`npm run build`)
- ✅ Extension reloaded in chrome://extensions/
- ✅ Console has no errors
- ✅ Assets (popup.js, popup.css) are loading
- ✅ React component is rendering (check #root element)

### 5. Useful Debug Commands

```bash
# Rebuild the extension
npm run build

# Check if dist folder has all files
ls -la dist/

# Verify manifest.json is valid
cat dist/manifest.json
```
