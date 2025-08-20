# Firebase Deployment Guide

## **Project Configuration**
- **Development**: `ana-vaspitac-dev`
- **Production**: `ana-vaspitac-prod-e7ee4`

## **🚀 Automated Deployment (GitHub Actions)**

### **Development Deployment**
- **Trigger**: Push to `develop` branch
- **Workflow**: `.github/workflows/firebase-deploy-dev.yml`
- **Result**: Auto-deploy to `https://ana-vaspitac-dev.web.app`

### **Production Deployment**
- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/firebase-deploy-prod.yml`
- **Result**: Auto-deploy to `https://ana-vaspitac-prod-e7ee4.web.app`

### **Workflow Structure**
Both workflows now follow a professional CI/CD pattern:

1. **Security Scan** - Runs security checks first
2. **Build & Test** - Builds app and runs tests
3. **Firebase Deployment** - Deploys to Firebase Hosting
4. **Verification** - Confirms successful deployment

### **Reusable Actions**
- **`setup-firebase-hosting`** - Firebase CLI setup and authentication
- **`deploy-firebase-hosting`** - Firebase hosting deployment
- **`setup-node`** - Node.js and dependency setup
- **`security-scan`** - Security vulnerability scanning

## **🔑 Setup Required**

### **1. Generate Firebase CI Tokens**
```bash
# For Development
firebase use ana-vaspitac-dev
firebase login:ci --no-localhost

# For Production  
firebase use ana-vaspitac-prod-e7ee4
firebase login:ci --no-localhost
```

### **2. Add GitHub Secrets**
Go to: **Settings** → **Secrets and variables** → **Actions**

**Required Secrets:**
- `FIREBASE_DEV_TOKEN` - Development project CI token
- `FIREBASE_PROD_TOKEN` - Production project CI token

## **📋 Manual Deployment Commands**

### **Switch Projects**
```bash
# Switch to development
npm run firebase:dev

# Switch to production
npm run firebase:prod

# Check current project
npm run firebase:status
```

### **Manual Deploy**
```bash
# Deploy to Development
npm run deploy:dev

# Deploy to Production
npm run deploy:prod
```

## **Manual Deployment Steps**

### **1. Switch Project**
```bash
firebase use dev    # or firebase use prod
```

### **2. Build App**
```bash
npm run build:dev   # or npm run build:prod
```

### **3. Deploy**
```bash
firebase deploy
```

## **Environment URLs**

| Environment | Firebase Project | Hosting URL |
|-------------|------------------|-------------|
| **Development** | `ana-vaspitac-dev` | `https://ana-vaspitac-dev.web.app` |
| **Production** | `ana-vaspitac-prod-e7ee4` | `https://ana-vaspitac-prod-e7ee4.web.app` |

## **Troubleshooting**

### **Check Current Project**
```bash
firebase use
```

### **List All Projects**
```bash
firebase projects:list
```

### **Force Project Switch**
```bash
firebase use --add
```

### **Clear Firebase Cache**
```bash
firebase logout
firebase login
```
