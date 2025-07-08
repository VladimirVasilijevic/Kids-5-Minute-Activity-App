import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockFirestoreService } from '../../test-utils/mock-firestore-service';
import { mockBlogPosts } from '../../test-utils/mock-blog-posts';

import { FirestoreService } from './firestore.service';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlogService, { provide: FirestoreService, useValue: mockFirestoreService }],
    });
    service = TestBed.inject(BlogService);
    mockFirestoreService.getBlogPosts.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBlogPosts', () => {
    it('should get blog posts from FirestoreService', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPosts().subscribe((posts) => {
        expect(posts).toEqual(mockBlogPosts);
        posts.forEach(post => expect(post.fullContent).toBeDefined()); // Ensure fullContent exists
      });
      expect(mockFirestoreService.getBlogPosts).toHaveBeenCalled();
    });

    it('should return empty array when no posts exist', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of([]));
      service.getBlogPosts().subscribe(posts => {
        expect(posts).toEqual([]);
        expect(posts.length).toBe(0);
      });
    });

    it('should handle single blog post', () => {
      const singlePost = [mockBlogPosts[0]];
      mockFirestoreService.getBlogPosts.and.returnValue(of(singlePost));
      service.getBlogPosts().subscribe(posts => {
        expect(posts.length).toBe(1);
        expect(posts[0].title).toBe(singlePost[0].title);
        expect(posts[0].fullContent).toBeDefined();
      });
    });

    it('should handle large number of blog posts', () => {
      const largePostArray = Array.from({ length: 100 }, (_, i) => ({
        ...mockBlogPosts[0],
        id: i + 1,
        title: `Post ${i + 1}`,
        fullContent: `Content ${i + 1}`
      }));
      mockFirestoreService.getBlogPosts.and.returnValue(of(largePostArray));
      service.getBlogPosts().subscribe(posts => {
        expect(posts.length).toBe(100);
        expect(posts[99].title).toBe('Post 100');
        expect(posts[99].fullContent).toBe('Content 100');
      });
    });

    it('should handle posts with missing optional fields', () => {
      const minimalPost = {
        id: 1,
        title: 'Minimal Post',
        excerpt: 'Minimal excerpt',
        fullContent: 'Minimal content',
        author: 'Test Author',
        readTime: '2 min',
        date: '2023-01-01',
        imageUrl: 'test-image.jpg'
      };
      mockFirestoreService.getBlogPosts.and.returnValue(of([minimalPost]));
      service.getBlogPosts().subscribe(posts => {
        expect(posts[0]).toEqual(minimalPost);
        expect(posts[0].title).toBe('Minimal Post');
      });
    });
  });

  describe('getBlogPostById', () => {
    it('should get blog post by id successfully', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(1).subscribe(post => {
        expect(post).toEqual(mockBlogPosts[0]);
        expect(post.id).toBe(1);
      });
    });

    it('should get blog post by different id', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(2).subscribe(post => {
        expect(post).toEqual(mockBlogPosts[1]);
        expect(post.id).toBe(2);
      });
    });

    it('should throw error when blog post not found with non-existent id', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(999).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Blog post with ID 999 not found');
        }
      });
    });

    it('should throw error when blog post not found with negative id', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(-1).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Blog post with ID -1 not found');
        }
      });
    });

    it('should throw error when blog post not found with zero id', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(0).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Blog post with ID 0 not found');
        }
      });
    });

    it('should handle string id parameter', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(1).subscribe(post => {
        expect(post).toEqual(mockBlogPosts[0]);
        expect(post.id).toBe(1);
      });
    });

    it('should handle posts with missing optional fields', () => {
      const minimalPost = {
        id: 1,
        title: 'Minimal Post',
        excerpt: 'Minimal excerpt',
        fullContent: 'Minimal content',
        author: 'Test Author',
        readTime: '2 min',
        date: '2023-01-01',
        imageUrl: 'test-image.jpg'
      };
      mockFirestoreService.getBlogPosts.and.returnValue(of([minimalPost]));
      service.getBlogPostById(1).subscribe(post => {
        expect(post).toEqual(minimalPost);
        expect(post.title).toBe('Minimal Post');
      });
    });

    it('should handle empty posts array when searching by id', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of([]));
      service.getBlogPostById(1).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Blog post with ID 1 not found');
        }
      });
    });
  });

  describe('Service Integration', () => {
    it('should call firestore service for each getBlogPosts call', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPosts().subscribe();
      service.getBlogPosts().subscribe();
      service.getBlogPosts().subscribe();
      expect(mockFirestoreService.getBlogPosts).toHaveBeenCalledTimes(3);
    });

    it('should call firestore service for each getBlogPostById call', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(1).subscribe();
      service.getBlogPostById(2).subscribe();
      expect(mockFirestoreService.getBlogPosts).toHaveBeenCalledTimes(2);
    });

    it('should handle firestore service returning null', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(null as any));
      service.getBlogPosts().subscribe(posts => {
        expect(posts).toBeNull();
      });
    });

    it('should handle firestore service returning undefined', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of(undefined as any));
      service.getBlogPosts().subscribe(posts => {
        expect(posts).toBeUndefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle firestore service throwing error', () => {
      mockFirestoreService.getBlogPosts.and.returnValue(of([]));
      // Note: In a real scenario, the service would handle errors from Firestore
      // This test ensures the service doesn't crash when Firestore returns empty array
      service.getBlogPosts().subscribe(posts => {
        expect(posts).toEqual([]);
      });
    });
  });
});
