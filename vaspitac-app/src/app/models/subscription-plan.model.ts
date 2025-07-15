/**
 * Subscription plan interface for managing user subscription options
 */
export interface SubscriptionPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Price display string (e.g., "Free", "$9.99/month") */
  price: string;
  /** Brief description of the plan */
  description: string;
  /** List of features included in the plan */
  features: string[];
  /** List of limitations for the plan */
  limitations: string[];
  /** Text to display on the subscription button */
  buttonText: string;
  /** CSS color class for the plan card border */
  color: string;
  /** Whether this plan is marked as popular/recommended */
  popular: boolean;
  /** Order for sorting plans */
  order: number;
} 