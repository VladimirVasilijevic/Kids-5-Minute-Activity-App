# 🔄 Data Migration Guide

This guide will help you migrate all data from your current Firebase project to the new production project.

## 📋 Prerequisites

1. **Service Account Keys**:
   - `serviceAccountKey.json` (current project)
   - `serviceAccountKey-prod.json` (production project)

2. **Firebase Projects Created**:
   - Current: `ana-vaspitac`
   - Production: `ana-vaspitac-prod`

## 🚀 Migration Steps

### Step 1: Prepare Service Account Keys

1. **Download current project service account**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `scripts/serviceAccountKey.json`

2. **Download production project service account**:
   - Go to Firebase Console → Production project → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `scripts/serviceAccountKey-prod.json`

### Step 2: Run Migration Script

```bash
cd vaspitac-app/firebase/scripts
node migrate-to-prod.js
```

### Step 3: Verify Migration

1. **Check Firestore Data**:
   - Go to Firebase Console → Production project
   - Navigate to Firestore Database
   - Verify all collections are present with data

2. **Check Authentication**:
   - Go to Firebase Console → Production project
   - Navigate to Authentication → Users
   - Verify all users are present

3. **Check Custom Claims**:
   - Verify admin users have proper custom claims
   - Check user roles are correctly set

## 📊 What Gets Migrated

### Firestore Collections:
- ✅ `users` - User profiles and data
- ✅ `activities` - All activities
- ✅ `categories` - Activity categories
- ✅ `blog-posts` - Blog posts
- ✅ `subscriptions` - User subscriptions
- ✅ `admin` - Admin data
- ✅ `analytics` - Analytics data

### Authentication:
- ✅ User accounts
- ✅ Email verification status
- ✅ Display names and photos
- ✅ Custom claims (roles, admin status)
- ✅ Account status (enabled/disabled)

## ⚠️ Important Notes

1. **Backup First**: The migration script will overwrite existing data in production
2. **Test Environment**: Consider testing the migration on development first
3. **User Passwords**: Users will need to reset their passwords in production
4. **Custom Claims**: Admin roles and user permissions will be preserved

## 🔧 Troubleshooting

### Common Issues:

1. **Permission Denied**:
   - Check service account permissions
   - Verify project access

2. **User Already Exists**:
   - The script will skip existing users
   - Check for duplicate emails

3. **Large Data Sets**:
   - The script processes data in batches
   - Large collections may take time

### Error Recovery:

If migration fails:
1. Check the error message
2. Verify service account keys
3. Check Firebase project permissions
4. Re-run the migration script

## 🎯 Post-Migration Steps

1. **Update GitHub Secrets**:
   - Replace production environment secrets with new project values
   - Update `FIREBASE_TOKEN` for CI/CD

2. **Test Production Environment**:
   - Deploy to production
   - Test user authentication
   - Verify data access

3. **Update Users**:
   - Inform users about password reset
   - Test admin functionality

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error details
2. Review migration logs
3. Verify project configurations
4. Test with smaller data sets first

---

**Remember**: Always backup your data before migration! 