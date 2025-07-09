import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockFirestoreService } from '../../test-utils/mock-firestore-service';
import { mockCategories } from '../../test-utils/mock-categories';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceSpy.instant.and.returnValue('Loading activities...');

    TestBed.configureTestingModule({
      providers: [
        CategoryService, 
        { provide: FirestoreService, useValue: mockFirestoreService },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ],
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
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading activities...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
    });
    expect(mockFirestoreService.getCategories).toHaveBeenCalled();
  });
});
