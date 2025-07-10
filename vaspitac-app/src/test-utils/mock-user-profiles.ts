/**
 * Mock user profiles for testing
 */
import { UserProfile, UserRole, Permission } from '../app/models/user-profile.model';

/**
 * Mock free user profile
 */
export const mockFreeUser: UserProfile = {
  uid: '1',
  displayName: 'Test User',
  email: 'test@test.com',
  avatarUrl: '',
  createdAt: '2023-01-01',
  role: UserRole.FREE_USER,
  permissions: [Permission.VIEW_PROFILE, Permission.EDIT_PROFILE]
};

/**
 * Mock subscriber user profile
 */
export const mockSubscriber: UserProfile = {
  uid: '2',
  displayName: 'Subscriber User',
  email: 'subscriber@test.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01',
  role: UserRole.SUBSCRIBER,
  permissions: [
    Permission.ACCESS_ALL_ACTIVITIES,
    Permission.ACCESS_PREMIUM_ACTIVITIES,
    Permission.ACCESS_BLOG_POSTS,
    Permission.ACCESS_PREMIUM_BLOG,
    Permission.ACCESS_TIPS,
    Permission.ACCESS_PREMIUM_TIPS,
    Permission.DOWNLOAD_PDF_GUIDES,
    Permission.DOWNLOAD_VIDEO_MATERIALS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_PROFILE,
    Permission.MANAGE_OWN_SUBSCRIPTION
  ],
  subscription: {
    status: 'active' as any,
    type: 'monthly' as any,
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2024-01-01T00:00:00.000Z',
    autoRenew: true,
    paymentMethod: 'credit_card',
    lastPaymentDate: '2023-01-01T00:00:00.000Z',
    nextPaymentDate: '2024-01-01T00:00:00.000Z'
  }
};

/**
 * Mock trial user profile
 */
export const mockTrialUser: UserProfile = {
  uid: '3',
  displayName: 'Trial User',
  email: 'trial@test.com',
  avatarUrl: '',
  createdAt: '2023-01-01',
  role: UserRole.TRIAL_USER,
  permissions: [
    Permission.ACCESS_ALL_ACTIVITIES,
    Permission.ACCESS_BLOG_POSTS,
    Permission.ACCESS_TIPS,
    Permission.EDIT_PROFILE,
    Permission.VIEW_PROFILE,
    Permission.MANAGE_OWN_SUBSCRIPTION
  ],
  subscription: {
    status: 'trial' as any,
    type: 'trial' as any,
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2023-01-08T00:00:00.000Z',
    autoRenew: false
  }
};

/**
 * Mock admin user profile
 */
export const mockAdminUser: UserProfile = {
  uid: '4',
  displayName: 'Admin User',
  email: 'admin@test.com',
  avatarUrl: 'https://example.com/admin-avatar.jpg',
  createdAt: '2023-01-01',
  role: UserRole.ADMIN,
  permissions: Object.values(Permission) // Admin has all permissions
};

/**
 * Mock user profile without subscription
 */
export const mockUserWithoutSubscription: UserProfile = {
  uid: '5',
  displayName: 'No Sub User',
  email: 'nosub@test.com',
  avatarUrl: '',
  createdAt: '2023-01-01',
  role: UserRole.FREE_USER,
  permissions: [Permission.VIEW_PROFILE, Permission.EDIT_PROFILE]
};

/**
 * Get mock user profile by role
 * @param role - User role to get mock for
 * @returns Mock user profile for the specified role
 */
export function getMockUserByRole(role: UserRole): UserProfile {
  switch (role) {
    case UserRole.ADMIN:
      return mockAdminUser;
    case UserRole.SUBSCRIBER:
      return mockSubscriber;
    case UserRole.TRIAL_USER:
      return mockTrialUser;
    case UserRole.FREE_USER:
    default:
      return mockFreeUser;
  }
} 