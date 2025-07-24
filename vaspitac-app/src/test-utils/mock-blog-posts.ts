import { BlogPost } from '../app/models/blog-post.model';
import { ContentVisibility } from '../app/models/content-visibility.model';

/**
 * Mock blog posts data for testing purposes
 */
export const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Importance of Play in Early Childhood',
    excerpt: 'Play is more than just fun for children. It is an essential part of their development...',
    fullContent: 'Full content of the blog post about the importance of play...',
    author: 'Ana Vaspitac',
    readTime: '5 min',
    date: '2023-10-01',
    imageUrl: 'assets/images/blog-play.jpg',
    visibility: ContentVisibility.PUBLIC,
    isPremium: false,
  },
  {
    id: 2,
    title: 'Tips for a Healthy Diet for Kids',
    excerpt: 'A healthy diet is crucial for a child\'s growth and development. Here are some tips...',
    fullContent: 'Full content of the blog post about tips for a healthy diet...',
    author: 'Guest Author',
    readTime: '7 min',
    date: '2023-09-25',
    imageUrl: 'assets/images/blog-diet.jpg',
    visibility: ContentVisibility.SUBSCRIBER,
    isPremium: true,
  },
  {
    id: 3,
    title: 'Screen Time: Finding the Right Balance',
    excerpt: 'In the digital age, managing screen time for children is a common challenge for parents...',
    fullContent: 'Full content of the blog post about screen time...',
    author: 'Ana Vaspitac',
    readTime: '6 min',
    date: '2023-09-20',
    imageUrl: 'assets/images/blog-screen-time.jpg',
    visibility: ContentVisibility.PUBLIC,
    isPremium: false,
  },
];
