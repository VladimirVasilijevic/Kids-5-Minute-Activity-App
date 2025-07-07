import { CategoryKey } from './category-keys';

/**
 * Represents a category for organizing activities and content
 */
export interface Category {
  /** Unique identifier for the category */
  id: CategoryKey;
  /** Display title of the category */
  title: string;
  /** Description of the category */
  description: string;
  /** CSS color class for styling */
  color: string;
  /** Icon name for the category */
  icon: string;
}
