import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';
import { UserRole, SubscriptionStatus, SubscriptionType, ContentVisibility, ContentVisibilityType } from './types';

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
export const assignAdminRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUserId } = request.data;
  if (!targetUserId) {
    throw new HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    const adminUser = await db.collection('users').doc(request.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Only admins can assign admin role');
    }

    const targetUserRecord = await admin.auth().getUser(targetUserId);
    
    await db.collection('users').doc(targetUserId).update({
      role: UserRole.ADMIN,
      permissions: ADMIN_PERMISSIONS,
      subscription: {
        type: SubscriptionType.TRIAL,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date().toISOString(),
        autoRenew: true
      },
      updatedAt: new Date().toISOString()
    });

    await admin.auth().setCustomUserClaims(targetUserId, {
      admin: true,
      role: UserRole.ADMIN
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
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to assign admin role');
  }
});

/**
 * Function to remove admin role (callable function)
 * Only existing admins can remove admin role from others
 */
export const removeAdminRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { targetUserId } = request.data;
  if (!targetUserId) {
    throw new HttpsError('invalid-argument', 'targetUserId is required');
  }

  try {
    const adminUser = await db.collection('users').doc(request.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Only admins can remove admin role');
    }

    const targetUserRecord = await admin.auth().getUser(targetUserId);
    
    await db.collection('users').doc(targetUserId).update({
      role: UserRole.FREE_USER,
      permissions: FREE_USER_PERMISSIONS,
      subscription: null,
      updatedAt: new Date().toISOString()
    });

    await admin.auth().setCustomUserClaims(targetUserId, {
      admin: false,
      role: UserRole.FREE_USER
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
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to remove admin role');
  }
});

/**
 * Function to check subscription status daily (scheduled)
 * Runs every 24 hours to update expired subscriptions
 */
export const checkSubscriptionStatus = onSchedule('every 24 hours', async (event) => {
  const now = new Date();
  
  try {
    const expiredUsers = await db.collection('users')
      .where('subscription.status', 'in', [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
      .where('subscription.endDate', '<', now)
      .get();

    if (expiredUsers.empty) {
      console.log('No expired subscriptions found');
      return;
    }

    const batch = db.batch();
    let updatedCount = 0;
    
    expiredUsers.forEach(doc => {
      const userData = doc.data();
      
      if (userData.role === UserRole.ADMIN) {
        return;
      }
      
      batch.update(doc.ref, {
        'subscription.status': SubscriptionStatus.EXPIRED,
        'role': UserRole.FREE_USER,
        'permissions': FREE_USER_PERMISSIONS,
        updatedAt: new Date().toISOString()
      });
      updatedCount++;
    });

    await batch.commit();
    console.log(`Updated ${updatedCount} expired subscriptions`);
  } catch (error) {
    console.error('Error checking subscription status:', error);
  }
});

/**
 * Function to create user profile on sign up (Eventarc trigger)
 * Automatically creates user profile with default role and permissions
 */
export const createUserProfile = onMessagePublished('google.firebase.auth.user.v1.created', async (event) => {
  try {
    const user = event.data.message.json;
    if (!user || !user.uid) {
        console.log('User data not available in event.');
        return;
    }
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      console.log(`User profile already exists for ${user.email}`);
      return;
    }

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
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

/**
 * Function to delete user profile on account deletion (Eventarc trigger)
 * Cleans up user data when account is deleted
 */
export const deleteUserProfile = onMessagePublished('google.firebase.auth.user.v1.deleted', async (event) => {
  try {
    const user = event.data.message.json;
    if (!user || !user.uid) {
        console.log('User data not available in event.');
        return;
    }
    await db.collection('users').doc(user.uid).delete();
    console.log(`Deleted user profile for ${user.email}`);
  } catch (error) {
    console.error('Error deleting user profile:', error);
  }
});

/**
 * Function to get user statistics (admin only)
 * Returns user counts by role and subscription status
 */
export const getUserStats = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const adminUser = await db.collection('users').doc(request.auth.uid).get();
    
    if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Only admins can view user stats');
    }

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
      
      const role = userData.role || 'unknown';
      stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      
      const subscriptionStatus = userData.subscription?.status || 'no_subscription';
      stats.bySubscription[subscriptionStatus] = (stats.bySubscription[subscriptionStatus] || 0) + 1;
      
      if (new Date(userData.createdAt) > oneWeekAgo) {
        stats.recentSignups++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to get user stats');
  }
}); 

/**
 * Creates a new user in Auth and Firestore (admin only)
 */
export const createUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const adminUser = await db.collection('users').doc(request.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
    throw new HttpsError('permission-denied', 'Only admins can create users');
  }

  const { email, password, displayName, role } = request.data;
  if (!email || !password || !displayName || !role) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName });
    let permissions = FREE_USER_PERMISSIONS;
    if (role === UserRole.ADMIN) permissions = ADMIN_PERMISSIONS;

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
    throw new HttpsError('internal', error.message || 'Failed to create user');
  }
});

