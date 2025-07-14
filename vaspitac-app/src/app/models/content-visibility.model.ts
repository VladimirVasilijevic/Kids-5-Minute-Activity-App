/**
 * Content visibility levels for different content types
 */
export enum ContentVisibility {
  /** Visible to all users */
  PUBLIC = 'public',
  /** Visible to subscribers and admins */
  SUBSCRIBER = 'subscriber',
  /** Visible to admins only */
  ADMIN = 'admin'
} 