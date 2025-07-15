import { Injectable } from '@angular/core';
import { Observable, map, tap, from, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AuthService } from './auth.service';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { BlogPost } from '../models/blog-post.model';
import { ContentVisibility } from '../models/content-visibility.model';

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
   * @param _functions - Firebase Cloud Functions service
   * @param _authService - Service for authentication
   */
  constructor(
    private _firestoreService: FirestoreService,
    private _loadingService: LoadingService,
    private _translateService: TranslateService,
    private _functions: AngularFireFunctions,
    private _authService: AuthService
  ) {}

  /**
   * Retrieves filtered blog posts using Cloud Function for secure server-side filtering
   * Falls back to public content if user is not authenticated
   * @param language - Language code (default: 'en')
   * @returns {Observable<BlogPost[]>} Observable of filtered blog posts array
   */
  getBlogPosts(language: string = 'en'): Observable<BlogPost[]> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.LOADING'));
    
    // Check if user is authenticated
    return this._authService.user$.pipe(
      switchMap(user => {
        if (user) {
          // User is authenticated - use filtered function
          return from(this._functions.httpsCallable('getFilteredBlogPosts')({ language })).pipe(
            map((result: any) => {
              const blogPosts = result.blogPosts || [];
              return blogPosts.map((blogPost: any) => ({
                ...blogPost,
                visibility: blogPost.visibility || ContentVisibility.PUBLIC,
                isPremium: blogPost.isPremium || false
              }));
            }),
            catchError((error) => {
              console.warn('Filtered blog posts failed, falling back to public content:', error);
              return this.getPublicBlogPosts(language);
            })
          );
        } else {
          // User is not authenticated - use public content function
          return this.getPublicBlogPosts(language);
        }
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Retrieves public blog posts for non-authenticated users
   * @param language - Language code (default: 'en')
   * @returns {Observable<BlogPost[]>} Observable of public blog posts array
   */
  getPublicBlogPosts(language: string = 'en'): Observable<BlogPost[]> {
    this._loadingService.showWithMessage(this._translateService.instant('BLOG.LOADING'));
    
    return from(this._functions.httpsCallable('getPublicContent')({ 
      contentType: 'blog', 
      language 
    })).pipe(
      map((result: any) => {
        const blogPosts = result.content || [];
        return blogPosts.map((blogPost: any) => ({
          ...blogPost,
          visibility: blogPost.visibility || ContentVisibility.PUBLIC,
          isPremium: blogPost.isPremium || false
        }));
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Retrieves a specific blog post by its ID with loading indicator and default visibility/premium fields
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
        return {
          ...post,
          visibility: post.visibility || ContentVisibility.PUBLIC,
          isPremium: post.isPremium || false
        };
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