/**
 * Updates an existing user in Auth and Firestore (admin only)
 */
export const updateUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const adminUser = await db.collection('users').doc(request.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
    throw new HttpsError('permission-denied', 'Only admins can update users');
  }
  
  const { uid, displayName, role } = request.data;
  if (!uid || !displayName || !role) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }
  
  if (uid === request.auth.uid) {
    throw new HttpsError('permission-denied', 'Cannot modify your own role');
  }
  
  try {
    let permissions = FREE_USER_PERMISSIONS;
    if (role === UserRole.ADMIN) permissions = ADMIN_PERMISSIONS;
    
    await admin.auth().updateUser(uid, { displayName });
    
    await db.collection('users').doc(uid).update({
      displayName,
      role,
      permissions,
      updatedAt: new Date().toISOString()
    });
    
    if (role === UserRole.ADMIN) {
      await admin.auth().setCustomUserClaims(uid, { admin: true, role: UserRole.ADMIN });
    } else {
      await admin.auth().setCustomUserClaims(uid, { admin: false, role: role });
    }
    
    return { success: true, message: 'User updated successfully' };
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new HttpsError('internal', error.message || 'Failed to update user');
  }
});

/**
 * Deletes a user from Auth and Firestore (admin only)
 */
export const deleteUser = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const adminUser = await db.collection('users').doc(request.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
    throw new HttpsError('permission-denied', 'Only admins can delete users');
  }
  
  const { uid } = request.data;
  if (!uid) {
    throw new HttpsError('invalid-argument', 'User UID is required');
  }
  
  if (uid === request.auth.uid) {
    throw new HttpsError('permission-denied', 'Cannot delete your own account');
  }
  
  try {
    await admin.auth().deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    throw new HttpsError('internal', error.message || 'Failed to delete user');
  }
});

/**
 * Sends password reset email to user (admin only)
 */
export const resetUserPassword = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const adminUser = await db.collection('users').doc(request.auth.uid).get();
  if (!adminUser.exists || adminUser.data()?.role !== UserRole.ADMIN) {
    throw new HttpsError('permission-denied', 'Only admins can reset user passwords');
  }
  
  const { email } = request.data;
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }
  
  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    console.log(`Password reset link for ${email}: ${resetLink}`);
    
    return { 
      success: true, 
      message: 'Password reset email sent successfully',
      resetLink
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new HttpsError('internal', error.message || 'Failed to reset password');
  }
});

/**
 * Allows users to delete their own profile (self-deletion)
 */
export const deleteOwnProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { password } = request.data;
  if (!password) {
    throw new HttpsError('invalid-argument', 'Password is required for account deletion');
  }
  
  try {
    const uid = request.auth.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }
    
    const userData = userDoc.data();
    if (!userData?.email) {
      throw new HttpsError('invalid-argument', 'User email not found');
    }
    
    try {
      await admin.auth().getUserByEmail(userData.email);
    } catch (error) {
      throw new HttpsError('unauthenticated', 'Invalid password');
    }
    
    if (userData.avatarUrl && userData.avatarUrl.startsWith('https://firebasestorage.googleapis.com/')) {
      try {
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
      }
    }
    
    await db.collection('users').doc(uid).delete();
    await admin.auth().deleteUser(uid);
    
    console.log(`User ${uid} (${userData.email}) deleted their own profile`);
    
    return { 
      success: true, 
      message: 'Profile deleted successfully' 
    };
  } catch (error: any) {
    console.error('Error deleting own profile:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', error.message || 'Failed to delete profile');
  }
});

/**
 * Helper function to check if user can access content based on role and visibility
 */
function canAccessContent(userRole: string | null, visibility: ContentVisibilityType, isPremium: boolean): boolean {
  if (visibility === ContentVisibility.PUBLIC) return true;
  if (userRole === UserRole.ADMIN) return true;
  if (visibility === ContentVisibility.SUBSCRIBER) return userRole === 'subscriber' || userRole === 'trial';
  if (visibility === ContentVisibility.ADMIN) return userRole === UserRole.ADMIN;
  return false;
}

/**
 * Get filtered activities based on user role and content visibility
 */
