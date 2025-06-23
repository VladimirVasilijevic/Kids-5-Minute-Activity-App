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

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Angular CLI
- Android Studio (for mobile builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vaspitac
   ```

2. **Install dependencies**
   ```bash
   cd vaspitac-app
   npm install
   ```

3. **Run the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Mobile Development

1. **Add Android platform**
   ```bash
   npx cap add android
   ```

2. **Build and sync**
   ```bash
   npm run build
   npx cap sync
   ```

3. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

## 🏗️ Project Structure

```
vaspitac/
├── docs/                          # Project documentation
│   ├── specification.md           # Software requirements
│   ├── TODO.md                    # Development tasks
│   └── UX/                        # UX design assets
├── vaspitac-app/                  # Angular application
│   ├── src/
│   │   ├── app/                   # Application components
│   │   │   ├── home/              # Home screen
│   │   │   ├── activity-list/     # Activity list screen
│   │   │   ├── activity-detail/   # Activity detail screen
│   │   │   └── settings/          # Settings screen
│   │   ├── assets/
│   │   │   └── i18n/              # Translation files
│   │   └── styles.scss            # Global styles
│   ├── angular.json               # Angular configuration
│   ├── capacitor.config.ts        # Capacitor configuration
│   └── package.json               # Dependencies
└── .github/                       # GitHub workflows and scripts
    └── scripts/
        └── todo_parser.py         # GitHub issues automation
```

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run E2E Tests (when implemented)
```bash
npm run e2e
```

## 🌐 Internationalization

The app supports multiple languages through ngx-translate:

- **Serbian (sr)**: Primary language
- **English (en)**: Secondary language

Translation files are located in `src/assets/i18n/`:
- `sr.json` - Serbian translations
- `en.json` - English translations

## 🎨 Design System

### Colors
- **Primary Green**: #4CAF50
- **Dark Green**: #2E7D32
- **Medium Green**: #66BB6A
- **Light Green**: #A5D6A7
- **Watermelon Pink**: #FF6B9D (CTA buttons)
- **Light Pink**: #FFB3D1

### Typography
- **Primary Font**: Roboto
- **Material Icons**: For UI elements

## 📱 Build & Deployment

### Web Build
```bash
npm run build
```

### Android Build
```bash
npm run build
npx cap build android
```

### PWA Features
- Offline support
- Installable on mobile devices
- Service worker for caching

## 🔧 Development Workflow

### Phase-based Development
The project follows a structured phase-based approach:

1. **Phase 1**: ✅ Project initialization & structure
2. **Phase 2**: Content integration & rendering
3. **Phase 3**: Content update & storage
4. **Phase 4**: Video integration
5. **Phase 5**: Testing & deployment
6. **Phase 6**: Build & publish

### GitHub Issues Automation
The project includes automated GitHub issue management:
- Issues are created from TODO.md tasks
- Issues are automatically closed when all acceptance criteria are met
- Phase labels are automatically applied

## 📋 Content Management

### JSON Schema
Activities are stored in JSON format:
```json
{
  "version": "1.0.2",
  "languages": ["sr", "en"],
  "activities": [
    {
      "id": "001",
      "title": { "sr": "Joga za decu", "en": "Yoga for Kids" },
      "description": { "sr": "Jednostavna petominutna joga", "en": "Simple 5 minute yoga session" },
      "videoUrl": {
        "sr": "https://storage.googleapis.com/myapp/yoga_sr.mp4",
        "en": "https://storage.googleapis.com/myapp/yoga_en.mp4"
      }
    }
  ]
}
```

## 🔒 Privacy & Security

- **No Personal Data**: The app collects no personal information
- **COPPA Compliant**: Designed for children's privacy
- **GDPR Ready**: European privacy regulation compliant
- **Offline First**: Works without internet connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For questions or support, please contact the development team.

---

**Built with ❤️ for children's development and education** 