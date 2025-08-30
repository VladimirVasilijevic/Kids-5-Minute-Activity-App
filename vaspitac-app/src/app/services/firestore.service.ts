import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, switchMap, map, firstValueFrom, tap } from 'rxjs';

import { Activity } from '../models/activity.model';
import { Category } from '../models/category.model';
import { BlogPost } from '../models/blog-post.model';
import { AboutContent, AboutContentData } from '../models/about-content.model';

import { LanguageService } from './language.service';

/**
 * Service for managing Firestore operations with JSON fallback
 */
@Injectable({ providedIn: 'root' })
export class FirestoreService {
  /**
   * Initializes the Firestore service with required dependencies
   * @param firestore - Angular Firestore service
   * @param http - HTTP client for JSON fallback
   * @param languageService - Service for language management
   */
  constructor(
    private _firestore: AngularFirestore,
    private _http: HttpClient,
    private _languageService: LanguageService
  ) {}

  /**
   * Converts a Firestore Timestamp to an ISO string or returns the original value
   * @param timestamp - Firestore Timestamp, Date, or string
   * @returns ISO string or original value
   */
  private convertTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      // If it's already a string, return it
      if (typeof timestamp === 'string') {
        return timestamp;
      }
      
      // If it's a Date object, convert to ISO string
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      
      // If it's a Firestore Timestamp, convert to Date then to ISO string
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000).toISOString();
      }
      
      // If it's a number (milliseconds), convert to Date then to ISO string
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString();
      }
      
      // Fallback: try to convert to string
      return String(timestamp);
    } catch (error) {
      console.warn('Failed to convert timestamp:', timestamp, error);
      return '';
    }
  }

  /**
   * Get activities from Firestore with JSON fallback
   * @returns {Observable<Activity[]>} Observable of activities array
   */
  getActivities(): Observable<Activity[]> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        // Try Firestore first
        return this._firestore
          .collection<Activity>(`activities_${lang}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              // Fallback to JSON if Firestore fails
              // Fallback to JSON for activities
              return this._http.get<Activity[]>(`assets/activities_${lang}.json`);
            })
          );
      })
    );
  }

  /**
   * Get activity by ID from Firestore with JSON fallback
   * @param id - The activity ID to retrieve
   * @returns {Observable<Activity | undefined>} Observable of activity or undefined
   */
  getActivityById(id: string): Observable<Activity | undefined> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        // Try Firestore first
        return this._firestore
          .doc<Activity>(`activities_${lang}/${id}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              // Fallback to JSON if Firestore fails
              // Fallback to JSON for activity
              return this._http
                .get<Activity[]>(`assets/activities_${lang}.json`)
                .pipe(
                  switchMap((activities) => of(activities.find((activity) => activity.id === id)))
                );
            })
          );
      })
    );
  }

  /**
   * Get categories from Firestore with JSON fallback
   * @returns {Observable<Category[]>} Observable of categories array
   */
  getCategories(): Observable<Category[]> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<Category>(`categories_${lang}`)
          .valueChanges()
          .pipe(
            catchError((_error) => {
              // Fallback to JSON for categories
              return this._http.get<Category[]>(`assets/categories_${lang}.json`).pipe(
                tap((_categories) => {
                  // Loaded categories from JSON
                })
              );
            })
          );
      })
    );
  }

  /**
   * Get blog posts from Firestore with JSON fallback
   * @returns {Observable<BlogPost[]>} Observable of blog posts array
   */
  getBlogPosts(): Observable<BlogPost[]> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<BlogPost>(`blog_${lang}`)
          .valueChanges()
          .pipe(
            map(posts => posts.map(post => ({
              ...post,
              // Convert Firestore Timestamps to ISO strings
              date: this.convertTimestamp(post.date)
            }))),
            catchError((_error: unknown) => {
              // Fallback to JSON for blog
              return this._http.get<BlogPost[]>(`assets/blog-posts_${lang}.json`);
            })
          );
      })
    );
  }



  /**
   * Get about content from Firestore with JSON fallback
   * @returns {Observable<AboutContent>} Observable of about content
   */
  getAboutContent(): Observable<AboutContent> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .doc<AboutContent>(`about_${lang}/content`)
          .valueChanges()
          .pipe(
            map((content) => {
              if (!content) {
                throw new Error('About content not found in Firestore');
              }
              
              // Convert Firestore Timestamps to ISO strings
              return {
                ...content,
                lastUpdated: this.convertTimestamp(content.lastUpdated)
              };
            }),
            catchError(() => {
              // Fallback to JSON for about
              return this._http.get<AboutContentData>(`assets/about_${lang}.json`).pipe(
                map((response: AboutContentData) => response.data)
              );
            })
          );
      })
    );
  }

  /**
   * Update about content in Firestore
   * @param content - The about content to update
   * @returns Promise resolved when the content is updated
   */
  updateAboutContent(content: AboutContent): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .doc<AboutContent>(`about_${lang}/content`)
          .set({
            ...content,
            lastUpdated: new Date().toISOString()
          });
      })
    ));
  }

  /**
   * Get version metadata from Firestore
   * @returns {Observable<{version: string, lastUpdated: Date}>} Observable of version metadata
   */
  getVersion(): Observable<{ version: string; lastUpdated: Date }> {
    return this._firestore
      .doc<{ version: string; lastUpdated: Date }>('metadata/version')
      .valueChanges()
      .pipe(
        map((data) => ({
          version: data?.version ?? '1.0.0',
          lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated) : new Date()
        })),
        catchError(() => {
          // Fallback to default version
          return of<{ version: string; lastUpdated: Date }>({ 
            version: '1.0.0', 
            lastUpdated: new Date() 
          });
        })
      );
  }

  /**
   * Create a new blog post in Firestore
   * @param blogPost - The blog post to create
   * @returns Promise resolved when the blog post is created
   */
  createBlogPost(blogPost: BlogPost): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<BlogPost>(`blog_${lang}`)
          .doc(blogPost.id.toString())
          .set(blogPost);
      })
    ));
  }

  /**
   * Update an existing blog post in Firestore
   * @param blogPost - The blog post to update
   * @returns Promise resolved when the blog post is updated
   */
  updateBlogPost(blogPost: BlogPost): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<BlogPost>(`blog_${lang}`)
          .doc(blogPost.id.toString())
          .update(blogPost);
      })
    ));
  }

  /**
   * Delete a blog post from Firestore
   * @param blogId - The ID of the blog post to delete
   * @returns Promise resolved when the blog post is deleted
   */
  deleteBlogPost(blogId: number): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<BlogPost>(`blog_${lang}`)
          .doc(blogId.toString())
          .delete();
      })
    ));
  }

  /**
   * Create a new activity in Firestore
   * @param activity - The activity to create
   * @returns Promise resolved when the activity is created
   */
  createActivity(activity: Activity): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<Activity>(`activities_${lang}`)
          .doc(activity.id)
          .set(activity);
      })
    ));
  }

  /**
   * Update an existing activity in Firestore
   * @param activity - The activity to update
   * @returns Promise resolved when the activity is updated
   */
  updateActivity(activity: Activity): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<Activity>(`activities_${lang}`)
          .doc(activity.id)
          .update(activity);
      })
    ));
  }

  /**
   * Delete an activity from Firestore
   * @param activityId - The ID of the activity to delete
   * @returns Promise resolved when the activity is deleted
   */
  deleteActivity(activityId: string): Promise<void> {
    return firstValueFrom(this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<Activity>(`activities_${lang}`)
          .doc(activityId)
          .delete();
      })
    ));
  }
}
