# Firebase Storage Setup Guide

## Issue
You're encountering CORS and authentication errors when trying to upload images to Firebase Storage. This is because Firebase Storage needs proper configuration for security rules and CORS.

## Solution

### 1. Deploy Storage Rules
The storage rules have been updated to include `blog-images/` and `activity-images/` paths. Deploy them:

```bash
cd firebase
firebase deploy --only storage
```

### 2. Set CORS Configuration
Configure CORS to allow uploads from your development server:

```bash
# Install gsutil if you haven't already
# It comes with Google Cloud SDK

# Set CORS configuration
gsutil cors set storage.cors.json gs://ana-vaspitac.appspot.com
```

### 3. Alternative: Use the Batch Script
Run the provided batch script:

```bash
cd firebase
deploy-storage.bat
```

### 4. Verify Authentication
Ensure you're logged in as an admin user:
- The storage rules require admin role
- Check that your user document in Firestore has `role: 'admin'`

### 5. Test the Upload
After deploying the rules and CORS configuration:
1. Restart your development server
2. Try uploading an image again
3. Check the browser console for any remaining errors

## Troubleshooting

### If you still get CORS errors:
1. Clear browser cache
2. Check that the CORS configuration was applied correctly
3. Verify the storage bucket name in the CORS command

### If you get authentication errors:
1. Ensure you're logged in
2. Check that your user has admin role in Firestore
3. Verify the user document structure

### If you get permission errors:
1. Check the storage rules syntax
2. Ensure the rules are deployed to the correct project
3. Verify the file path matches the rules

## Manual CORS Configuration
If the gsutil command doesn't work, you can set CORS manually in the Firebase Console:

1. Go to Firebase Console > Storage
2. Click on "Rules" tab
3. The rules should already be updated
4. For CORS, you may need to use the Firebase CLI or gsutil

## Temporary Workaround
If you need to test the functionality immediately, you can temporarily use URL input instead of file upload until the Firebase configuration is properly set up. 