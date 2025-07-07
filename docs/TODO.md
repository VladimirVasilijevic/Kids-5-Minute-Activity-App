# ✅ TODO List – Kids 5-Minute Activity App (MVP)

## 🧱 Phase 1: Project Initialization & Structure

TODO: Initialize Angular project with Capacitor and setup Angular Material <!-- id: task-001 -->
**Acceptance Criteria**  
- [x] Angular project created via `ng new` with routing  
- [x] Capacitor installed and linked with `npx cap init`  
- [x] Angular Material added and a basic theme applied (`ng add @angular/material`)  
- [x] App runs on `localhost` and Android simulator

TODO: Create app shell with routing and basic layout <!-- id: task-002 -->
**Acceptance Criteria**  
- [x] Routes set up for Home, Activity List, Activity Detail, and Settings  
- [x] Basic layout with Angular Material toolbar and bottom nav  
- [x] Dummy content shown for each screen  
- [x] Navigation works between views without reloads

TODO: Implement global language support with ngx-translate <!-- id: task-003 -->
**Acceptance Criteria**  
- [x] `ngx-translate` and `@ngx-translate/http-loader` installed  
- [x] `assets/i18n/sr.json` and `en.json` created with test keys  
- [x] Language switcher toggle or dropdown works from Settings  
- [x] Translations reflect instantly across the app

TODO: Set up unit testing environment with Jasmine + Karma <!-- id: task-004 -->
**Acceptance Criteria**  
- [x] Jasmine/Karma configured to run via `ng test`  
- [x] At least one simple passing test added for `AppComponent`  
- [x] Code coverage available in test report  
- [x] Project uses clear structure for placing test files

## 📄 Phase 2: Content Integration & Rendering

TODO: Redesign UX <!-- id: task-005 -->
**Acceptance Criteria**  
- [x] Angular Material removed, Tailwind CSS and new color palette applied  
- [x] Navigation, layout, and all main pages (Home, Activities, Activity Detail, Shop, Blog, Tips, About) rebuilt for consistency and accessibility  
- [x] All activity images use Unsplash 
- [x] All navigation/back buttons are visually and functionally consistent  
- [x] i18n, accessibility, and responsiveness improved throughout 

TODO: Design and implement Activity List screen <!-- id: task-006 -->
**Acceptance Criteria**  
- [x] Screen displays all activities from static JSON  
- [x] Shows localized title and description  
- [x] Activity cards use Angular Material  
- [x] Each card links to Activity Detail screen

TODO: Design and implement Activity Detail screen <!-- id: task-007 -->
**Acceptance Criteria**  
- [x] Shows localized title and description from JSON  
- [x] Video displayed inline with `<video>` or embedded YouTube player  
- [x] Layout follows UX spec with clear sectioning  
- [x] Fallback message for missing video

TODO: Integrate JSON content loading and version tracking <!-- id: task-008 -->
**Acceptance Criteria**  
- [x] Static JSON file loaded on app start from `/assets/`  
- [x] JSON structure matches app schema  
- [x] Version number displayed in Settings  
- [x] JSON service covered by unit tests

## 📱 Phase 2.5: Mobile Optimization & Bug Fixes

TODO: Implement mobile-first responsive design <!-- id: task-009 -->
**Acceptance Criteria**  
- [x] All pages optimized for mobile screens (portrait orientation)
- [x] Responsive grid layouts that adapt to different screen sizes
- [x] Touch-friendly buttons and navigation elements
- [x] Optimized typography and spacing for mobile screens
- [x] PayPal section text overflow fixed for mobile displays
- [x] Smooth scroll-to-top functionality on all navigation actions
- [x] Category filtering with query parameters support
- [x] All unit tests updated to match new responsive design

TODO: Fix navigation and user experience issues <!-- id: task-010 -->
**Acceptance Criteria**  
- [x] Home page category navigation scrolls to top after selection
- [x] All back buttons scroll to top when returning to previous pages
- [x] Activity list properly handles category query parameters
- [x] Shop page PayPal section text properly contained on mobile
- [x] All navigation actions provide consistent user experience
- [x] Language switcher remains visible and accessible on all screen sizes
- [x] All navigation and category selection now scroll to top automatically

## 🌐 Phase 3: Content Update & Storage

