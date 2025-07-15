/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  SUBSCRIBER = 'subscriber',
  TRIAL_USER = 'trial',
  FREE_USER = 'free'
}

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
  TRIAL = 'trial'
}

/**
 * Subscription types
 */
export enum SubscriptionType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  TRIAL = 'trial'
}

/**
 * Content visibility levels
 */
export enum ContentVisibility {
  PUBLIC = 'public',
  SUBSCRIBER = UserRole.SUBSCRIBER,
  ADMIN = UserRole.ADMIN
} 