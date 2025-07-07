import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockFirestoreService } from '../../test-utils/mock-firestore-service';
import { mockCategories } from '../../test-utils/mock-categories';

import { FirestoreService } from './firestore.service';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryService, { provide: FirestoreService, useValue: mockFirestoreService }],
    });
    service = TestBed.inject(CategoryService);
    mockFirestoreService.getCategories.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get categories from FirestoreService', () => {
    mockFirestoreService.getCategories.and.returnValue(of(mockCategories as Category[]));
    service.getCategories().subscribe((categories) => {
      expect(categories).toEqual(mockCategories as Category[]);
    });
    expect(mockFirestoreService.getCategories).toHaveBeenCalled();
  });
});
