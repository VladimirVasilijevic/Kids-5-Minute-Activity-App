import { UserRole } from './user-profile.model';

/**
 * Content visibility levels
 */
export enum ContentVisibility {
  PUBLIC = 'public',
  SUBSCRIBER = UserRole.SUBSCRIBER,
  ADMIN = UserRole.ADMIN
} 