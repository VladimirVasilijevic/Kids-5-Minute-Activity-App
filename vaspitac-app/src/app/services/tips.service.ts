import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirestoreService } from './firestore.service';

/**
 *
 */
@Injectable({ providedIn: 'root' })
export class TipsService {
  /**
   *
   * @param firestoreService
   */
  constructor(private firestoreService: FirestoreService) {}

  /**
   *
   */
  getTips(): Observable<any[]> {
    return this.firestoreService.getTips();
  }
}