TODO: Implement Firestore content fetch and fallback <!-- id: task-011 -->
**Acceptance Criteria**  
- [x] App loads content from Firestore collections (with JSON fallback)
- [x] FirestoreService handles all content domains (activities, blog, tips, categories)
- [x] Fallback to JSON is logged and tested
- [x] Firestore import script migrates JSON to Firestore collections

TODO: Implement remote JSON version check <!-- id: task-012 -->
**Acceptance Criteria**  
- [ ] App checks remote JSON (e.g. from Firebase) for updates  
- [ ] Compares `version` field to local  
- [ ] If new version, replaces local JSON  
- [ ] Logs or alerts on update success/failure

TODO: Store JSON in IndexedDB and implement offline fallback <!-- id: task-013 -->
**Acceptance Criteria**  
- [ ] Uses IndexedDB (via `localForage` or Angular service)  
- [ ] On startup, falls back to cached JSON if offline  
- [ ] Unit tests verify fallback and read/write behavior  
- [ ] App behavior is unchanged when offline

TODO: Set up GitHub Action for automated unit testing on all branches <!-- id: task-014 -->
**Acceptance Criteria**  
- [x] Workflow YAML file exists in `.github/workflows/` (e.g., `unit-tests.yml`)  
- [x] Workflow triggers on push and pull request events for all branches  
- [x] Node.js environment is set up (recommended LTS version)  
- [x] All dependencies are installed using `npm ci`  
- [x] Angular app builds successfully (`npm run build`)  
- [x] All unit tests are executed (`npm test` or `ng test --watch=false`)  
- [x] Workflow fails if any test fails  
- [x] Contributors can see test results in the GitHub Actions tab  
- [x] Code coverage results are uploaded or visible in PR summary  
- [x] Status badge for the workflow is visible in the README  

## 🎥 Phase 4: Video Integration

TODO: Stream video content from YouTube or Firebase Storage <!-- id: task-015 -->
**Acceptance Criteria**  
- [ ] Activity Detail screen streams video from URL  
- [ ] Player is responsive and consistent across web/mobile  
- [ ] Handles fallback if video fails to load  
- [ ] Test with both Firebase and YouTube links

TODO: Add support for video downloading and offline playback <!-- id: task-016 -->
**Acceptance Criteria**  
- [ ] Video can be downloaded manually or automatically  
- [ ] Downloaded videos stored via Capacitor Filesystem or IndexedDB Blob  
- [ ] User notified when video is ready offline  
- [ ] Test offline playback works reliably

TODO: Auto-remove old videos based on configurable storage threshold <!-- id: task-017 -->
**Acceptance Criteria**  
- [ ] Track used storage space for cached videos  
- [ ] Remove least recently used videos once over threshold  
- [ ] Threshold configurable in code  
- [ ] "Never delete" mode available  
- [ ] Unit tests simulate threshold logic

## 🧪 Phase 5: Testing & Deployment

TODO: Write unit tests for JSON service and version checking logic <!-- id: task-018 -->
**Acceptance Criteria**  
- [x] All services/components use shared test mocks from `test-utils/`
- [x] FirestoreService and all content services have fallback logic covered by tests
- [x] Code coverage > 80% for all services
- [x] Tests run without flakiness on CI
- [x] All test data is realistic and matches production structure

TODO: Write e2e tests for basic user flow (list → detail → settings) <!-- id: task-019 -->
**Acceptance Criteria**  
- [ ] Uses Cypress or Playwright  
- [ ] Navigates through main views  
- [ ] Checks that language switch updates UI  
- [ ] Runs headless in CI

TODO: Implement PWA service worker for offline HTML + assets <!-- id: task-020 -->
**Acceptance Criteria**  
- [ ] `ng add @angular/pwa` configured correctly  
- [ ] App shell, translations, JSON cached offline  
- [ ] Tested offline after first load  
- [ ] App installable on Android and Chrome

## 🚀 Phase 6: Build & Publish

TODO: Configure Firebase Hosting for web/PWA <!-- id: task-021 -->
**Acceptance Criteria**  
- [ ] Firebase project set up with hosting enabled  
- [ ] Angular build deployed to Firebase via CLI  
- [ ] Web app loads successfully online and offline

