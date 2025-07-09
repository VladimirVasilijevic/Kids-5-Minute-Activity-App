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
}
