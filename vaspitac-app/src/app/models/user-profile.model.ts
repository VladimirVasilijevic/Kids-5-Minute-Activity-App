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
  /** Purchase history for digital files */
  purchaseHistory?: {
    purchases: string[]; // Array of purchase IDs
    totalSpent: {
      RSD: number;
      EUR: number;
    };
    lastPurchaseDate?: string;
  };
}

/**
 * User roles in the system
 */
export enum UserRole {
  // eslint-disable-next-line no-unused-vars
  ADMIN = 'admin',
  // eslint-disable-next-line no-unused-vars
  SUBSCRIBER = 'subscriber',
  // eslint-disable-next-line no-unused-vars
  TRIAL_USER = 'trial',
  // eslint-disable-next-line no-unused-vars
  FREE_USER = 'free'
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
  // eslint-disable-next-line no-unused-vars
  ACTIVE = 'active',
  // eslint-disable-next-line no-unused-vars
  EXPIRED = 'expired',
  // eslint-disable-next-line no-unused-vars
  CANCELLED = 'cancelled',
  // eslint-disable-next-line no-unused-vars
  PENDING = 'pending',
  // eslint-disable-next-line no-unused-vars
  TRIAL = 'trial'
}

/**
 * Subscription types
 */
export enum SubscriptionType {
  // eslint-disable-next-line no-unused-vars
  MONTHLY = 'monthly',
  // eslint-disable-next-line no-unused-vars
  YEARLY = 'yearly',
  // eslint-disable-next-line no-unused-vars
  TRIAL = 'trial'
}

/**
 * Permission types
 */
export enum Permission {
  // Content access permissions
  // eslint-disable-next-line no-unused-vars
  ACCESS_ALL_ACTIVITIES = 'access_all_activities',
  // eslint-disable-next-line no-unused-vars
  ACCESS_PREMIUM_ACTIVITIES = 'access_premium_activities',
  // eslint-disable-next-line no-unused-vars
  ACCESS_BLOG_POSTS = 'access_blog_posts',
  // eslint-disable-next-line no-unused-vars
  ACCESS_PREMIUM_BLOG = 'access_premium_blog',
  // eslint-disable-next-line no-unused-vars
  ACCESS_TIPS = 'access_tips',
  // eslint-disable-next-line no-unused-vars
  ACCESS_PREMIUM_TIPS = 'access_premium_tips',
  
  // Download permissions
  // eslint-disable-next-line no-unused-vars
  DOWNLOAD_PDF_GUIDES = 'download_pdf_guides',
  // eslint-disable-next-line no-unused-vars
  DOWNLOAD_VIDEO_MATERIALS = 'download_video_materials',
  
  // Admin permissions
  // eslint-disable-next-line no-unused-vars
  MANAGE_CONTENT = 'manage_content',
  // eslint-disable-next-line no-unused-vars
  MANAGE_USERS = 'manage_users',
  // eslint-disable-next-line no-unused-vars
  VIEW_ANALYTICS = 'view_analytics',
  // eslint-disable-next-line no-unused-vars
  MANAGE_SUBSCRIPTIONS = 'manage_subscriptions',
  
  // User permissions
  // eslint-disable-next-line no-unused-vars
  EDIT_PROFILE = 'edit_profile',
  // eslint-disable-next-line no-unused-vars
  VIEW_PROFILE = 'view_profile',
  // eslint-disable-next-line no-unused-vars
  MANAGE_OWN_SUBSCRIPTION = 'manage_own_subscription'
} 