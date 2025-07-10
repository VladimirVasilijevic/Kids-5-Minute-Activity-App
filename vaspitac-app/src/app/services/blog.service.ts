import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { BlogPost } from '../models/blog-post.model';

/**
 * Service for managing blog posts with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  /**
   * Initializes the blog service with required dependencies
   * @param _firestoreService - Firestore service for data access
   * @param _loadingService - Service for managing loading state
   * @param _translateService - Service for internationalization
   */
  constructor(
    private _firestoreService: FirestoreService,
    private _loadingService: LoadingService,
    private _translateService: TranslateService
  ) {}

  /**
   * Retrieves all blog posts from Firestore with loading indicator
   * @returns {Observable<BlogPost[]>} Observable of blog posts array
   */
  getBlogPosts(): Observable<BlogPost[]> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.LOADING'));
    
    return this._firestoreService.getBlogPosts().pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Retrieves a specific blog post by its ID with loading indicator
   * @param id - The ID of the blog post to retrieve
   * @returns {Observable<BlogPost>} Observable of the blog post
   */
  getBlogPostById(id: number): Observable<BlogPost> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.LOADING_SINGLE'));
    
    return this._firestoreService.getBlogPosts().pipe(
      map(posts => {
        const post = posts.find(p => p.id === id);
        if (!post) {
          throw new Error(`Blog post with ID ${id} not found`);
        }
        return post;
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Creates a new blog post with loading indicator
   * @param blogPost - The blog post to create
   * @returns Promise resolved when the blog post is created
   */
  createBlogPost(blogPost: BlogPost): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.CREATING'));
    
    return this._firestoreService.createBlogPost(blogPost).then(() => {
      this._loadingService.hide();
    }).catch((error) => {
      this._loadingService.hide();
      throw error;
    });
  }

  /**
   * Updates an existing blog post with loading indicator
   * @param blogPost - The blog post to update
   * @returns Promise resolved when the blog post is updated
   */
  updateBlogPost(blogPost: BlogPost): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.UPDATING'));
    
    return this._firestoreService.updateBlogPost(blogPost).then(() => {
      this._loadingService.hide();
    }).catch((error) => {
      this._loadingService.hide();
      throw error;
    });
  }

  /**
   * Deletes a blog post with loading indicator
   * @param blogId - The ID of the blog post to delete
   * @returns Promise resolved when the blog post is deleted
   */
  deleteBlogPost(blogId: number): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.DELETING'));
    
    return this._firestoreService.deleteBlogPost(blogId).then(() => {
      this._loadingService.hide();
    }).catch((error) => {
      this._loadingService.hide();
      throw error;
    });
  }
}
