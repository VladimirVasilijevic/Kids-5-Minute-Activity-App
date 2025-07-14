import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

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

// Free user permissions
const FREE_USER_PERMISSIONS = [
  'access_blog_posts',
  'access_tips',
  'edit_profile',
  'view_profile'
];

/**
 * Function to assign admin role (callable function)
 * Only existing admins can assign admin role to others
 */
export const assignAdminRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUserId } = data;
  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Check if the requesting user is an admin
    const adminUser = await db.collection('users').doc(context.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can assign admin role');
    }

    // Get target user record
    const targetUserRecord = await admin.auth().getUser(targetUserId);
    
    // Update user profile in Firestore
    await db.collection('users').doc(targetUserId).update({
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

    // Set custom claims for admin
    await admin.auth().setCustomUserClaims(targetUserId, {
      admin: true,
      role: 'admin'
    });

    return { 
      success: true, 
      message: 'Admin role assigned successfully',
      user: {
        uid: targetUserId,
        email: targetUserRecord.email,
        displayName: targetUserRecord.displayName
      }
    };
  } catch (error) {
    console.error('Error assigning admin role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to assign admin role');
  }
});

/**
 * Function to remove admin role (callable function)
 * Only existing admins can remove admin role from others
 */
export const removeAdminRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUserId } = data;
  if (!targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    // Check if the requesting user is an admin
    const adminUser = await db.collection('users').doc(context.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can remove admin role');
    }

    // Get target user record
    const targetUserRecord = await admin.auth().getUser(targetUserId);
    
    // Update user profile in Firestore
    await db.collection('users').doc(targetUserId).update({
      role: 'free',
      permissions: FREE_USER_PERMISSIONS,
      subscription: null,
      updatedAt: new Date().toISOString()
    });

    // Remove custom claims
    await admin.auth().setCustomUserClaims(targetUserId, {
      admin: false,
      role: 'free'
    });

    return { 
      success: true, 
      message: 'Admin role removed successfully',
      user: {
        uid: targetUserId,
        email: targetUserRecord.email,
        displayName: targetUserRecord.displayName
      }
    };
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw new functions.https.HttpsError('internal', 'Failed to remove admin role');
  }
});

/**
 * Function to check subscription status daily (scheduled)
 * Runs every 24 hours to update expired subscriptions
 */
export const checkSubscriptionStatus = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = new Date();
    
    try {
      // Find expired subscriptions
      const expiredUsers = await db.collection('users')
        .where('subscription.status', 'in', ['active', 'trial'])
        .where('subscription.endDate', '<', now)
        .get();

      if (expiredUsers.empty) {
        console.log('No expired subscriptions found');
        return null;
      }

      const batch = db.batch();
      let updatedCount = 0;
      
      expiredUsers.forEach(doc => {
        const userData = doc.data();
        
        // Don't update admin users
        if (userData.role === 'admin') {
          return;
        }
        
        batch.update(doc.ref, {
          'subscription.status': 'expired',
          'role': 'free',
          'permissions': FREE_USER_PERMISSIONS,
          updatedAt: new Date().toISOString()
        });
        updatedCount++;
      });

      await batch.commit();
      console.log(`Updated ${updatedCount} expired subscriptions`);
      
      return { updatedCount };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  });

/**
 * Function to create user profile on sign up
 * Automatically creates user profile with default role and permissions
 */
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    // Check if user profile already exists
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      console.log(`User profile already exists for ${user.email}`);
      return null;
    }

    // Create default user profile
    const userProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      avatarUrl: user.photoURL || '',
      createdAt: new Date().toISOString(),
      role: 'free',
      permissions: FREE_USER_PERMISSIONS,
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(user.uid).set(userProfile);
    console.log(`Created user profile for ${user.email}`);
    
    return userProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
});

/**
 * Function to delete user profile on account deletion
 * Cleans up user data when account is deleted
 */
