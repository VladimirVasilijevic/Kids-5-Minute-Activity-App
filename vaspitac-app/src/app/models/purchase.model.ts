/**
 * Represents a purchase transaction for a digital file
 */
export interface Purchase {
  /** Unique identifier for the purchase */
  id: string;
  /** User ID who made the purchase */
  userId: string;
  /** File ID that was purchased */
  fileId: string;
  /** Purchase amount */
  amount: number;
  /** Currency used for the purchase */
  currency: 'RSD' | 'EUR';
  /** Current status of the purchase */
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  /** URL to payment proof (Viber screenshot) */
  paymentProof?: string;
  /** Admin notes for the purchase */
  adminNotes?: string;
  /** Purchase creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Verification timestamp */
  verifiedAt?: string;
  /** Admin user ID who verified the purchase */
  verifiedBy?: string;
  /** Reason for rejection if purchase was rejected */
  rejectionReason?: string;
  /** User's email at time of purchase */
  userEmail?: string;
  /** User's display name at time of purchase */
  userDisplayName?: string;
}

/**
 * Form data for creating a new purchase
 */
export interface PurchaseFormData {
  /** User ID making the purchase */
  userId: string;
  /** File ID being purchased */
  fileId: string;
  /** Purchase amount */
  amount: number;
  /** Currency for the purchase */
  currency: 'RSD' | 'EUR';
  /** Optional payment proof URL */
  paymentProof?: string;
  /** Optional admin notes */
  adminNotes?: string;
}

/**
 * Data for updating purchase status
 */
export interface PurchaseStatusUpdate {
  /** New status for the purchase */
  status: 'VERIFIED' | 'REJECTED';
  /** Optional admin notes */
  adminNotes?: string;
  /** Reason for rejection if status is REJECTED */
  rejectionReason?: string;
}

/**
 * Purchase statistics
 */
export interface PurchaseStats {
  /** Total number of purchases */
  totalPurchases: number;
  /** Number of pending purchases */
  pendingCount: number;
  /** Number of verified purchases */
  verifiedCount: number;
  /** Number of rejected purchases */
  rejectedCount: number;
  /** Total revenue by currency */
  totalRevenue: {
    RSD: number;
    EUR: number;
  };
  /** Monthly revenue by currency */
  monthlyRevenue: {
    RSD: number;
    EUR: number;
  };
}
