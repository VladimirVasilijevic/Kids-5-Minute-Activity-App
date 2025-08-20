import { ContentVisibility } from './content-visibility.model';

/**
 * Represents a blog post in the application
 */
export interface BlogPost {
  /** Unique identifier */
  id: number;
  /** Blog post title */
  title: string;
  /** Blog post excerpt/summary */
  excerpt: string;
  /** Full blog post content */
  fullContent: string;
  /** Author name */
  author: string;
  /** Estimated reading time */
  readTime: string;
  /** Publication date */
  date: string;
  /** URL to the blog post's featured image */
  imageUrl: string;
  /** URL to the blog post's video (optional) */
  videoUrl?: string;
  /** URL to the blog post's video cover image (optional) */
  videoImage?: string;
  /** Content visibility level - who can access this content */
  visibility: ContentVisibility;
  /** Whether this is premium content requiring subscription */
  isPremium: boolean;
}
