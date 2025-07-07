import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { mockActivities } from '../../test-utils/mock-activities';
import { mockFirestoreService } from '../../test-utils/mock-firestore-service';

import { ActivityService } from './activity.service';
import { FirestoreService } from './firestore.service';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityService, { provide: FirestoreService, useValue: mockFirestoreService }],
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
      done();
    });
  });

  it('should get activity by ID', (done) => {
    const targetId = mockActivities[1].id;
    mockFirestoreService.getActivityById.and.returnValue(of(mockActivities[1]));
    service.getActivityById(targetId).subscribe((act) => {
      expect(act).toBeTruthy();
      expect(act?.id).toBe(targetId);
      done();
    });
  });

  it('should return undefined for missing ID', (done) => {
    mockFirestoreService.getActivityById.and.returnValue(of(undefined));
    service.getActivityById('999').subscribe((act) => {
      expect(act).toBeUndefined();
      done();
    });
  });
});
