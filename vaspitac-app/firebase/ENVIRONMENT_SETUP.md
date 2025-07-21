# 🔥 Firebase Environment Setup Guide

This guide explains how to set up and use separate Firebase projects for development and production environments.

## 📋 Overview

The Firebase configuration supports two environments:
- **Development** (`ana-vaspitac`) - for testing and development
- **Production** (`ana-vaspitac-prod`) - for live users

## 🚀 Quick Start

### 1. Create Firebase Projects

#### Development Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a project**
3. **Project name**: `ana-vaspitac`
4. **Project ID**: `ana-vaspitac`
5. Enable Google Analytics (recommended)
6. Click **Create project**

#### Production Project
1. Click **Create a project** again
2. **Project name**: `ana-vaspitac-prod`
3. **Project ID**: `ana-vaspitac-prod`
4. Enable Google Analytics
5. Click **Create project**

### 2. Configure Projects

For each project, set up:
- **Authentication** (Email/Password)
- **Firestore Database** (create in test mode for dev, production mode for prod)
- **Storage** (create storage bucket)
- **Functions** (if needed)

### 3. Download Service Account Keys

#### Development Service Account
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save as `scripts/serviceAccountKey-dev.json`

#### Production Service Account
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save as `scripts/serviceAccountKey-prod.json`

## 🔧 Deployment Commands

### Development Deployment
```bash
# Deploy to development environment
deploy-dev.bat

# Or manually
firebase use development
firebase deploy --config firebase.dev.json
```

### Production Deployment
```bash
# Deploy to production environment (with confirmation)
deploy-prod.bat

# Or manually
firebase use production
firebase deploy --config firebase.prod.json
```

## 👥 User Management

### Create Users in Development
```bash
node scripts/create-user-dev.js email@example.com password123 admin
```

### Create Users in Production
```bash
node scripts/create-user-prod.js email@example.com password123 admin
```

### Available Roles
- `free` - Basic access
- `trial` - Trial subscription (7 days)
- `subscriber` - Paid subscription
- `admin` - Administrator access

## 🔒 Security Rules

### Development Rules (`firestore.dev.rules`)
- **Permissive** for testing
- Allows all read/write operations
- No authentication required

### Production Rules (`firestore.prod.rules`)
- **Secure** for live users
- User-specific data access
- Admin-only operations
- Proper authentication checks

## 📁 File Structure

```
firebase/
├── .firebaserc                    # Project aliases
├── firebase.json                  # Default config
├── firebase.dev.json             # Development config
├── firebase.prod.json            # Production config
├── firestore.rules               # Default rules
├── firestore.dev.rules           # Development rules
├── firestore.prod.rules          # Production rules
├── storage.rules                 # Storage rules
├── deploy-dev.bat                # Development deployment
├── deploy-prod.bat               # Production deployment
├── setup.bat                     # Original setup script
└── scripts/
    ├── create-user-dev.js        # Dev user creation
    ├── create-user-prod.js       # Prod user creation
    ├── serviceAccountKey-dev.json # Dev service account
    └── serviceAccountKey-prod.json # Prod service account
```

## 🔄 Environment Switching

### Using Firebase CLI
```bash
# Switch to development
firebase use development

# Switch to production
firebase use production

# List available projects
firebase projects:list
```

### Using Configuration Files
```bash
# Deploy with specific config
firebase deploy --config firebase.dev.json
firebase deploy --config firebase.prod.json
```

## 🚨 Important Notes

### Development Environment
- ✅ Safe for testing
- ✅ Permissive security rules
- ✅ Can be reset without consequences
- ✅ Use for feature development

### Production Environment
- ⚠️ Affects live users
- ⚠️ Secure security rules
- ⚠️ Requires careful testing
- ⚠️ Use for live deployment only

## 🔍 Troubleshooting

### Common Issues

1. **Project not found**
   ```bash
   firebase projects:list
   firebase use <project-id>
   ```

2. **Permission denied**
   - Check service account permissions
   - Verify project access

3. **Rules deployment failed**
   - Check syntax in rule files
   - Verify project configuration

### Getting Help
- Check Firebase Console for error details
- Review deployment logs
- Test rules in Firebase Console

## 📚 Next Steps

1. **Set up GitHub Environments** with project secrets
2. **Configure CI/CD** to use correct environment
3. **Test thoroughly** in development first
4. **Deploy to production** when ready

---

**Remember**: Always test in development before deploying to production! 