TODO: Build Android APK using Capacitor and test on real devices <!-- id: task-022 -->
**Acceptance Criteria**  
- [x] `npx cap build android` creates functional APK  
- [x] App works on Android 8+ devices  
- [x] Offline playback verified  
- [x] Firebase storage access secure via rules
- [x] All android/ files (including gradlew) are committed and gradlew is executable in CI
- [x] CI/CD pipeline uses only allowlisted GitHub Actions
- [x] gradlew permission errors are handled with chmod +x step in workflow

TODO: Setup GitHub Actions for CI/CD <!-- id: task-023 -->
**Acceptance Criteria**  
- [x] Pipeline runs on push to main  
- [x] Unit and e2e tests executed in pipeline  
- [ ] Web build deployed to Firebase automatically  
- [x] Clear logs and notifications on failures
- [x] Web build and Android APK are built and uploaded as artifacts in CI
- [x] Deployment to GitHub Pages uses allowlisted actions only
- [x] gh-pages branch appears after first successful deploy
- [x] .gitignore only ignores build/local files, not android/ directory

## 🔒 Phase 7: Secure Firestore Rules

TODO: Harden Firestore security rules for production <!-- id: task-024 -->
**Acceptance Criteria**  
- [ ] Firestore rules restrict write access in production
- [ ] Only allow reads for public content collections
- [ ] Document security policy in README
- [ ] All contributors understand and follow security best practices

## 🌿 Optional MVP Enhancement

TODO: Mark activity as completed (toggle or visual cue) <!-- id: task-025 -->
**Acceptance Criteria**  
- [ ] UI toggle or button to mark activity as "done"  
- [ ] State stored in LocalStorage/IndexedDB  
- [ ] Visual cue (checkmark, strikethrough)  
- [ ] Clear/Reset option in Settings

## 🌱 Phase 8: Roadmap Enhancements

TODO: Add dynamic blog article pages <!-- id: task-026 -->
**Acceptance Criteria**  
- [ ] Blog list links to individual blog article pages  
- [ ] Blog article page displays full content, images, and author info  
- [ ] SEO-friendly URLs (e.g., /blog/:id or /blog/:slug)  
- [ ] Language switching works on blog detail  
- [ ] Unit tests for navigation and rendering

TODO: Implement user profile page <!-- id: task-027 -->
**Acceptance Criteria**  
- [ ] User profile page with editable display name and avatar  
- [ ] Profile data stored locally (no backend for now)  
- [ ] Option to reset profile  
- [ ] Unit tests for profile logic

TODO: Add admin authentication and role-based access <!-- id: task-028 -->
**Acceptance Criteria**  
- [ ] Google and email/password login for admin users  
- [ ] Admin role restricts access to content editing features  
- [ ] Non-admin users cannot access edit screens  
- [ ] Unit tests for auth and role logic

TODO: Implement admin-only content editor for activities/blog/tips <!-- id: task-029 -->
**Acceptance Criteria**  
- [ ] Admins can add/edit/delete activities, blog posts, and tips  
- [ ] Changes sync to Firestore  
- [ ] Editor UI is mobile-friendly  
- [ ] Unit tests for editor logic

TODO: Add backend logic for advanced features <!-- id: task-030 -->
**Acceptance Criteria**  
- [ ] Cloud Functions or backend for moderation, analytics, or notifications  
- [ ] Secure endpoints for admin actions  
- [ ] Document backend endpoints and usage

TODO: Add E2E tests for admin/content flows <!-- id: task-031 -->
**Acceptance Criteria**  
- [ ] E2E tests for admin login, content editing, and publishing  
- [ ] Tests run in CI  
- [ ] Coverage > 80% for E2E flows

TODO: Integrate error monitoring and reporting <!-- id: task-032 -->
**Acceptance Criteria**  
- [ ] Integrate Sentry or similar for error tracking  
- [ ] Errors are logged with user context (if available)  
- [ ] Alerts for critical failures

TODO: Improve code documentation and enforce TypeScript code style <!-- id: task-033 -->
**Acceptance Criteria**  
- [x] Add JSDoc comments to all public functions/classes  
- [x] Enforce code style with ESLint/TSLint and Prettier  
- [x] Linting errors do not block CI, but warnings are visible in PRs  
- [x] All contributors follow documented code style
- [x] Cursor rules created for code style, linting, and command line practices
- [x] ESLint configured with TypeScript, JSDoc, and import rules
- [x] Prettier configured with semicolons and consistent formatting
- [x] All source files linted and formatted according to standards
- [x] Test files use proper TypeScript types and shared mocks
