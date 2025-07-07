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

  it('should get blog posts from FirestoreService', () => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
    service.getBlogPosts().subscribe((posts) => {
      expect(posts).toEqual(mockBlogPosts);
    });
    expect(mockFirestoreService.getBlogPosts).toHaveBeenCalled();
  });
});
