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
} 