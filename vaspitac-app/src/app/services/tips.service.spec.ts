import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockFirestoreService } from '../../test-utils/mock-firestore-service';
import { mockTips } from '../../test-utils/mock-tips';

import { FirestoreService } from './firestore.service';
import { TipsService } from './tips.service';

describe('TipsService', () => {
  let service: TipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipsService, { provide: FirestoreService, useValue: mockFirestoreService }],
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
    });
    expect(mockFirestoreService.getTips).toHaveBeenCalled();
  });
});
