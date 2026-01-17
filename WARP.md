# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Key commands

All commands are run from the repo root.

### Install dependencies

```bash
npm install
```

### Development (web preview only)

Vite is used for a browser-based preview of the popup UI (not a real extension context).

```bash
npm run dev
```

Use this to iterate on React components and layout. Chrome APIs (e.g. `chrome.storage`) will not be available in this mode.

### Build the Chrome extension

This is the main command you should run before loading/reloading the extension in Chrome.

```bash
npm run build
```

`npm run build` will:
- Run `vite build` to compile the React/TypeScript app into `dist/`
- Copy `manifest.json` into `dist/`
- Copy `public/background.js` into `dist/background.js`
- Run `scripts/create-icons.sh` to generate `icon16.png`, `icon48.png`, and `icon128.png` in `dist/` (uses macOS `sips`; on other platforms the script may only emit warnings)

A convenience alias also exists:

```bash
npm run build:extension
```

### Preview the built web bundle (optional)

```bash
npm run preview
```

This serves the built assets via Vite’s preview server. This is mainly useful for sanity-checking the compiled UI outside of the extension environment.

### Linting

```bash
npm run lint
```

This runs ESLint on all TypeScript/TSX files with strict settings (no unused disable directives, zero max warnings).

### Dist sanity checks / debug helpers

Some useful commands derived from `DEBUG.md` when debugging extension builds:

```bash
# Rebuild the extension
npm run build

# Inspect the built output
ls -la dist/

# Verify the manifest that Chrome will consume
cat dist/manifest.json
```

### Tests

There is currently no test runner configured (no `test` script in `package.json`). If you add one (e.g. Vitest/Jest/Playwright), document how to run the full suite and a single test here.

## Chrome extension workflow

The canonical workflow to work on and debug the extension is:

1. Build the extension:
   - `npm run build`
2. Load or reload in Chrome:
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Use **Load unpacked** and select the `dist/` directory (not the repo root)
3. Open the popup and DevTools:
   - Click the LifeOS extension icon to open `popup.html`
   - Right-click the popup → **Inspect** to open DevTools for the popup
4. Check common issues (from `DEBUG.md`):
   - Confirm the `#root` element exists and React is mounting
   - Check the **Console** for errors (missing JS/CSS, CSP issues, etc.)
   - Use the **Network** tab to ensure built assets are loading
5. After code changes:
   - Re-run `npm run build`
   - Click the **Reload** icon on the extension card in `chrome://extensions/`

If you hit CSP issues, double‑check that you are loading from the freshly built `dist/` folder and have reloaded the extension after rebuilding.

## High-level architecture

### Tech stack overview

- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Radix UI primitives, Zustand for UI state
- **Extension platform:** Chrome Extension Manifest V3 (`manifest.json`)
- **Storage:** `chrome.storage.sync` with `localStorage` fallback via utility helpers in `utils/storage.ts`
- **Backend (optional):** Deno + Hono app under `server/` that talks to Supabase as a key–value store

### React entry points and HTML shells

- `main.tsx`
  - Standard Vite entry that renders `<App />` into `#root` in `index.html`.
  - Used for local web preview (`npm run dev` / `npm run preview`).
- `popup.tsx`
  - Entry for the actual extension popup. Renders `<ChromeExtensionPopup />` into `#root` in `popup.html`.
  - `popup.html` is referenced as the `default_popup` in `manifest.json`.
- `App.tsx`
  - Currently wraps `ChromeExtensionPopup` in a full-page layout for the web preview.
  - Contains a large commented-out block with the original mobile-style, multi-screen LifeOS app; this can be used if you want to revive a non-extension experience.

### Popup flow and screens

The primary user experience lives in `components/ChromeExtensionPopup.tsx`:

- Coordinates high-level **productivity flow** using four screen components from `components/screens/`:
  - `InputScreen` – collects user input for the day and triggers mission generation.
  - `PlanScreen` – shows the generated missions and allows the user to start their day.
  - `FocusScreen` – executes missions, allowing completion/skip and tracking XP.
  - `DashboardScreen` – shows streaks and last-7-days stats and allows resetting the day.
- Uses a bottom navigation component `components/BottomTabBar.tsx` with a `Tab` union type to switch between `plan`, `focus`, and `dashboard` views.
- Manages **domain state** via React `useState` with the `AppState` shape (missions, xp, streak, last7Days, currentView, lastResetDate).
- Derives and passes screen-specific props, e.g.:
  - `InputScreen` gets `onGeneratePlan` and `previousMissions`.
  - `PlanScreen` gets `missions`, `streak`, and `onStartDay`.
  - `FocusScreen` gets `missions`, `streak`, `xp`, and handlers for complete/skip/finish.
  - `DashboardScreen` gets `missions`, `xp`, `streak`, `last7Days`, and `onResetDay`.

