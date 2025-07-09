import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { Category } from '../models/category.model';

/**
 * Service for managing categories with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  /**
   * Initializes the category service with required dependencies
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
   * Retrieves all categories from Firestore with loading indicator
   * @returns {Observable<Category[]>} Observable of categories array
   */
  getCategories(): Observable<Category[]> {
    this._loadingService.showWithMessage(this._translateService.instant('ACTIVITIES.LOADING'));
    
    return this._firestoreService.getCategories().pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }
}
