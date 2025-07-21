# 🔧 GitHub Environment Setup Guide

This guide explains how to configure GitHub Environments with the new Firebase project secrets.

## 📋 Overview

You need to set up two GitHub Environments:
- **Development** - for `ana-vaspitac` project
- **Production** - for `ana-vaspitac-prod` project

## 🚀 Step-by-Step Setup

### Step 1: Create GitHub Environments

1. Go to your GitHub repository
2. Click **Settings** → **Environments**
3. Click **New environment**

#### Create Development Environment
- **Name**: `development`
- **Description**: Development environment for testing

#### Create Production Environment
- **Name**: `production`
- **Description**: Production environment for live users
- **Protection rules**:
  - ✅ **Required reviewers**: Add yourself
  - ✅ **Wait timer**: 5 minutes
  - ✅ **Deployment branches**: `main` only

### Step 2: Add Development Environment Secrets

Click on the `development` environment and add these secrets:

```
FIREBASE_API_KEY = your-dev-api-key
FIREBASE_AUTH_DOMAIN = ana-vaspitac-dev.firebaseapp.com
FIREBASE_PROJECT_ID = ana-vaspitac-dev
FIREBASE_STORAGE_BUCKET = ana-vaspitac-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID = your-dev-sender-id
FIREBASE_APP_ID = your-dev-app-id
FIREBASE_MEASUREMENT_ID = your-dev-measurement-id
GOOGLE_SERVICES_JSON = your-dev-google-services-json-content
FIREBASE_TOKEN = your-firebase-cli-token
```

### Step 3: Add Production Environment Secrets

Click on the `production` environment and add these secrets:

```
FIREBASE_API_KEY = your-prod-api-key
FIREBASE_AUTH_DOMAIN = ana-vaspitac-prod.firebaseapp.com
FIREBASE_PROJECT_ID = ana-vaspitac-prod
FIREBASE_STORAGE_BUCKET = ana-vaspitac-prod.appspot.com
FIREBASE_MESSAGING_SENDER_ID = your-prod-sender-id
FIREBASE_APP_ID = your-prod-app-id
FIREBASE_MEASUREMENT_ID = your-prod-measurement-id
GOOGLE_SERVICES_JSON = your-prod-google-services-json-content
FIREBASE_TOKEN = your-firebase-cli-token
KEYSTORE_PASSWORD = your-keystore-password
KEY_PASSWORD = your-key-password
```

## 🔑 Getting Firebase Configuration Values

### For Development Project (`ana-vaspitac`):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `ana-vaspitac` project
3. Click **Project Settings** → **General**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one)
6. Copy the configuration values

### For Production Project (`ana-vaspitac-prod`):

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `ana-vaspitac-prod` project
3. Click **Project Settings** → **General**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one)
6. Copy the configuration values

## 🔐 Getting Firebase CLI Token

1. Install Firebase CLI locally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Generate CI token:
   ```bash
   firebase login:ci
   ```

4. Copy the token and add it as `FIREBASE_TOKEN` in both environments

## 📱 Getting Google Services JSON

### For Development:
1. Go to Firebase Console → `ana-vaspitac`
2. **Project Settings** → **Your apps**
3. Click **Add app** → **Android**
4. **Package name**: `com.vaspitac.app.dev`
5. Download `google-services.json`
6. Copy the entire content and add as `GOOGLE_SERVICES_JSON`

### For Production:
1. Go to Firebase Console → `ana-vaspitac-prod`
2. **Project Settings** → **Your apps**
3. Click **Add app** → **Android**
4. **Package name**: `com.vaspitac.app`
5. Download `google-services.json`
6. Copy the entire content and add as `GOOGLE_SERVICES_JSON`

## 🧪 Testing the Setup

### Test Development Environment:
1. Push to `develop` branch
2. Check GitHub Actions workflow
3. Verify it uses development environment secrets
4. Check Firebase Console for deployment

### Test Production Environment:
1. Push to `main` branch
2. Check GitHub Actions workflow
3. Verify it uses production environment secrets
4. Check Firebase Console for deployment

## 🔍 Troubleshooting

### Common Issues:

1. **Environment not found**:
   - Check environment names match exactly
   - Verify environment exists in repository settings

2. **Secrets not available**:
   - Check secret names match exactly
   - Verify secrets are added to correct environment

3. **Firebase deployment fails**:
   - Check `FIREBASE_TOKEN` is valid
   - Verify project access permissions

4. **Build fails**:
   - Check Firebase configuration values
   - Verify all required secrets are present

## 📊 Environment Summary

| Environment | Branch | Firebase Project | Purpose |
|-------------|--------|------------------|---------|
| `development` | `develop` | `ana-vaspitac` | Testing, development |
| `production` | `main` | `ana-vaspitac-prod` | Live users, production |

## 🎯 Next Steps

1. **Set up environments** following this guide
2. **Test with development** branch first
3. **Run data migration** to production
4. **Deploy to production** when ready
5. **Monitor deployments** and verify functionality

---

**Remember**: Always test in development before deploying to production! 