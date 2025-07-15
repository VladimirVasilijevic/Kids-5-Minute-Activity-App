import { Injectable } from '@angular/core';
import { Observable, map, from, of, switchMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AuthService } from './auth.service';

import { Activity } from '../models/activity.model';
import { ContentVisibility } from '../models/content-visibility.model';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';

/**
 *
 */
@Injectable({ providedIn: 'root' })
export class ActivityService {
  /**
   * Constructor for ActivityService
   * @param firestoreService - Service for Firestore operations
   * @param loadingService - Service for managing loading state
   * @param translateService - Service for internationalization
   * @param functions - Firebase Cloud Functions service
   * @param authService - Service for authentication
   */
  constructor(
    private _firestoreService: FirestoreService,
    private _loadingService: LoadingService,
    private _translateService: TranslateService,
    private _functions: AngularFireFunctions,
    private _authService: AuthService
  ) {}

  /**
   * Get filtered activities using Cloud Function for secure server-side filtering
   * Falls back to public content if user is not authenticated
   * @param language - Language code (default: 'en')
   * @returns Observable of filtered activities array
   */
  getActivities(language: string = 'en'): Observable<Activity[]> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING'));
    
    // Check if user is authenticated
    return this._authService.user$.pipe(
      switchMap(user => {
        if (user) {
          // User is authenticated - use filtered function
          return from(this._functions.httpsCallable('getFilteredActivities')({ language })).pipe(
            map((result: any) => {
              const activities = result.activities || [];
              return activities.map((activity: any) => ({
                ...activity,
                visibility: activity.visibility || ContentVisibility.PUBLIC,
                isPremium: activity.isPremium || false
              }));
            }),
            catchError((error) => {
              console.warn('Filtered activities failed, falling back to public content:', error);
              return this.getPublicActivities(language);
            })
          );
        } else {
          // User is not authenticated - use public content function
          return this.getPublicActivities(language);
        }
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Get public activities for non-authenticated users
   * @param language - Language code (default: 'en')
   * @returns Observable of public activities array
   */
  getPublicActivities(language: string = 'en'): Observable<Activity[]> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING'));
    
    return from(this._functions.httpsCallable('getPublicContent')({ 
      contentType: 'activities', 
      language 
    })).pipe(
      map((result: any) => {
        const activities = result.content || [];
        return activities.map((activity: any) => ({
          ...activity,
          visibility: activity.visibility || ContentVisibility.PUBLIC,
          isPremium: activity.isPremium || false
        }));
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Get activity by ID with loading indicator and default visibility/premium fields
   * @param id - Activity ID
   * @returns Observable of activity or undefined
   */
  getActivityById(id: string): Observable<Activity | undefined> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING_SINGLE'));
    
    return this._firestoreService.getActivityById(id).pipe(
      map(activity => activity ? {
        ...activity,
        visibility: activity.visibility || ContentVisibility.PUBLIC,
        isPremium: activity.isPremium || false
      } : undefined),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Creates a new activity with loading indicator
   * @param activity - The activity to create
   * @returns Promise resolved when the activity is created
   */
  createActivity(activity: Activity): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.CREATING'));
    
    return this._firestoreService.createActivity(activity).then(() => {
      this._loadingService.hide();
    }).catch((error: Error) => {
      this._loadingService.hide();
      throw error;
    });
  }

  /**
   * Updates an existing activity with loading indicator
   * @param activity - The activity to update
   * @returns Promise resolved when the activity is updated
   */
  updateActivity(activity: Activity): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.UPDATING'));
    
    return this._firestoreService.updateActivity(activity).then(() => {
      this._loadingService.hide();
    }).catch((error: Error) => {
      this._loadingService.hide();
      throw error;
    });
  }

  /**
   * Deletes an activity with loading indicator
   * @param activityId - The ID of the activity to delete
   * @returns Promise resolved when the activity is deleted
   */
  deleteActivity(activityId: string): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.DELETING'));
    
    return this._firestoreService.deleteActivity(activityId).then(() => {
      this._loadingService.hide();
    }).catch((error: Error) => {
      this._loadingService.hide();
      throw error;
    });
  }
}
