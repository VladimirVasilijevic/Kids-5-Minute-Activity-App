export const environment = {
  production: false,
  firebase: {
    // ⚠️ SECURITY: This API key will be visible in the browser
    // Configure restrictions in Google Cloud Console:
    // - HTTP referrers (web sites)
    // - App package names (Android)
    // - IP addresses
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
  }
} 