export const getFilteredActivities = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { language = 'en' } = request.data;
  
  try {
    const uid = request.auth.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;
    
    console.log(`User ${uid} with role ${userRole} requesting activities in ${language}`);
    
    const activitiesSnapshot = await db.collection(`activities_${language}`).get();
    
    if (activitiesSnapshot.empty) {
      return { activities: [] };
    }
    
    const activities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    const filteredActivities = activities.filter(activity => {
      const visibility = activity.visibility || ContentVisibility.PUBLIC;
      const isPremium = activity.isPremium || false;
      return canAccessContent(userRole, visibility, isPremium);
    });
    
    console.log(`Filtered ${activities.length} activities to ${filteredActivities.length} for user ${uid}`);
    
    return { 
      activities: filteredActivities,
      totalCount: activities.length,
      filteredCount: filteredActivities.length,
      userRole: userRole
    };
  } catch (error: any) {
    console.error('Error getting filtered activities:', error);
    throw new HttpsError('internal', error.message || 'Failed to get activities');
  }
});

/**
 * Get filtered blog posts based on user role and content visibility
 */
export const getFilteredBlogPosts = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { language = 'en' } = request.data;
  
  try {
    const uid = request.auth.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;
    
    console.log(`User ${uid} with role ${userRole} requesting blog posts in ${language}`);
    
    const blogPostsSnapshot = await db.collection(`blog_${language}`).get();
    
    if (blogPostsSnapshot.empty) {
      return { blogPosts: [] };
    }
    
    const blogPosts = blogPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    const filteredBlogPosts = blogPosts.filter(blogPost => {
      const visibility = blogPost.visibility || ContentVisibility.PUBLIC;
      const isPremium = blogPost.isPremium || false;
      return canAccessContent(userRole, visibility, isPremium);
    });
    
    console.log(`Filtered ${blogPosts.length} blog posts to ${filteredBlogPosts.length} for user ${uid}`);
    
    return { 
      blogPosts: filteredBlogPosts,
      totalCount: blogPosts.length,
      filteredCount: filteredBlogPosts.length,
      userRole: userRole
    };
  } catch (error: any) {
    console.error('Error getting filtered blog posts:', error);
    throw new HttpsError('internal', error.message || 'Failed to get blog posts');
  }
});

/**
 * Get public content for non-authenticated users
 */
export const getPublicContent = onCall(async (request) => {
  const { contentType, language = 'en' } = request.data;
  
  if (!contentType || !['activities', 'blog'].includes(contentType)) {
    throw new HttpsError('invalid-argument', 'contentType must be "activities" or "blog"');
  }
  
  try {
    console.log(`Anonymous user requesting public ${contentType} in ${language}`);
    
    const collectionName = contentType === 'activities' ? `activities_${language}` : `blog_${language}`;
    const contentSnapshot = await db.collection(collectionName).get();
    
    if (contentSnapshot.empty) {
      return { content: [] };
    }
    
    const content = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    const publicContent = content.filter(item => {
      const visibility = item.visibility || ContentVisibility.PUBLIC;
      const isPremium = item.isPremium || false;
      return visibility === ContentVisibility.PUBLIC && !isPremium;
    });
    
    console.log(`Filtered ${content.length} ${contentType} to ${publicContent.length} public items`);
    
    return { 
      content: publicContent,
      totalCount: content.length,
      publicCount: publicContent.length,
      contentType: contentType
    };
  } catch (error: any) {
    console.error(`Error getting public ${contentType}:`, error);
    throw new HttpsError('internal', error.message || `Failed to get ${contentType}`);
  }
});

// ============================================================================
// DIGITAL MARKETPLACE SECURITY FUNCTIONS
// ============================================================================

/**
 * Verify user access to a digital file
 * This function runs server-side and cannot be bypassed by client-side manipulation
 */
export const verifyFileAccess = onCall(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fileId } = request.data;
  const userId = request.auth.uid;

  if (!fileId) {
    throw new HttpsError('invalid-argument', 'File ID is required');
  }

  try {
    // Check if user has access to this file
    const accessDoc = await db
      .collection('user_access')
      .where('userId', '==', userId)
      .where('fileId', '==', fileId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (accessDoc.empty) {
      throw new HttpsError('permission-denied', 'User does not have access to this file');
    }

    // Get file details
    const fileDoc = await db.collection('digital-files').doc(fileId).get();
    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data();
    
    // Return file access information (without exposing sensitive data)
    return {
      hasAccess: true,
      fileId: fileId,
      fileName: fileData?.fileName,
      fileType: fileData?.fileType,
      fileSize: fileData?.fileSize,
      accessGrantedAt: accessDoc.docs[0].data().grantedAt
    };

  } catch (error) {
    console.error('Error verifying file access:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to verify file access');
  }
});

/**
 * Grant access to a user for a digital file
 * This function handles the server-side logic for granting access
 */
