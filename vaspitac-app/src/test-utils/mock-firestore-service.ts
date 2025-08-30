import { of } from 'rxjs';

/**
 * Mock FirestoreService for testing purposes
 * Provides spy objects for all FirestoreService methods with default return values
 *
 * NOTE: In tests, set getBlogPosts to return mockBlogPosts (with fullContent) from mock-blog-posts.ts
 */
export const mockFirestoreService = jasmine.createSpyObj('FirestoreService', [
  'getCategories',
  'getBlogPosts',

  'getActivities',
  'getActivityById',
]);

// Default return values (can be overridden in tests)
mockFirestoreService.getCategories.and.returnValue(of([]));
mockFirestoreService.getBlogPosts.and.returnValue(of([])); // Override in tests with mockBlogPosts

mockFirestoreService.getActivities.and.returnValue(of([]));
mockFirestoreService.getActivityById.and.returnValue(of(undefined));
