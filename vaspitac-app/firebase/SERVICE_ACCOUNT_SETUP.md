# Firebase Service Account Setup

## 🔐 Service Account Keys

This project uses Firebase service account keys for server-side operations like user management, data import, and admin scripts.

## 📁 Required Files

You need to create the following service account key files in the `firebase/` directory:

- `serviceAccountKey-dev.json` - For development environment
- `serviceAccountKey-prod.json` - For production environment

## 🚀 Setup Instructions

### 1. Create Service Account Keys

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (dev or prod)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `serviceAccountKey-dev.json` or `serviceAccountKey-prod.json`
7. Place it in the `firebase/` directory

### 2. File Structure

```
firebase/
├── serviceAccountKey-dev.json     # Development service account
├── serviceAccountKey-prod.json    # Production service account
├── serviceAccountKey-template.json # Template (safe to commit)
└── ...
```

### 3. Security

⚠️ **IMPORTANT**: Service account keys contain sensitive credentials and are **NOT** committed to Git.

- ✅ `serviceAccountKey-template.json` - Safe to commit (template only)
- ❌ `serviceAccountKey-dev.json` - Never commit (contains real credentials)
- ❌ `serviceAccountKey-prod.json` - Never commit (contains real credentials)

## 🔧 Usage

The service account keys are used by:

- **Admin Scripts**: User management, data import, backups
- **Cloud Functions**: Server-side operations
- **Deployment Scripts**: Firebase CLI operations

## 📋 Verification

To verify your setup:

```bash
# Test development scripts
cd firebase/scripts/dev
node create-user.js test@example.com password123 admin

# Test production scripts  
cd firebase/scripts/prod
node list-users.js
```

## 🛡️ Security Best Practices

1. **Never commit service account keys** to version control
2. **Use different keys** for dev and prod environments
3. **Rotate keys regularly** for production environments
4. **Limit permissions** - only grant necessary roles
5. **Monitor usage** - check Firebase Console for unusual activity

## 🔄 Key Rotation

If you need to rotate service account keys:

1. Generate new keys in Firebase Console
2. Replace the old key files
3. Update any environment variables if used
4. Test all scripts to ensure they work with new keys

## 📞 Support

If you encounter issues with service account keys:

1. Check that the files exist in the correct location
2. Verify the JSON format is valid
3. Ensure the service account has the necessary permissions
4. Check Firebase Console for any error messages 