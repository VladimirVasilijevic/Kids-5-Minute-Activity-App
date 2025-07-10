import { Activity } from './activity.model';

/**
 * Interface for admin activity with additional management properties
 */
export interface AdminActivity extends Activity {
  /** Whether the activity is being edited */
  isEditing?: boolean;
  /** Whether the activity is being deleted */
  isDeleting?: boolean;
  /** ISO string of creation date (optional) */
  createdAt?: string;
} 