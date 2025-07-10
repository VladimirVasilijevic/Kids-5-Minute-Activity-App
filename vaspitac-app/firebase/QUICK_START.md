# 🚀 Quick Start Guide - Firebase User Roles Setup

## 📋 What You'll Get
- ✅ User role system (admin, subscriber, trial, free)
- ✅ Permission-based access control
- ✅ Subscription management
- ✅ Admin assignment scripts
- ✅ Security rules for Firestore and Storage
- ✅ Firebase Functions for automation

## 🔥 Step 1: Initial Setup

### 1.1 Navigate to Firebase Folder
```bash
cd firebase
```

### 1.2 Run Setup Script (Windows)
```bash
setup.bat
```

**OR Manual Setup:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init
```

**Choose these options:**
- ✅ Firestore
- ✅ Storage  
- ✅ Functions
- ✅ Hosting (optional)
- Project: Select your existing project
- Use existing project: Yes
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Functions: TypeScript, ESLint, install dependencies

## 🔑 Step 2: Get Service Account Key

### 2.1 Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate new private key"**
5. Save the JSON file as `scripts/serviceAccountKey.json`

### 2.2 Verify Service Account Key
```bash
node scripts/test-setup.js
```

## 👥 Step 3: Create Test Users

### 3.1 Create Admin User
```bash
node scripts/create-user.js admin@example.com password123 admin
```

### 3.2 Create Different User Types
```bash
# Create subscriber
node scripts/create-user.js subscriber@example.com password123 subscriber

# Create trial user
node scripts/create-user.js trial@example.com password123 trial

# Create free user
node scripts/create-user.js free@example.com password123 free
```

### 3.3 List All Users
```bash
node scripts/list-users.js
```

## ⚡ Step 4: Deploy Firebase Functions

### 4.1 Install Dependencies
```bash
cd functions
npm install
cd ..
```

### 4.2 Deploy Functions
```bash
firebase deploy --only functions
```

## 🔒 Step 5: Deploy Security Rules

### 5.1 Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5.2 Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 5.3 Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## 🧪 Step 6: Test Everything

### 6.1 Run Full Test Suite
```bash
node scripts/test-setup.js
```

### 6.2 Test User Management
```bash
# List users by role
node scripts/list-users.js admin
node scripts/list-users.js subscriber

# Assign admin to existing user
node scripts/assign-admin.js existing-user@example.com
```

## 📱 Step 7: Connect to Your App

### 7.1 Update Environment Files
Copy your Firebase config to your Angular app:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
  }
};
```

### 7.2 Test in Your App
1. Start your Angular app: `npm start`
2. Try logging in with different user types
3. Test permission guards
4. Verify premium content access

## 🎯 Available Scripts

### User Management
```bash
# Create user with role
node scripts/create-user.js <email> <password> <role>

# List all users
node scripts/list-users.js

# List users by role
node scripts/list-users.js <role>

# Assign admin role
node scripts/assign-admin.js <email>

# Remove admin role
node scripts/assign-admin.js <email> remove
```

### Testing
```bash
# Test Firebase setup
node scripts/test-setup.js
```

### Deployment
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
```

## 🔧 User Roles & Permissions

### Admin
- Full access to everything
- Can manage content and users
- Can assign admin roles to others
- All permissions enabled

### Subscriber
- Access to all activities (including premium)
- Access to premium blog and tips
- Can download PDF guides and videos
- Can manage own subscription

### Trial User
- Access to all activities (7-day trial)
- Access to blog and tips
- Can manage own subscription
- Limited to 7 days

### Free User
- Access to blog and tips only
- Can edit profile
- No premium content access
- No subscription

## 🚨 Troubleshooting

### Common Issues:

**"Service account key not found"**
- Make sure `scripts/serviceAccountKey.json` exists
- Check the file path is correct

**"Permission denied"**
- Verify your service account has the right permissions
- Check if you're logged in to Firebase CLI

**"User not found"**
- Make sure the user exists in Firebase Auth
- Check the email spelling

**"Functions deployment failed"**
- Check your Node.js version (should be 16+)
- Verify all dependencies are installed

## 📊 Monitoring

### Check Usage Limits
- Go to Firebase Console > Usage and billing
- Monitor free tier limits:
  - Authentication: 10,000 users/month
  - Firestore: 50K reads/day, 20K writes/day
  - Storage: 5GB storage, 1GB downloads/day
  - Functions: 125K invocations/month

### View Logs
```bash
# View function logs
firebase functions:log

# View deployment logs
firebase deploy --debug
```

## 🎉 You're Done!

Your Firebase setup is now complete with:
- ✅ User role system
- ✅ Permission-based access control
- ✅ Subscription management
- ✅ Admin tools
- ✅ Security rules
- ✅ Automated functions

**Next steps:**
1. Test all user roles in your app
2. Set up admin dashboard
3. Add payment integration when ready
4. Monitor usage to stay within free limits

---

**📚 For detailed instructions, see README.md** 