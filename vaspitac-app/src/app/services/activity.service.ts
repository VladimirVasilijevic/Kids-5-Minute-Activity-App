import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { Activity } from '../models/activity.model';

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
   */
  constructor(
    private _firestoreService: FirestoreService,
    private _loadingService: LoadingService,
    private _translateService: TranslateService
  ) {}

  /**
   * Get all activities with loading indicator
   * @returns Observable of activities array
   */
  getActivities(): Observable<Activity[]> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING'));
    
    return this._firestoreService.getActivities().pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Get activity by ID with loading indicator
   * @param id - Activity ID
   * @returns Observable of activity or undefined
   */
  getActivityById(id: string): Observable<Activity | undefined> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING_SINGLE'));
    
    return this._firestoreService.getActivityById(id).pipe(
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
