/**
 * Represents a blog post in the application
 */
export interface BlogPost {
  /** Unique identifier for the blog post */
  id: number;
  /** Title of the blog post */
  title: string;
  /** Short excerpt/summary of the blog post */
  excerpt: string;
  /** Author of the blog post */
  author: string;
  /** Estimated reading time */
  readTime: string;
  /** Publication date */
  date: string;
  /** URL to the blog post's featured image */
  imageUrl: string;
}
