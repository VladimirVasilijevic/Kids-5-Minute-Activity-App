/**
 * Represents user access to a digital file
 */
export interface UserAccess {
  /** Unique identifier for the access record */
  id: string;
  /** User ID who has access */
  userId: string;
  /** File ID that user has access to */
  fileId: string;
  /** Timestamp when access was granted */
  grantedAt: string;
  /** Admin user ID who granted the access */
  grantedBy: string;
  /** Whether the access is currently active */
  isActive: boolean;
  /** Purchase ID that granted this access */
  purchaseId: string;
  /** Optional expiration timestamp (null for permanent access) */
  expiresAt?: string;
  /** Optional notes about the access grant */
  notes?: string;
}

/**
 * Form data for creating user access
 */
export interface UserAccessFormData {
  /** User ID to grant access to */
  userId: string;
  /** File ID to grant access for */
  fileId: string;
  /** Admin user ID granting the access */
  grantedBy: string;
  /** Purchase ID that grants this access */
  purchaseId: string;
  /** Optional expiration timestamp */
  expiresAt?: string;
  /** Optional notes */
  notes?: string;
}

/**
 * Extended user access with file and user details
 */
export interface UserAccessWithDetails extends UserAccess {
  /** File details */
  file?: {
    title: string;
    fileType: string;
    priceRSD: number;
    priceEUR: number;
  };
  /** User details */
  user?: {
    displayName: string;
    email: string;
  };
  /** Purchase details */
  purchase?: {
    amount: number;
    currency: 'RSD' | 'EUR';
    verifiedAt: string;
  };
}
