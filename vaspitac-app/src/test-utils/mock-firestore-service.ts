import { of } from 'rxjs';

/**
 * Mock FirestoreService for testing purposes
 * Provides spy objects for all FirestoreService methods with default return values
 */
export const mockFirestoreService = jasmine.createSpyObj('FirestoreService', [
  'getCategories',
  'getBlogPosts',
  'getTips',
  'getActivities',
  'getActivityById',
]);

// Default return values (can be overridden in tests)
mockFirestoreService.getCategories.and.returnValue(of([]));
mockFirestoreService.getBlogPosts.and.returnValue(of([]));
mockFirestoreService.getTips.and.returnValue(of([]));
mockFirestoreService.getActivities.and.returnValue(of([]));
mockFirestoreService.getActivityById.and.returnValue(of(undefined));
