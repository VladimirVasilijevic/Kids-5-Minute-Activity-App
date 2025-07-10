/**
 * Create User with Role Script
 * Creates a new user in Firebase Auth and Firestore with specified role
 * 
 * Usage: node scripts/create-user.js <email> <password> <role>
 * Roles: admin, subscriber, trial, free
 * 
 * Example: node scripts/create-user.js admin@example.com password123 admin
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if service account key exists
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found!');
  console.log('📋 To get your service account key:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save as scripts/serviceAccountKey.json');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// User roles and their default permissions
const ROLE_PERMISSIONS = {
  admin: [
    'access_all_activities',
    'access_premium_activities',
    'access_blog_posts',
    'access_premium_blog',
    'access_tips',
    'access_premium_tips',
    'download_pdf_guides',
    'download_video_materials',
    'manage_content',
    'manage_users',
    'view_analytics',
    'manage_subscriptions',
    'edit_profile',
    'view_profile',
    'manage_own_subscription'
  ],
  subscriber: [
    'access_all_activities',
    'access_premium_activities',
    'access_blog_posts',
    'access_premium_blog',
    'access_tips',
    'access_premium_tips',
    'download_pdf_guides',
    'download_video_materials',
    'edit_profile',
    'view_profile',
    'manage_own_subscription'
  ],
  trial: [
    'access_all_activities',
    'access_blog_posts',
    'access_tips',
    'edit_profile',
    'view_profile',
    'manage_own_subscription'
  ],
  free: [
    'access_blog_posts',
    'access_tips',
    'edit_profile',
    'view_profile'
  ]
};

// Subscription types
const SUBSCRIPTION_TYPES = {
  admin: { type: 'admin', status: 'active', autoRenew: true },
  subscriber: { type: 'monthly', status: 'active', autoRenew: true },
  trial: { type: 'trial', status: 'trial', autoRenew: false },
  free: null
};

/**
 * Create user with specified role
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} role - User's role (admin, subscriber, trial, free)
 */
async function createUser(email, password, role) {
  try {
    // Validate role
    if (!ROLE_PERMISSIONS[role]) {
      throw new Error(`Invalid role: ${role}. Valid roles: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`);
    }

    console.log(`🔍 Creating user: ${email} with role: ${role}`);

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: email.split('@')[0], // Use email prefix as display name
      emailVerified: false
    });

    console.log(`✅ Created user in Firebase Auth: ${userRecord.uid}`);

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      displayName: userRecord.displayName || email.split('@')[0],
      email: userRecord.email,
      avatarUrl: userRecord.photoURL || '',
      createdAt: new Date().toISOString(),
      role: role,
      permissions: ROLE_PERMISSIONS[role],
      updatedAt: new Date().toISOString()
    };

    // Add subscription if applicable
    if (SUBSCRIPTION_TYPES[role]) {
      const subscription = SUBSCRIPTION_TYPES[role];
      const now = new Date();
      
      userProfile.subscription = {
        ...subscription,
        startDate: now.toISOString(),
        endDate: role === 'trial' 
          ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days trial
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        lastPaymentDate: now.toISOString(),
        nextPaymentDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log(`✅ Created user profile in Firestore`);

    // Set custom claims for admin
    if (role === 'admin') {
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: 'admin'
      });
      console.log(`✅ Set custom claims for admin access`);
    }

    console.log('\n🎉 User created successfully!');
    console.log(`👤 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`🔑 Role: ${role}`);
    console.log(`📋 Permissions: ${ROLE_PERMISSIONS[role].length} permissions`);
    
    if (userProfile.subscription) {
      console.log(`💳 Subscription: ${userProfile.subscription.type} (${userProfile.subscription.status})`);
    }

    return userRecord;

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('💡 User already exists. Use assign-admin.js to change role.');
    }
    
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4];

  if (!email || !password || !role) {
    console.log('📋 Usage: node scripts/create-user.js <email> <password> <role>');
    console.log('📋 Example: node scripts/create-user.js admin@example.com password123 admin');
    console.log('\n📋 Valid roles:');
    Object.keys(ROLE_PERMISSIONS).forEach(role => {
      console.log(`   - ${role}: ${ROLE_PERMISSIONS[role].length} permissions`);
    });
    process.exit(1);
  }

  try {
    await createUser(email, password, role);
  } catch (error) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createUser, ROLE_PERMISSIONS, SUBSCRIPTION_TYPES }; 