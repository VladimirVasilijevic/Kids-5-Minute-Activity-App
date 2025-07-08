import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { FirestoreService } from './firestore.service';
import { BlogPost } from '../models/blog-post.model';

/**
 * Service for managing blog posts with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  /**
   * Initializes the blog service with Firestore dependency
   * @param _firestoreService - Firestore service for data access
   */
  constructor(private _firestoreService: FirestoreService) {}

  /**
   * Retrieves all blog posts from Firestore
   * @returns {Observable<BlogPost[]>} Observable of blog posts array
   */
  getBlogPosts(): Observable<BlogPost[]> {
    return this._firestoreService.getBlogPosts();
  }

  /**
   * Retrieves a specific blog post by its ID
   * @param id - The ID of the blog post to retrieve
   * @returns {Observable<BlogPost>} Observable of the blog post
   */
  getBlogPostById(id: number): Observable<BlogPost> {
    return this._firestoreService.getBlogPosts().pipe(
      map(posts => {
        const post = posts.find(p => p.id === id);
        if (!post) {
          throw new Error(`Blog post with ID ${id} not found`);
        }
        return post;
      })
    );
  }
}
