import { UserRole } from './user-profile.model';

/**
 * Content visibility levels
 */
export enum ContentVisibility {
  // eslint-disable-next-line no-unused-vars
  PUBLIC = 'public',
  // eslint-disable-next-line no-unused-vars
  SUBSCRIBER = UserRole.SUBSCRIBER,
  // eslint-disable-next-line no-unused-vars
  ADMIN = UserRole.ADMIN
} 