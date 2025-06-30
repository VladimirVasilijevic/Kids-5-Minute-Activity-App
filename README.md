# Vaspitac App - Kids 5-Minute Activity App

A cross-platform mobile and web application that delivers simple 5-minute educational and physical activities for kids. The app displays text instructions and associated videos for each activity, with primary language support for Serbian and English.

## 🎯 Project Overview

Vaspitac App is designed to help parents, future parents, and educators engage children up to 7 years old in simple, fun, and educational activities. Each activity encourages both physical and mental development through easy-to-follow instructions and video demonstrations.

### Key Features

- **5-Minute Activities**: Quick, accessible ideas that fit into busy schedules
- **Multi-language Support**: Serbian (primary) and English
- **Offline Access**: Download content for offline use
- **No Special Equipment**: Activities require no special materials
- **Privacy-First**: No personal data collected
- **Cross-Platform**: Web (PWA) and Android support

## UX Redesign
- The app was fully redesigned.
- Now uses Tailwind CSS, Unsplash images for activities, and a new color palette.
- Navigation, layout, and all main pages were rebuilt for consistency and accessibility.
- Angular Material was removed in favor of Tailwind.
- All navigation/back buttons are visually and functionally consistent.
- i18n, accessibility, and responsiveness improved throughout.

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
│   │   │   │   └── settings/          # Settings (language, version)
│   │   │   ├── models/                # Shared TypeScript interfaces/types
│   │   │   ├── services/              # Angular services (e.g., ActivityService)
│   │   ├── assets/
│   │   │   ├── activities.json        # Static content (activities)
│   │   │   └── i18n/                  # Translation files (sr.json, en.json)
│   │   ├── test-utils/                # Shared test mocks/utilities
│   │   └── styles.scss                # Global styles
│   ├── angular.json, ...              # Angular/Capacitor config
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
- **services/**: Angular services (e.g., `ActivityService` for loading activities)
- **test-utils/**: Shared mocks for tests (e.g., `mock-activities.ts`)
- **assets/i18n/**: Translation files for ngx-translate
- **assets/activities.json**: Static content, versioned and localized
- **.cursor/rules/**: Project coding standards and best practices (see below)

---

## 🧑‍💻 Development & Best Practices

- **Modern Angular**: Standalone components, RxJS, Angular Material
- **TypeScript**: All types/interfaces in `models/`, never import a service just for a type
- **Testing**: Jasmine + Karma, >80% coverage, all mocks in `test-utils/`
- **Best Practices**: See `.cursor/rules/angular-best-practices.mdc` for enforced standards (structure, naming, code style, testing, etc.)
- **Internationalization**: ngx-translate, language switcher in Settings
- **PWA**: Service worker, offline support, installable

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Angular CLI
- Android Studio (for mobile builds)

### Installation & Running
```bash
# Clone and install
$ git clone <repository-url>
$ cd vaspitac/vaspitac-app
$ npm install

# Run web app
$ npm start
# Open http://localhost:4200

# Run tests
$ npm test
# Run with coverage
$ npm run test:coverage
```

### Mobile (Android)
```bash
$ npx cap add android
$ npm run build
$ npx cap sync
$ npx cap open android
```

---

## 🧪 Testing & Utilities
- **Unit tests**: All components/services have `.spec.ts` files
- **Test utilities**: Shared mocks in `test-utils/` (import in all specs)
- **Coverage**: Run `npm run test:coverage` (see `/coverage`)
- **E2E**: (Planned) Cypress/Playwright for user flows

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