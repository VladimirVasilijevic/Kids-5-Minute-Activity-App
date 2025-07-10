import { BlogPost } from './blog-post.model';

/**
 * Interface for admin blog post with additional management properties
 */
export interface AdminBlogPost extends BlogPost {
  /** Whether the blog post is being edited */
  isEditing?: boolean;
  /** Whether the blog post is being deleted */
  isDeleting?: boolean;
  /** Status of the blog post */
  status?: 'published' | 'draft';
} 