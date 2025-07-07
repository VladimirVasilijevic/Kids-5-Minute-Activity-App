# Ana Vaspitac - Kids 5-Minute Activity App

A cross-platform mobile and web application that delivers simple 5-minute educational and physical activities for kids. The app displays text instructions and associated videos for each activity, with primary language support for Serbian and English.

## 🎯 Project Overview

Ana Vaspitac is designed to help parents, future parents, and educators engage children up to 7 years old in simple, fun, and educational activities. Each activity encourages both physical and mental development through easy-to-follow instructions and video demonstrations.

### Key Features

- **5-Minute Activities**: Quick, accessible ideas that fit into busy schedules
- **Multi-language Support**: Serbian (primary) and English
- **Dynamic Content**: Activities, blog posts, tips, and categories are loaded from Firestore (Firebase) for real-time updates
- **Offline Access & Fallback**: If Firestore is unavailable (offline or permission error), the app automatically falls back to static JSON files
- **No Special Equipment**: Activities require no special materials
- **Privacy-First**: No personal data collected
- **Cross-Platform**: Web (PWA) and Android support
- **Mobile-First Design**: Optimized for Android portrait mode with responsive layouts
- **Smooth Navigation**: Automatic scroll-to-top on all navigation actions
- **CI/CD Ready**: Automated builds and tests for web and Android via GitHub Actions

## Firestore Integration & Content Fallback
- The app uses Firestore collections for all dynamic content: `activities_{lang}`, `categories_{lang}`, `blog_{lang}`, `tips_{lang}` (e.g., `blog_sr`, `categories_en`)
- If Firestore is unreachable or access is denied, the app logs a fallback message and loads the corresponding static JSON from `/assets/`
- **Firestore Security Rules:** During development, set rules to `allow read, write: if true;` for testing. For production, restrict as needed.
- **Collection Naming:** Ensure your Firestore collections are named exactly as expected (e.g., `blog_sr`, not just `blog`)
- **Import Script:** Use `scripts/import-to-firestore.js` to migrate local JSON to Firestore collections. See `scripts/README.md` for usage.

## UX Redesign & Mobile Optimization
- The app was fully redesigned with mobile-first approach
- Now uses Tailwind CSS, Unsplash images for activities, and a new color palette
- Navigation, layout, and all main pages were rebuilt for consistency and accessibility
- Angular Material was removed in favor of Tailwind CSS
- All navigation/back buttons are visually and functionally consistent
- i18n, accessibility, and responsiveness improved throughout
- **Mobile Optimizations:**
  - Responsive grid layouts that adapt to screen size
  - Touch-friendly buttons and navigation elements
  - Optimized typography and spacing for mobile screens
  - **PayPal section text overflow fixed for mobile**
  - **Smooth scroll-to-top functionality on all navigation**
  - Category filtering with query parameters support
  - **All navigation and category selection now scroll to top automatically**

## Updating Activity Images
- Activity images are now set via Unsplash URLs in `src/assets/activities.json`.
- To update, edit the `imageUrl` field for each activity.

---

## 🏗️ Project Structure (Technical)

```
vaspitac/
├── docs/                  # Project documentation
│   ├── specification.md   # Software requirements/spec
│   ├── TODO.md            # Development tasks & acceptance criteria
│   └── UX/                # UX design assets
├── vaspitac-app/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── home/              # Home screen (list of categories)
│   │   │   │   ├── activity-list/     # Activity list screen
│   │   │   │   ├── activity-detail/   # Activity detail (text + video)
│   │   │   │   ├── blog/              # Blog articles
│   │   │   │   ├── tips/              # Parenting tips
│   │   │   │   ├── shop/              # Educational materials shop
│   │   │   │   ├── about/             # About the author
│   │   │   │   └── settings/          # Settings (language, version)
│   │   │   ├── models/                # Shared TypeScript interfaces/types
│   │   │   ├── services/              # Angular services (e.g., ActivityService, FirestoreService)
│   │   │   ├── test-utils/            # Shared test mocks/utilities (mock-activities, mock-blog-posts, etc.)
│   │   │   ├── assets/
│   │   │   │   ├── activities.json        # Static content (activities)
│   │   │   │   └── i18n/                  # Translation files (sr.json, en.json)
│   │   │   └── styles.scss                # Global styles
│   │   ├── angular.json, ...              # Angular/Capacitor config
├── .cursor/
│   └── rules/                         # Project coding/documentation rules
│       ├── angular-best-practices.mdc # Angular/TS best practices
│       └── ...                        # Other rules (naming, style, etc.)
├── .github/                           # GitHub workflows/scripts
│   └── scripts/
│       └── todo_parser.py             # GitHub issues automation
└── README.md                          # Project overview (this file)
```

---

## 📦 Key Directories & Files

