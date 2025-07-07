import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, switchMap, map } from 'rxjs';

import { Activity } from '../models/activity.model';
import { Category } from '../models/category.model';
import { BlogPost } from '../models/blog-post.model';
import { Tip } from '../models/tip.model';

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
              console.log(`Falling back to JSON for activities_${lang}`);
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
              console.log(`Falling back to JSON for activity ${id}`);
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
            catchError(() => {
              console.log(`Falling back to JSON for categories_${lang}`);
              return this._http.get<Category[]>(`assets/categories_${lang}.json`);
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
            catchError((error: unknown) => {
              console.log(`Falling back to JSON for blog_${lang}`, error);
              return this._http.get<BlogPost[]>(`assets/blog-posts_${lang}.json`);
            })
          );
      })
    );
  }

  /**
   * Get tips from Firestore with JSON fallback
   * @returns {Observable<Tip[]>} Observable of tips array
   */
  getTips(): Observable<Tip[]> {
    return this._languageService.getLanguage().pipe(
      switchMap((lang) => {
        return this._firestore
          .collection<Tip>(`tips_${lang}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              console.log(`Falling back to JSON for tips_${lang}`);
              return this._http.get<Tip[]>(`assets/tips_${lang}.json`);
            })
          );
      })
    );
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
        map((data) => data || { version: '1.0.0', lastUpdated: new Date() }),
        catchError(() => {
          console.log('Falling back to default version');
          return of<{ version: string; lastUpdated: Date }>({ 
            version: '1.0.0', 
            lastUpdated: new Date() 
          });
        })
      );
  }
}