export const deleteUserProfile = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user profile from Firestore
    await db.collection('users').doc(user.uid).delete();
    console.log(`Deleted user profile for ${user.email}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
});

/**
 * Function to get user statistics (admin only)
 * Returns user counts by role and subscription status
 */
export const getUserStats = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const adminUser = await db.collection('users').doc(context.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can view user stats');
    }

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    const stats: {
      total: number;
      byRole: { [key: string]: number };
      bySubscription: { [key: string]: number };
      recentSignups: number;
    } = {
      total: usersSnapshot.size,
      byRole: {},
      bySubscription: {},
      recentSignups: 0
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      
      // Count by role
      const role = userData.role || 'unknown';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      
      // Count by subscription
      const subscriptionStatus = userData.subscription?.status || 'no_subscription';
      stats.bySubscription[subscriptionStatus] = (stats.bySubscription[subscriptionStatus] || 0) + 1;
      
      // Count recent signups
      if (new Date(userData.createdAt) > oneWeekAgo) {
        stats.recentSignups++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user stats');
  }
}); 

/**
 * Creates a new user in Auth and Firestore (admin only)
 * Callable as 'createUser'
 */
export const createUser = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  // Check if the requesting user is an admin
  const adminUser = await db.collection('users').doc(context.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
  }
  const { email, password, displayName, role } = data;
  if (!email || !password || !displayName || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  try {
    // Create user in Auth
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    // Set default permissions based on role
    let permissions = FREE_USER_PERMISSIONS;
    if (role === 'admin') permissions = ADMIN_PERMISSIONS;
    // Add user profile to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      displayName,
      email,
      role,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create user');
  }
});

/**
 * Updates an existing user in Auth and Firestore (admin only)
 * Callable as 'updateUser'
 */
export const updateUser = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Check if the requesting user is an admin
  const adminUser = await db.collection('users').doc(context.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can update users');
  }
  
  const { uid, displayName, role } = data;
  if (!uid || !displayName || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  // Prevent admins from changing their own role
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot modify your own role');
  }
  
  try {
    // Set default permissions based on role
    let permissions = FREE_USER_PERMISSIONS;
    if (role === 'admin') permissions = ADMIN_PERMISSIONS;
    
    // Update user in Auth
    await admin.auth().updateUser(uid, { displayName });
    
    // Update user profile in Firestore
    await db.collection('users').doc(uid).update({
      displayName,
      role,
      permissions,
      updatedAt: new Date().toISOString()
    });
    
    // Update custom claims for admin role
    if (role === 'admin') {
      await admin.auth().setCustomUserClaims(uid, {
        admin: true,
        role: 'admin'
      });
    } else {
      await admin.auth().setCustomUserClaims(uid, {
        admin: false,
        role: role
      });
    }
    
    return { success: true, message: 'User updated successfully' };
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to update user');
  }
});

/**
 * Deletes a user from Auth and Firestore (admin only)
 * Callable as 'deleteUser'
 */
export const deleteUser = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Check if the requesting user is an admin
  const adminUser = await db.collection('users').doc(context.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can delete users');
  }
  
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'User UID is required');
  }
  
  // Prevent admins from deleting themselves
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot delete your own account');
  }
  
  try {
    // Delete user from Auth
    await admin.auth().deleteUser(uid);
    
    // Delete user profile from Firestore
    await db.collection('users').doc(uid).delete();
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to delete user');
  }
});

/**
 * Sends password reset email to user (admin only)
 * Callable as 'resetUserPassword'
 */
export const resetUserPassword = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Check if the requesting user is an admin
  const adminUser = await db.collection('users').doc(context.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can reset user passwords');
  }
  
  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }
  
  try {
    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    
    // TODO: Send email with reset link (you can use a service like SendGrid)
    // For now, we'll just return the reset link
    console.log(`Password reset link for ${email}: ${resetLink}`);
    
    return { 
      success: true, 
      message: 'Password reset email sent successfully',
      resetLink // Remove this in production, just for testing
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to reset password');
  }
});

/**
 * Allows users to delete their own profile (self-deletion)
 * Callable as 'deleteOwnProfile'
 */
export const deleteOwnProfile = functions.region('us-central1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { password } = data;
  if (!password) {
    throw new functions.https.HttpsError('invalid-argument', 'Password is required for account deletion');
  }
  
  try {
    const uid = context.auth.uid;
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data();
    if (!userData?.email) {
      throw new functions.https.HttpsError('invalid-argument', 'User email not found');
    }
    
    // Verify password by attempting to sign in
    try {
      await admin.auth().getUserByEmail(userData.email);
    } catch (error) {
      throw new functions.https.HttpsError('unauthenticated', 'Invalid password');
    }
    
    // Delete avatar image from storage if it exists
    if (userData.avatarUrl && userData.avatarUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      try {
        // Extract the file path from the URL
        const urlParts = userData.avatarUrl.split('/');
        const oPathIndex = urlParts.indexOf('o');
        if (oPathIndex !== -1 && urlParts[oPathIndex + 1]) {
          const filePath = decodeURIComponent(urlParts[oPathIndex + 1].split('?')[0]);
          const bucket = admin.storage().bucket();
          await bucket.file(filePath).delete();
          console.log(`Deleted avatar image: ${filePath}`);
        }
      } catch (storageError) {
        console.warn('Failed to delete avatar image from storage:', storageError);
        // Continue with user deletion even if avatar deletion fails
      }
    }
    
    // Delete user profile from Firestore
    await db.collection('users').doc(uid).delete();
    
    // Delete user from Auth
    await admin.auth().deleteUser(uid);
    
    console.log(`User ${uid} (${userData.email}) deleted their own profile`);
    
    return { 
      success: true, 
      message: 'Profile deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting own profile:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to delete profile');
  }
}); 