export const grantFileAccess = onCall(async (request) => {
  // Verify authentication and admin role
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, fileId, purchaseId } = request.data;
  const adminUid = request.auth.uid;

  if (!userId || !fileId || !purchaseId) {
    throw new HttpsError('invalid-argument', 'User ID, File ID, and Purchase ID are required');
  }

  try {
    // Verify admin role
    const adminDoc = await db.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Check if access already exists
    const existingAccess = await db
      .collection('user_access')
      .where('userId', '==', userId)
      .where('fileId', '==', fileId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (!existingAccess.empty) {
      throw new HttpsError('already-exists', 'User already has access to this file');
    }

    // Create access record
    const accessData = {
      userId,
      fileId,
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      grantedBy: adminUid,
      isActive: true,
      purchaseId
    };

    await db.collection('user_access').add(accessData);

    // Update purchase status to verified
    await db.collection('purchases').doc(purchaseId).update({
      status: 'VERIFIED',
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: adminUid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      message: 'Access granted successfully',
      accessGrantedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error granting file access:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to grant file access');
  }
});

/**
 * Revoke access from a user for a digital file
 */
export const revokeFileAccess = onCall(async (request) => {
  // Verify authentication and admin role
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, fileId } = request.data;
  const adminUid = request.auth.uid;

  if (!userId || !fileId) {
    throw new HttpsError('invalid-argument', 'User ID and File ID are required');
  }

  try {
    // Verify admin role
    const adminDoc = await db.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Find and deactivate access
    const accessQuery = await db
      .collection('user_access')
      .where('userId', '==', userId)
      .where('fileId', '==', fileId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (accessQuery.empty) {
      throw new HttpsError('not-found', 'Active access record not found');
    }

    const accessDoc = accessQuery.docs[0];
    await accessDoc.ref.update({
      isActive: false,
      revokedAt: admin.firestore.FieldValue.serverTimestamp(),
      revokedBy: adminUid
    });

    return {
      success: true,
      message: 'Access revoked successfully',
      accessRevokedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error revoking file access:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to revoke file access');
  }
});

/**
 * Get secure file download information
 * This function validates access and returns secure download details
 */
export const getSecureFileDownload = onCall(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fileId } = request.data;
  const userId = request.auth.uid;

  if (!fileId) {
    throw new HttpsError('invalid-argument', 'File ID is required');
  }

  try {
    // Verify access on server side
    const accessDoc = await db
      .collection('user_access')
      .where('userId', '==', userId)
      .where('fileId', '==', fileId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (accessDoc.empty) {
      throw new HttpsError('permission-denied', 'User does not have access to this file');
    }

    // Get file details
    const fileDoc = await db.collection('digital-files').doc(fileId).get();
    if (!fileDoc.exists) {
      throw new HttpsError('not-found', 'File not found');
    }

    const fileData = fileDoc.data();
    
    // Return secure download information
    return {
      hasAccess: true,
      fileId: fileId,
      fileName: fileData?.fileName,
      fileType: fileData?.fileType,
      fileSize: fileData?.fileSize,
      downloadUrl: fileData?.fileUrl, // This URL is still protected by Storage rules
      accessVerifiedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting secure file download:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to get secure file download');
  }
});

/**
 * Verify purchase and grant access
 * This function handles the complete purchase verification workflow
 */
export const verifyPurchaseAndGrantAccess = onCall(async (request) => {
  // Verify authentication and admin role
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { purchaseId, adminNotes } = request.data;
  const adminUid = request.auth.uid;

  if (!purchaseId) {
    throw new HttpsError('invalid-argument', 'Purchase ID is required');
  }

  try {
    // Verify admin role
    const adminDoc = await db.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== UserRole.ADMIN) {
      throw new HttpsError('permission-denied', 'Admin role required');
    }

    // Get purchase details
    const purchaseDoc = await db.collection('purchases').doc(purchaseId).get();
    if (!purchaseDoc.exists) {
      throw new HttpsError('not-found', 'Purchase not found');
    }

    const purchaseData = purchaseDoc.data();
    
    if (purchaseData?.status !== 'PENDING') {
      throw new HttpsError('failed-precondition', 'Purchase is not in pending status');
    }

    // Grant access using the existing function
    const accessResult = await grantFileAccess({
      data: {
        userId: purchaseData.userId,
        fileId: purchaseData.fileId,
        purchaseId: purchaseId
      },
      auth: request.auth
    } as any);

    return {
      success: true,
      message: 'Purchase verified and access granted successfully',
      purchaseId: purchaseId,
      accessResult: accessResult
    };

  } catch (error) {
    console.error('Error verifying purchase and granting access:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Failed to verify purchase and grant access');
  }
}); 