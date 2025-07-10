# Firebase Setup Guide - Step by Step

## 🎯 Overview
This guide sets up Firebase for user roles and permissions with scripts to create users with different roles.

## 📁 Folder Structure
```
firebase/
├── README.md                 # This guide
├── firestore.rules          # Security rules
├── firestore.indexes.json   # Database indexes
├── storage.rules            # Storage security rules
├── functions/               # Firebase Functions
│   ├── src/
│   │   └── index.ts        # Functions code
│   └── package.json
└── scripts/                 # User management scripts
    ├── create-user.js       # Create user with role
    ├── list-users.js        # List all users
    ├── assign-admin.js      # Assign admin role
    └── serviceAccountKey.json # Your Firebase service account key
```

## 🔥 Step 1: Prepare Firebase Project

### 1.1 Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 1.2 Initialize Firebase in this folder
```bash
cd firebase
firebase init
```

**Choose these options:**
- ✅ Firestore
- ✅ Storage  
- ✅ Functions
- ✅ Hosting (optional)
- Project: Select your existing project
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Functions: TypeScript, ESLint, install dependencies

## 📊 Step 2: Deploy Security Rules

### 2.1 Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2.2 Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 2.3 Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## ⚡ Step 3: Set Up Firebase Functions

### 3.1 Install Dependencies
```bash
cd functions
npm install
```

### 3.2 Deploy Functions
```bash
firebase deploy --only functions
```

## 🔑 Step 4: Get Service Account Key

### 4.1 Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate new private key"**
5. Save the JSON file as `scripts/serviceAccountKey.json`

## 👥 Step 5: User Management Scripts

### 5.1 Create User with Role
```bash
node scripts/create-user.js <email> <password> <role>
```

**Examples:**
```bash
# Create admin user
node scripts/create-user.js admin@example.com password123 admin

# Create subscriber user
node scripts/create-user.js subscriber@example.com password123 subscriber

# Create trial user
node scripts/create-user.js trial@example.com password123 trial

# Create free user
node scripts/create-user.js free@example.com password123 free
```

### 5.2 List All Users
```bash
node scripts/list-users.js
```

### 5.3 Assign Admin Role to Existing User
```bash
node scripts/assign-admin.js <email>
```

## 🧪 Step 6: Test Your Setup

### 6.1 Test User Creation
```bash
# Create test users
node scripts/create-user.js test-admin@example.com password123 admin
node scripts/create-user.js test-sub@example.com password123 subscriber
node scripts/create-user.js test-trial@example.com password123 trial
node scripts/create-user.js test-free@example.com password123 free
```

### 6.2 List Users to Verify
```bash
node scripts/list-users.js
```

## 🔒 Step 7: Security Configuration

### 7.1 Configure API Key Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your Firebase API key
3. Add restrictions:
   - **HTTP referrers**: Your domain(s)
   - **App package names**: `com.vaspitac.app`

### 7.2 Test Security Rules
- Try accessing premium content with different user types
- Verify admin users can manage content
- Check that free users can't access premium features

## 📱 Step 8: Connect to Your App

### 8.1 Update Environment Files
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

### 8.2 Test in Your App
1. Start your Angular app: `npm start`
2. Try logging in with different user types
3. Test permission guards
4. Verify premium content access

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

## 🎯 Next Steps

1. **Test all user roles** in your app
2. **Set up admin dashboard** for content management
3. **Add payment integration** when ready
4. **Monitor usage** to stay within free limits
5. **Scale up** to Blaze plan when needed

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase Console logs
3. Verify your service account permissions
4. Test with the provided scripts

---

**🎉 You now have a complete Firebase setup with user role management!** 