import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { Tip } from '../models/tip.model';

/**
 * Service for managing tips with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class TipsService {
  /**
   * Initializes the tips service with required dependencies
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
   * Retrieves all tips from Firestore with loading indicator
   * @returns {Observable<Tip[]>} Observable of tips array
   */
  getTips(): Observable<Tip[]> {
    this._loadingService.showWithMessage(this._translateService.instant('TIPS.LOADING'));
    
    return this._firestoreService.getTips().pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }
}
