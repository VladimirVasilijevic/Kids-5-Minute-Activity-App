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