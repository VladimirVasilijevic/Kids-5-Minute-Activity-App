/**
 * Represents a single experience entry
 */
export interface Experience {
  /** Experience title/position */
  title: string;
  /** Experience description */
  description: string;
  /** Date range (e.g., "2018 - present") */
  dateRange?: string;
}

/**
 * Represents the about page content structure
 * Contains all editable sections of the about page
 */
export interface AboutContent {
  /** Person's name */
  name: string;
  /** Person's role/title */
  role: string;
  /** Array of biography paragraphs */
  bioParagraphs: string[];
  /** Array of experience entries */
  experiences: Experience[];
  /** Contact email */
  email: string;
  /** Contact phone number */
  phone: string;
  /** Location/city */
  location: string;
  /** Profile image URL (optional) */
  profileImageUrl?: string;
  /** Date when content was last updated */
  lastUpdated?: string;
}

/**
 * Represents the complete about content data structure
 */
export interface AboutContentData {
  /** Version of the data */
  version: string;
  /** Supported languages */
  languages: string[];
  /** About content */
  data: AboutContent;
} 