### State management and persistence

There are two layers of state:

1. **App data state** (missions, XP, streak, etc.)
   - Types and validators live in `utils/storage.ts`:
     - `Mission`, `MissionTag`, and `AppState` define the persisted shape.
     - `isMission` and `isAppState` are type guards used to validate stored data.
   - `safeGetFromStorage(key, validator, fallback)`
     - Reads from `chrome.storage.sync` when available, then falls back to `localStorage`.
     - Validates using the provided type guard and converts `completedAt` strings back into `Date` instances.
   - `safeSetToStorage(key, value)`
     - Writes JSON to both `chrome.storage.sync` (if available) and `localStorage`.
   - `ChromeExtensionPopup` uses these helpers to load `lifeOS` state on mount and persist on every state change.

2. **UI/layout state** (current tab, visibility toggles, focus window index)
   - Implemented with Zustand in `hooks/useLifeOState.ts`:
     - Store shape: `currentPage`, `momentumBar.show`, `weeklyBox.show`, `focusWindow`, plus actions.
     - Persists under the `lifeOUIState` key to `chrome.storage.sync` + `localStorage` via an internal `saveToStorage` helper.
   - `hydrateLifeOState()`
     - Asynchronously hydrates the Zustand store from `chrome.storage.sync`, falling back to `localStorage` or defaults.
   - `ChromeExtensionPopup` integrates this store to keep the bottom tab bar (`BottomTabBar`) in sync with `currentView` and user preferences.

When modifying any of these types or persistence helpers, be mindful of backwards compatibility with existing data already saved in users’ `chrome.storage.sync` / `localStorage`.

### Styling and layout

- Global styles live in `globals.css`, with Tailwind configured via `tailwind.config.js` and `postcss.config.js`.
- Components heavily use Tailwind utility classes for layout and typography.
- The popup container uses custom classes like `extension-container` and `extension-scrollable` for sizing and scroll behavior inside the constrained 360x500px popup described in `README.md`.

### Background worker and notifications

- `public/background.js` is copied to `dist/background.js` during the build.
- `manifest.json` configures it as a Manifest V3 service worker under the `background.service_worker` field.
- The manifest currently declares permissions for `storage`, `alarms`, and `notifications`, aligning with the mission-based daily workflow.

### Deno/Hono Supabase backend (server/)

The `server/` directory contains a small Deno-based service that can be deployed separately from the extension:

- `server/index.tsx`
  - Creates a Hono app with logging and permissive CORS configured for all routes.
  - Exposes a health check at `/make-server-85c8422a/health`.
  - Uses `Deno.serve(app.fetch)` as the entrypoint, suitable for Deno Deploy or similar environments.
- `server/kv_store.tsx`
  - Autogenerated thin wrapper around Supabase acting as a key–value store table `kv_store_85c8422a`.
  - Exposes helpers: `set`, `get`, `del`, `mset`, `mget`, `mdel`, `getByPrefix`.
  - Expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment.

There is no npm script wired up to run this server; if you need to run or extend it, use the Deno CLI or your hosting platform’s configuration.

## Key directories and files

This is a non-exhaustive list of important locations:

- `components/`
  - Reusable UI primitives and extension-specific components, including `ChromeExtensionPopup`, `BottomTabBar`, and screen components under `components/screens/`.
- `hooks/`
  - Custom React hooks, currently focused on the Zustand-powered UI store (`useLifeOState.ts`).
- `utils/`
  - Shared utilities, notably `storage.ts` for typed, resilient storage access.
- `public/`
  - Static assets bundled into the extension, including `background.js` and any base icon images used by `scripts/create-icons.sh`.
- `scripts/`
  - Build-time scripts like `create-icons.sh` that post-process `dist/`.
- `server/`
  - Deno-based backend code described above.
- `dist/`
  - Build output targeted by the extension loader (created/overwritten by `npm run build`).

## Notes for future agents

- When changing the shape of `Mission` or `AppState`, update both the type definitions and the validator functions in `utils/storage.ts`, and consider migration behavior for existing stored data.
- UI navigation is coordinated between `ChromeExtensionPopup` and the Zustand store in `hooks/useLifeOState.ts`; keep these in sync when adding new tabs or views.
- For extension-specific bugs, prefer debugging against the built `dist/` bundle loaded via `chrome://extensions/` rather than relying solely on the Vite dev server preview.