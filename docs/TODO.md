# ✅ TODO List – Kids 5-Minute Activity App (MVP)

## 🧱 Phase 1: Project Initialization & Structure

- [ ] Phase 1: Initialize Angular project with Capacitor and setup Angular Material  
**Acceptance Criteria**  
- [ ] Angular project created via `ng new` with routing  
- [ ] Capacitor installed and linked with `npx cap init`  
- [ ] Angular Material added and a basic theme applied (`ng add @angular/material`)  
- [ ] App runs on `localhost` and Android simulator

- [ ] Phase 1: Create app shell with routing and basic layout  
**Acceptance Criteria**  
- [ ] Routes set up for Home, Activity List, Activity Detail, and Settings  
- [ ] Basic layout with Angular Material toolbar and bottom nav  
- [ ] Dummy content shown for each screen  
- [ ] Navigation works between views without reloads

- [ ] Phase 1: Implement global language support with ngx-translate  
**Acceptance Criteria**  
- [ ] `ngx-translate` and `@ngx-translate/http-loader` installed  
- [ ] `assets/i18n/sr.json` and `en.json` created with test keys  
- [ ] Language switcher toggle or dropdown works from Settings  
- [ ] Translations reflect instantly across the app

- [ ] Phase 1: Set up unit testing environment with Jasmine + Karma  
**Acceptance Criteria**  
- [ ] Jasmine/Karma configured to run via `ng test`  
- [ ] At least one simple passing test added for `AppComponent`  
- [ ] Code coverage available in test report  
- [ ] Project uses clear structure for placing test files

## 📄 Phase 2: Content Integration & Rendering

- [ ] Phase 2: Design and implement Activity List screen  
**Acceptance Criteria**  
- [ ] Screen displays all activities from static JSON  
- [ ] Shows localized title and description  
- [ ] Activity cards use Angular Material  
- [ ] Each card links to Activity Detail screen

- [ ] Phase 2: Design and implement Activity Detail screen  
**Acceptance Criteria**  
- [ ] Shows localized title and description from JSON  
- [ ] Video displayed inline with `<video>` or embedded YouTube player  
- [ ] Layout follows UX spec with clear sectioning  
- [ ] Fallback message for missing video

- [ ] Phase 2: Integrate JSON content loading and version tracking  
**Acceptance Criteria**  
- [ ] Static JSON file loaded on app start from `/assets/`  
- [ ] JSON structure matches app schema  
- [ ] Version number displayed in Settings  
- [ ] JSON service covered by unit tests

## 🌐 Phase 3: Content Update & Storage

- [ ] Phase 3: Implement remote content fetch and version check on app start  
**Acceptance Criteria**  
- [ ] App checks remote JSON (e.g. from Firebase) for updates  
- [ ] Compares `version` field to local  
- [ ] If new version, replaces local JSON  
- [ ] Logs or alerts on update success/failure

- [ ] Phase 3: Store JSON in IndexedDB and implement offline fallback  
**Acceptance Criteria**  
- [ ] Uses IndexedDB (via `localForage` or Angular service)  
- [ ] On startup, falls back to cached JSON if offline  
- [ ] Unit tests verify fallback and read/write behavior  
- [ ] App behavior is unchanged when offline

## 🎥 Phase 4: Video Integration

- [ ] Phase 4: Stream video content from YouTube or Firebase Storage  
**Acceptance Criteria**  
- [ ] Activity Detail screen streams video from URL  
- [ ] Player is responsive and consistent across web/mobile  
- [ ] Handles fallback if video fails to load  
- [ ] Test with both Firebase and YouTube links

- [ ] Phase 4: Add support for video downloading and offline playback  
**Acceptance Criteria**  
- [ ] Video can be downloaded manually or automatically  
- [ ] Downloaded videos stored via Capacitor Filesystem or IndexedDB Blob  
- [ ] User notified when video is ready offline  
- [ ] Test offline playback works reliably

- [ ] Phase 4: Auto-remove old videos based on configurable storage threshold  
**Acceptance Criteria**  
- [ ] Track used storage space for cached videos  
- [ ] Remove least recently used videos once over threshold  
- [ ] Threshold configurable in code  
- [ ] "Never delete" mode available  
- [ ] Unit tests simulate threshold logic

## 🧪 Phase 5: Testing & Deployment

- [ ] Phase 5: Write unit tests for JSON service and version checking logic  
**Acceptance Criteria**  
- [ ] Test JSON load, parse, version comparison, fallback  
- [ ] Edge case coverage (bad version, missing file)  
- [ ] Code coverage > 80% for service  
- [ ] Tests run without flakiness on CI

- [ ] Phase 5: Write e2e tests for basic user flow (list → detail → settings)  
**Acceptance Criteria**  
- [ ] Uses Cypress or Playwright  
- [ ] Navigates through main views  
- [ ] Checks that language switch updates UI  
- [ ] Runs headless in CI

- [ ] Phase 5: Implement PWA service worker for offline HTML + assets  
**Acceptance Criteria**  
- [ ] `ng add @angular/pwa` configured correctly  
- [ ] App shell, translations, JSON cached offline  
- [ ] Tested offline after first load  
- [ ] App installable on Android and Chrome

## 🚀 Phase 6: Build & Publish

- [ ] Phase 6: Configure Firebase Hosting for web/PWA  
**Acceptance Criteria**  
- [ ] Firebase project set up with hosting enabled  
- [ ] Angular build deployed to Firebase via CLI  
- [ ] Web app loads successfully online and offline

- [ ] Phase 6: Build Android APK using Capacitor and test on real devices  
**Acceptance Criteria**  
- [ ] `npx cap build android` creates functional APK  
- [ ] App works on Android 8+ devices  
- [ ] Offline playback verified  
- [ ] Firebase storage access secure via rules

- [ ] Phase 6: Setup GitHub Actions for CI/CD  
**Acceptance Criteria**  
- [ ] Pipeline runs on push to main  
- [ ] Unit and e2e tests executed in pipeline  
- [ ] Web build deployed to Firebase automatically  
- [ ] Clear logs and notifications on failures

## 🌿 Optional MVP Enhancement

- [ ] Optional: Mark activity as completed (toggle or visual cue)  
**Acceptance Criteria**  
- [ ] UI toggle or button to mark activity as “done”  
- [ ] State stored in LocalStorage/IndexedDB  
- [ ] Visual cue (checkmark, strikethrough)  
- [ ] Clear/Reset option in Settings
