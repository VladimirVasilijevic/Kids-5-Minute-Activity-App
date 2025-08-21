import { ContentVisibility } from './content-visibility.model';

/**
 * Represents a single activity for children
 */
export interface Activity {
  /** Unique identifier for the activity */
  id: string;
  /** Title of the activity */
  title: string;
  /** Description of the activity */
  description: string;
  /** URL to the activity's image */
  imageUrl: string;
  /** Category the activity belongs to */
  category: string;
  /** Duration of the activity */
  duration: string;
  /** Target age group (optional) */
  ageGroup?: string;
  /** Markdown content for materials needed (optional) */
  materials?: string;
  /** Markdown content for step-by-step instructions (optional) */
  instructions?: string;
  /** URL to video demonstration (optional) */
  videoUrl?: string;
  /** Content visibility level - who can access this content */
  visibility: ContentVisibility;
  /** Whether this is premium content requiring subscription */
  isPremium: boolean;
}

/**
 * Represents the complete activities data structure
 */
export interface ActivitiesData {
  /** Version of the data */
  version: string;
  /** Supported languages */
  languages: string[];
  /** Array of activities */
  data: Activity[];
}