- **components/**: All UI screens, each in its own folder (with `.ts`, `.html`, `.scss`, `.spec.ts`)
- **models/**: All shared TypeScript interfaces/types (e.g., `Activity`, `ActivitiesData`)
- **services/**: Angular services (e.g., `ActivityService`, `FirestoreService` for loading activities, blog, tips, categories)
- **test-utils/**: Shared mocks for tests (e.g., `mock-activities.ts`, `mock-blog-posts.ts`, `mock-categories.ts`, `mock-tips.ts`)
- **assets/i18n/**: Translation files for ngx-translate
- **assets/activities.json**: Static content, versioned and localized
- **.cursor/rules/**: Project coding standards and best practices (see below)
- **scripts/import-to-firestore.js**: Script to import local JSON to Firestore collections

---

## 🛣️ Roadmap & Future Enhancements

- **Dynamic Blog Pages**: Blog list links to individual article pages with full content and SEO-friendly URLs
- **User Profile**: Editable user profile page (display name, avatar, local storage)
- **Admin Authentication**: Google/email login for admin users, role-based access to content editing
- **Admin Content Editor**: Admin-only UI for adding/editing activities, blog posts, and tips (syncs to Firestore)
- **Backend Logic**: Cloud Functions or backend for moderation, analytics, notifications, and secure admin endpoints
- **E2E Tests**: Cypress/Playwright tests for admin/content flows, run in CI
- **Error Monitoring**: Sentry or similar integration for error tracking and alerts
- **Code Documentation & Style**: JSDoc comments, ESLint/TSLint, Prettier, and documented code style for all contributors

## 🧑‍💻 Development & Best Practices

- **Modern Angular**: Standalone components, RxJS, Tailwind CSS
- **TypeScript**: All types/interfaces in `models/`, never import a service just for a type
- **Testing**: Jasmine + Karma, >80% coverage, all mocks in `test-utils/` for all domains
- **Best Practices**: See `.cursor/rules/angular-best-practices.mdc` for enforced standards (structure, naming, code style, testing, etc.)
- **Internationalization**: ngx-translate, language switcher in header
- **PWA**: Service worker, offline support, installable
- **Mobile-First**: Responsive design optimized for Android portrait mode
- **Planned**: Admin authentication, content editor, user profile, backend logic, E2E tests, error monitoring, and code style enforcement (see Roadmap)

## 📝 Code Style & Linting

### ESLint Configuration
- **TypeScript Rules**: Enforced with `@typescript-eslint/recommended`
- **Import Order**: Automatic grouping and sorting with `eslint-plugin-import`
- **JSDoc Requirements**: All public functions and classes must have JSDoc comments with `@returns` declarations
- **No `any` Types**: Explicit typing required, use proper interfaces instead

### Prettier Configuration
- **Formatting**: Single quotes, 2-space indentation, semicolons required
- **Line Length**: 100 characters max
- **Trailing Commas**: ES5 compatible

### Available Commands
```bash
# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format all files (TypeScript, HTML, SCSS, JSON)
npm run format

# Check formatting without changes
npm run format:check
```

### JSDoc Requirements
All public functions and classes must include:
- Description of what the function/class does
- `@param` tags for all parameters with descriptions
- `@returns` tag with return type and description
- `@example` for complex functions (optional)

Example:
```typescript
/**
 * Retrieves activities from Firestore with JSON fallback
 * @param category - Optional category filter
 * @returns Observable of activities array
 */
