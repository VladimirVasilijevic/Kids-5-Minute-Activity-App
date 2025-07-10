/**
 * Represents a user profile stored in Firestore.
 */
export interface UserProfile {
  /** Firebase Auth UID */
  uid: string;
  /** User's display name */
  displayName: string;
  /** User's email address */
  email: string;
  /** URL to the user's avatar/profile picture */
  avatarUrl?: string;
  /** Date the profile was created (ISO string) */
  createdAt: string;
  /** User's role in the system */
  role: UserRole;
  /** Subscription information */
  subscription?: Subscription;
  /** User's permissions */
  permissions: Permission[];
  /** Date the profile was last updated (ISO string) */
  updatedAt?: string;
}

/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  SUBSCRIBER = 'subscriber',
  TRIAL_USER = 'trial_user',
  FREE_USER = 'free_user'
}

/**
 * Subscription information
 */
export interface Subscription {
  /** Subscription status */
  status: SubscriptionStatus;
  /** Type of subscription */
  type: SubscriptionType;
  /** Start date of subscription (ISO string) */
  startDate: string;
  /** End date of subscription (ISO string) */
  endDate?: string;
  /** Whether subscription auto-renews */
  autoRenew: boolean;
  /** Payment method used */
  paymentMethod?: string;
  /** Last payment date (ISO string) */
  lastPaymentDate?: string;
  /** Next payment date (ISO string) */
  nextPaymentDate?: string;
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
 * Permission types
 */
export enum Permission {
  // Content access permissions
  ACCESS_ALL_ACTIVITIES = 'access_all_activities',
  ACCESS_PREMIUM_ACTIVITIES = 'access_premium_activities',
  ACCESS_BLOG_POSTS = 'access_blog_posts',
  ACCESS_PREMIUM_BLOG = 'access_premium_blog',
  ACCESS_TIPS = 'access_tips',
  ACCESS_PREMIUM_TIPS = 'access_premium_tips',
  
  // Download permissions
  DOWNLOAD_PDF_GUIDES = 'download_pdf_guides',
  DOWNLOAD_VIDEO_MATERIALS = 'download_video_materials',
  
  // Admin permissions
  MANAGE_CONTENT = 'manage_content',
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  
  // User permissions
  EDIT_PROFILE = 'edit_profile',
  VIEW_PROFILE = 'view_profile',
  MANAGE_OWN_SUBSCRIPTION = 'manage_own_subscription'
} 