import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { AboutContent } from '../models/about-content.model';

/**
 * Service for managing about page content with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class AboutService {
  /**
   * Initializes the about service with required dependencies
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
   * Retrieves about content from Firestore with loading indicator
   * @returns {Observable<AboutContent>} Observable of about content
   */
  getAboutContent(): Observable<AboutContent> {
    this._loadingService.showWithMessage(this._translateService.instant('ABOUT.LOADING'));
    
    return this._firestoreService.getAboutContent().pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Updates about content in Firestore with loading indicator
   * @param content - The about content to update
   * @returns {Promise<void>} Promise that resolves when update is complete
   */
  updateAboutContent(content: AboutContent): Promise<void> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SAVING'));
    
    return this._firestoreService.updateAboutContent(content)
      .then(() => {
        this._loadingService.hide();
      })
      .catch((error) => {
        this._loadingService.hide();
        throw error;
      });
  }
} 