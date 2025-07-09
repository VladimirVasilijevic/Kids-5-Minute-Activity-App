import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockFirestoreService } from '../../test-utils/mock-firestore-service';
import { mockTips } from '../../test-utils/mock-tips';

import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { TipsService } from './tips.service';

describe('TipsService', () => {
  let service: TipsService;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateServiceSpy.instant.and.returnValue('Loading tips...');

    TestBed.configureTestingModule({
      providers: [
        TipsService, 
        { provide: FirestoreService, useValue: mockFirestoreService },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ],
    });
    service = TestBed.inject(TipsService);
    mockFirestoreService.getTips.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tips from FirestoreService', () => {
    mockFirestoreService.getTips.and.returnValue(of(mockTips));
    service.getTips().subscribe((tips) => {
      expect(tips).toEqual(mockTips);
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading tips...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
    });
    expect(mockFirestoreService.getTips).toHaveBeenCalled();
  });
});
