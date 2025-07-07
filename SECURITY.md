# Security Guide - API Key Management

## ⚠️ Important Security Notice

**Firebase API keys in frontend applications are inherently public** and will be visible in the browser's source code. This is normal and expected behavior for frontend apps.

## How to Secure Your API Keys

### 1. Configure API Key Restrictions in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your Firebase API key
3. Click on the key to edit restrictions
4. Configure the following restrictions:

#### For Web Applications:
- **HTTP referrers (web sites)**: Add your domain(s)
  - `https://yourusername.github.io/Kids-5-Minute-Activity-App/*`
  - `https://yourdomain.com/*` (if you have a custom domain)

#### For Android Applications:
- **App package names**: Add `com.vaspitac.app`

#### For iOS Applications:
- **App bundle IDs**: Add your iOS bundle identifier

### 2. Firebase Security Rules

Configure Firestore security rules to restrict access:

```javascript
// Example restrictive rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users (since this is public content)
    match /{document=**} {
      allow read: if true;
      allow write: if false; // No write access from client
    }
  }
}
```

### 3. Environment File Management

- **Never commit** `environment.ts`, `environment.prod.ts`, or `google-services.json`
- These files are automatically ignored by `.gitignore`
- GitHub Actions creates these files from secrets during build

### 4. Rotating Compromised Keys

If your API key has been compromised:

1. **Immediately revoke the key** in Google Cloud Console
2. **Create a new API key** with proper restrictions
3. **Update GitHub Secrets** with the new key
4. **Rebuild and redeploy** your application

### 5. Monitoring and Alerts

- Set up Google Cloud monitoring for API key usage
- Configure alerts for unusual usage patterns
- Regularly review API key access logs

## Best Practices

1. **Use different API keys** for development and production
2. **Regularly rotate keys** (every 6-12 months)
3. **Monitor usage** for suspicious activity
4. **Keep dependencies updated** to prevent vulnerabilities
5. **Use HTTPS** for all API calls
6. **Implement rate limiting** where possible

## Current Setup

This project uses:
- GitHub Secrets for secure key storage
- Automated builds via GitHub Actions
- Proper `.gitignore` configuration
- Template files for local development

## Support

If you need help with security configuration, refer to:
- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [Google Cloud API Key Management](https://cloud.google.com/docs/apis/api-keys)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets) 