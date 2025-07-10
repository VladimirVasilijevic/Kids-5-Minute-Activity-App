/**
 * Assign Admin Role Script
 * Assigns admin role to an existing user
 * 
 * Usage: node scripts/assign-admin.js <email>
 * 
 * Example: node scripts/assign-admin.js admin@example.com
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

// Admin permissions
const ADMIN_PERMISSIONS = [
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
];

/**
 * Assign admin role to a user by email
 * @param {string} email - User's email address
 */
async function assignAdminRole(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || userRecord.email} (${userRecord.uid})`);
    
    // Check if user profile exists in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log('⚠️  User profile not found in Firestore, creating one...');
      
      // Create user profile with admin role
      const userProfile = {
        uid: userRecord.uid,
        displayName: userRecord.displayName || userRecord.email,
        email: userRecord.email,
        avatarUrl: userRecord.photoURL || '',
        createdAt: new Date().toISOString(),
        role: 'admin',
        permissions: ADMIN_PERMISSIONS,
        subscription: {
          type: 'admin',
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: true
        },
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('users').doc(userRecord.uid).set(userProfile);
      console.log('✅ Created user profile with admin role');
    } else {
      // Update existing user profile
      const userData = userDoc.data();
      console.log(`📝 Current role: ${userData.role || 'none'}`);
      
      await db.collection('users').doc(userRecord.uid).update({
        role: 'admin',
        permissions: ADMIN_PERMISSIONS,
        subscription: {
          type: 'admin',
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: true
        },
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Updated user profile with admin role');
    }
    
    // Set custom claims for admin
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    console.log('✅ Set custom claims for admin access');
    
    console.log('\n🎉 Admin role assigned successfully!');
    console.log(`👤 User: ${userRecord.displayName || userRecord.email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log('🔑 The user now has full admin access to the application');
    console.log(`📋 Permissions: ${ADMIN_PERMISSIONS.length} admin permissions`);
    
  } catch (error) {
    console.error('❌ Error assigning admin role:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Make sure the user has signed up in the app first');
      console.log('💡 Or create the user first with: node scripts/create-user.js <email> <password> admin');
    }
    
    process.exit(1);
  }
}

/**
 * Remove admin role from a user
 * @param {string} email - User's email address
 */
async function removeAdminRole(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.displayName || userRecord.email} (${userRecord.uid})`);
    
    // Check if user profile exists in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log('❌ User profile not found in Firestore');
      return;
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      console.log('⚠️  User is not an admin');
      return;
    }
    
    // Update user profile to free user
    await db.collection('users').doc(userRecord.uid).update({
      role: 'free',
      permissions: [
        'access_blog_posts',
        'access_tips',
        'edit_profile',
        'view_profile'
      ],
      subscription: null,
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Updated user profile to free user');
    
    // Remove custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: false,
      role: 'free'
    });
    console.log('✅ Removed admin custom claims');
    
    console.log('\n🎉 Admin role removed successfully!');
    console.log(`👤 User: ${userRecord.displayName || userRecord.email}`);
    console.log('🔑 The user now has free user access');
    
  } catch (error) {
    console.error('❌ Error removing admin role:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const email = process.argv[2];
  const action = process.argv[3]; // 'remove' to remove admin role
  
  if (!email) {
    console.log('📋 Usage: node scripts/assign-admin.js <email> [remove]');
    console.log('📋 Example: node scripts/assign-admin.js admin@example.com');
    console.log('📋 Example: node scripts/assign-admin.js admin@example.com remove');
    process.exit(1);
  }
  
  if (action === 'remove') {
    await removeAdminRole(email);
  } else {
    await assignAdminRole(email);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { assignAdminRole, removeAdminRole }; 