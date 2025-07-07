import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FirestoreService } from './firestore.service';
import { Category } from '../models/category.model';

/**
 * Service for managing categories with Firestore integration
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  /**
   * Initializes the category service with Firestore dependency
   * @param _firestoreService - Firestore service for data access
   */
  constructor(private _firestoreService: FirestoreService) {}

  /**
   * Retrieves all categories from Firestore
   * @returns {Observable<Category[]>} Observable of categories array
   */
  getCategories(): Observable<Category[]> {
    return this._firestoreService.getCategories();
  }
}
