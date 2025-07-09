import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockActivities } from '../../test-utils/mock-activities';
import { mockFirestoreService } from '../../test-utils/mock-firestore-service';

import { ActivityService } from './activity.service';
import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';

describe('ActivityService', () => {
  let service: ActivityService;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    
    // Mock different translation keys
    translateServiceSpy.instant.and.callFake((key: string) => {
      if (key === 'ACTIVITIES.LOADING') {
        return 'Loading activities...';
      } else if (key === 'ACTIVITIES.LOADING_SINGLE') {
        return 'Loading activity...';
      }
      return key;
    });

    TestBed.configureTestingModule({
      providers: [
        ActivityService, 
        { provide: FirestoreService, useValue: mockFirestoreService },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ],
    });
    service = TestBed.inject(ActivityService);
    mockFirestoreService.getActivities.calls.reset();
    mockFirestoreService.getActivityById.calls.reset();
  });

  it('should load activities from FirestoreService', (done) => {
    mockFirestoreService.getActivities.and.returnValue(of(mockActivities));
    service.getActivities().subscribe((acts) => {
      expect(acts.length).toBe(mockActivities.length);
      expect(acts[0].id).toBe(mockActivities[0].id);
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading activities...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
      done();
    });
  });

  it('should get activity by ID', (done) => {
    const targetId = mockActivities[1].id;
    mockFirestoreService.getActivityById.and.returnValue(of(mockActivities[1]));
    service.getActivityById(targetId).subscribe((act) => {
      expect(act).toBeTruthy();
      expect(act?.id).toBe(targetId);
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading activity...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
      done();
    });
  });

  it('should return undefined for missing ID', (done) => {
    mockFirestoreService.getActivityById.and.returnValue(of(undefined));
    service.getActivityById('999').subscribe((act) => {
      expect(act).toBeUndefined();
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading activity...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
      done();
    });
  });
});
