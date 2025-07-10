/**
 * Delete User Script
 * Deletes a user from Firebase Auth and Firestore
 * 
 * Usage: node scripts/delete-user.js <email_or_uid>
 * 
 * Example: node scripts/delete-user.js admin@example.com
 * Example: node scripts/delete-user.js abc123def456
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

/**
 * Find user by email or UID
 * @param {string} identifier - Email or UID
 * @returns {Promise<admin.auth.UserRecord>} User record
 */
async function findUser(identifier) {
  try {
    // Try to get user by UID first
    if (identifier.length === 28) { // Firebase UIDs are 28 characters
      return await admin.auth().getUser(identifier);
    }
    
    // Try to get user by email
    return await admin.auth().getUserByEmail(identifier);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error(`User not found: ${identifier}`);
    }
    throw error;
  }
}

/**
 * Delete user data from Firestore
 * @param {string} uid - User UID
 */
async function deleteUserData(uid) {
  try {
    console.log(`🗑️  Deleting user data from Firestore...`);
    
    // Delete user profile
    await db.collection('users').doc(uid).delete();
    console.log(`✅ Deleted user profile from Firestore`);
    
    // Delete user's activities (if any)
    const activitiesSnapshot = await db.collection('user_activities')
      .where('userId', '==', uid)
      .get();
    
    if (!activitiesSnapshot.empty) {
      const batch = db.batch();
      activitiesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${activitiesSnapshot.size} user activities`);
    }
    
    // Delete user's blog posts (if any)
    const blogPostsSnapshot = await db.collection('user_blog_posts')
      .where('authorId', '==', uid)
      .get();
    
    if (!blogPostsSnapshot.empty) {
      const batch = db.batch();
      blogPostsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${blogPostsSnapshot.size} user blog posts`);
    }
    
    // Delete user's comments (if any)
    const commentsSnapshot = await db.collection('comments')
      .where('userId', '==', uid)
      .get();
    
    if (!commentsSnapshot.empty) {
      const batch = db.batch();
      commentsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${commentsSnapshot.size} user comments`);
    }
    
    // Delete user's favorites (if any)
    const favoritesSnapshot = await db.collection('user_favorites')
      .where('userId', '==', uid)
      .get();
    
    if (!favoritesSnapshot.empty) {
      const batch = db.batch();
      favoritesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${favoritesSnapshot.size} user favorites`);
    }
    
    // Delete user's settings (if any)
    const settingsSnapshot = await db.collection('user_settings')
      .where('userId', '==', uid)
      .get();
    
    if (!settingsSnapshot.empty) {
      const batch = db.batch();
      settingsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`✅ Deleted ${settingsSnapshot.size} user settings`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting user data from Firestore:', error.message);
    throw error;
  }
}

/**
 * Delete user from Firebase Auth
 * @param {string} uid - User UID
 */
async function deleteUserFromAuth(uid) {
  try {
    console.log(`🗑️  Deleting user from Firebase Auth...`);
    await admin.auth().deleteUser(uid);
    console.log(`✅ Deleted user from Firebase Auth`);
  } catch (error) {
    console.error('❌ Error deleting user from Firebase Auth:', error.message);
    throw error;
  }
}

/**
 * Delete user completely
 * @param {string} identifier - Email or UID
 * @param {boolean} confirm - Whether to skip confirmation
 */
async function deleteUser(identifier, confirm = false) {
  try {
    // Find the user
    const userRecord = await findUser(identifier);
    
    console.log(`🔍 Found user:`);
    console.log(`   👤 Email: ${userRecord.email}`);
    console.log(`   🆔 UID: ${userRecord.uid}`);
    console.log(`   📅 Created: ${userRecord.metadata.creationTime}`);
    console.log(`   🔄 Last Sign In: ${userRecord.metadata.lastSignInTime || 'Never'}`);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log(`   🔑 Role: ${userData.role || 'Unknown'}`);
      if (userData.subscription) {
        console.log(`   💳 Subscription: ${userData.subscription.type} (${userData.subscription.status})`);
      }
    }
    
    // Confirmation prompt
    if (!confirm) {
      console.log('\n⚠️  WARNING: This action cannot be undone!');
      console.log('📋 This will delete:');
      console.log('   - User account from Firebase Auth');
      console.log('   - User profile from Firestore');
      console.log('   - All user-related data (activities, comments, favorites, etc.)');
      
      // In a real script, you might want to add a confirmation prompt here
      // For now, we'll require the --confirm flag
      console.log('\n💡 To proceed, add --confirm flag to the command');
      console.log('   Example: node scripts/delete-user.js admin@example.com --confirm');
      return;
    }
    
    console.log('\n🗑️  Starting user deletion...');
    
    // Delete user data from Firestore first
    await deleteUserData(userRecord.uid);
    
    // Delete user from Firebase Auth
    await deleteUserFromAuth(userRecord.uid);
    
    console.log('\n🎉 User deleted successfully!');
    console.log(`👤 Email: ${userRecord.email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    throw error;
  }
}

/**
 * List all users (helper function)
 */
async function listAllUsers() {
  try {
    console.log('📋 Listing all users...');
    const listUsersResult = await admin.auth().listUsers();
    
    if (listUsersResult.users.length === 0) {
      console.log('📭 No users found');
      return;
    }
    
    console.log(`\n📊 Found ${listUsersResult.users.length} users:\n`);
    
    for (const user of listUsersResult.users) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const role = userDoc.exists ? userDoc.data().role : 'Unknown';
      
      console.log(`👤 ${user.email} (${user.uid})`);
      console.log(`   🔑 Role: ${role}`);
      console.log(`   📅 Created: ${user.metadata.creationTime}`);
      console.log(`   🔄 Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const identifier = process.argv[2];
  const confirm = process.argv.includes('--confirm');
  const listUsers = process.argv.includes('--list');
  
  if (listUsers) {
    await listAllUsers();
    return;
  }
  
  if (!identifier) {
    console.log('📋 Usage: node scripts/delete-user.js <email_or_uid> [--confirm]');
    console.log('📋 Examples:');
    console.log('   node scripts/delete-user.js admin@example.com');
    console.log('   node scripts/delete-user.js abc123def456 --confirm');
    console.log('   node scripts/delete-user.js --list (to list all users)');
    console.log('\n📋 Options:');
    console.log('   --confirm: Skip confirmation prompt');
    console.log('   --list: List all users instead of deleting');
    process.exit(1);
  }
  
  try {
    await deleteUser(identifier, confirm);
  } catch (error) {
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { deleteUser, findUser, deleteUserData, deleteUserFromAuth }; 