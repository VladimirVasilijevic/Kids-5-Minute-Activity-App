import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Activity } from '../models/activity.model';

import { FirestoreService } from './firestore.service';

/**
 *
 */
@Injectable({ providedIn: 'root' })
export class ActivityService {
  /**
   *
   * @param firestoreService
   */
  constructor(private _firestoreService: FirestoreService) {}

  /**
   *
   */
  getActivities(): Observable<Activity[]> {
    return this._firestoreService.getActivities();
  }

  /**
   *
   * @param id
   */
  getActivityById(id: string): Observable<Activity | undefined> {
    return this._firestoreService.getActivityById(id);
  }
}