getActivities(category?: string): Observable<Activity[]> {
  // implementation
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Angular CLI
- Android Studio (for mobile builds)
- **For CI/CD:** GitHub repository with Actions enabled, allowlisted actions (see below)

### Installation & Running
```bash
# Clone and install
$ git clone <repository-url>
$ cd vaspitac/vaspitac-app
$ npm install

# Set up environment (see Environment Setup below)
$ cp src/environments/environment.template.ts src/environments/environment.ts
# Edit src/environments/environment.ts with your Firebase credentials

# Set up Firebase for Android (see Firebase Setup below)
$ cp android/app/google-services.template.json android/app/google-services.json
# Edit android/app/google-services.json with your Firebase project credentials

# Run web app
$ npm start
# Open http://localhost:4200

# Run tests
$ npm test

## 🔥 Firebase Setup

### Web Configuration (Development)
1. Copy the environment template:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```
2. Edit `src/environments/environment.ts` with your Firebase project credentials:
   - Replace `YOUR_FIREBASE_API_KEY` with your actual API key
   - Update other Firebase config values as needed

### Web Configuration (Production)
1. Copy the production environment template:
   ```bash
   cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
   ```
2. Edit `src/environments/environment.prod.ts` with your production Firebase credentials

### Android Configuration
1. Copy the Firebase configuration template:
   ```bash
   cp android/app/google-services.template.json android/app/google-services.json
   ```
2. Download your `google-services.json` from the Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on your Android app or create a new one
   - Download the `google-services.json` file
3. Replace the template file with your downloaded `google-services.json`

### Firebase Project Setup
1. **Create Firebase Project**: If you haven't already, create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Firestore**: Go to Firestore Database and create a database
3. **Set Security Rules**: For development, use `allow read, write: if true;` (restrict for production)
4. **Import Data**: Use the import script to populate Firestore:
   ```bash
   cd scripts
   npm install
   node import-to-firestore.js
   ```

### GitHub Actions Setup (CI/CD)
For automated builds and deployments, add these secrets to your GitHub repository:

1. **Go to your repository Settings > Secrets and variables > Actions**
2. **Add the following secrets:**

#### For Web/Production Builds:
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain (e.g., `ana-vaspitac.firebaseapp.com`)
- `FIREBASE_PROJECT_ID`: Your Firebase project ID (e.g., `ana-vaspitac`)
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket (e.g., `ana-vaspitac.firebasestorage.app`)
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID (e.g., `536360476476`)
- `FIREBASE_APP_ID`: Your Firebase app ID (e.g., `1:536360476476:web:fdbed45ad8a9c91f5e8839`)
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID (e.g., `G-0EG5E3Q69H`)

#### For Android Builds:
- `GOOGLE_SERVICES_JSON`: The entire content of your `google-services.json` file

#### For Android Release Builds (Optional):
- `KEYSTORE_PASSWORD`: Password for the release keystore
- `KEY_PASSWORD`: Password for the release key

### Security Notice
- **Never commit `google-services.json`, `environment.ts`, or `environment.prod.ts` to version control**
- These files contain sensitive API keys and are automatically ignored by `.gitignore`
- **Use GitHub Secrets for CI/CD builds** - the workflows will create these files from secrets
- If you accidentally commit these files, immediately:
  1. Rotate the API keys in Firebase Console
  2. Remove the files from git tracking: `git rm --cached android/app/google-services.json src/environments/environment.ts src/environments/environment.prod.ts`
  3. Commit the removal
# Run with coverage
$ npm run test:coverage
```

### Environment Setup

The app requires Firebase configuration for full functionality. Follow these steps to set up your local environment:

1. **Get Firebase Credentials**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" > Web app
   - Copy the configuration object

2. **Create Your Environment File**
   - Copy the template file: `cp src/environments/environment.template.ts src/environments/environment.ts`
   - Open `src/environments/environment.ts`
   - Replace the placeholder values with your Firebase credentials:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "your-actual-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef123456",
       measurementId: "G-XXXXXXXXXX"
     }
   }
   ```

3. **Firestore Setup (Optional)**
   - If you want to use Firestore for dynamic content:
     - Enable Firestore in your Firebase project
     - Set up collections: `activities_sr`, `activities_en`, `categories_sr`, `categories_en`, `blog_sr`, `blog_en`, `tips_sr`, `tips_en`
     - Use the import script: `npm run import-to-firestore`

**Note:** The `environment.ts` file is gitignored for security. Use `environment.template.ts` as a starting point. Never commit real Firebase credentials to the repository.

### Mobile (Android)
```bash
$ npx cap add android
$ npm run build
$ npx cap sync
$ npx cap open android
```

#### Building Android APK (Local)
```bash
# After syncing, open Android Studio and build APK as usual
# Or use CLI:
$ npx cap build android
```
---

## 🧪 Testing & Utilities
- **Unit tests**: All components/services have `.spec.ts` files
- **Test utilities**: Shared mocks in `test-utils/` (import in all specs, e.g., `mock-activities`, `mock-blog-posts`, `mock-categories`, `mock-tips`)
- **Coverage**: Run `npm run test:coverage` (see `/coverage`)
- **E2E**: (Planned) Cypress/Playwright for user flows
- **Mobile Testing**: Responsive design tested across different screen sizes
- **Planned**: E2E tests for admin/content flows, error monitoring integration, and code style checks (see Roadmap)

---

## 🛠️ Project Rules & Best Practices
- **Rules location**: `.cursor/rules/`
- **Angular/TS best practices**: `.cursor/rules/angular-best-practices.mdc`
- **Other rules**: Naming, code style, SCSS, error handling, architecture
- **How to use**: All contributors should read and follow these rules. Refactor legacy code to comply when possible.

---

## 📱 Build & Deployment
- **Web**: `npm run build` (output in `dist/`)
- **Android**: `npx cap build android`
- **PWA**: Service worker, offline, installable
- **CI/CD**: GitHub Actions (see `.github/`)

---

## 🔧 Firestore & Firebase Setup
- **Firestore collections must be named**: `activities_{lang}`, `categories_{lang}`, `blog_{lang}`, `tips_{lang}` (e.g., `blog_sr`)
- **Security rules**: For development, use `allow read, write: if true;` in `firestore.rules`. For production, restrict as needed.
- **Import script**: Use `scripts/import-to-firestore.js` to migrate JSON to Firestore.
- **Troubleshooting**: If you see fallback logs, check rules, config, and collection names.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/maintain tests
5. Ensure all tests pass
6. Follow project rules in `.cursor/rules/`
7. Submit a pull request

---

## 📄 License
This project is proprietary. All rights reserved.

---

**Built with ❤️ for children's development and education** 