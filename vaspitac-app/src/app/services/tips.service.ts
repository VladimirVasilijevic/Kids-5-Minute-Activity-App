import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirestoreService } from './firestore.service';
import { Tip } from '../models/tip.model';

/**
 * Service for managing tips with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class TipsService {
  /**
   * Initializes the tips service with Firestore dependency
   * @param _firestoreService - Firestore service for data access
   */
  constructor(private _firestoreService: FirestoreService) {}

  /**
   * Retrieves all tips from Firestore
   * @returns {Observable<Tip[]>} Observable of tips array
   */
  getTips(): Observable<Tip[]> {
    return this._firestoreService.getTips();
  }
}
