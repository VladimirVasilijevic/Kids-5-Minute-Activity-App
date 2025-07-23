import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

import { ActivityService } from './activity.service';
import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { mockActivities } from '../../test-utils/mock-activities';

describe('ActivityService', () => {
  let service: ActivityService;
  let firestoreService: jasmine.SpyObj<FirestoreService>;
  let _loadingService: jasmine.SpyObj<LoadingService>;
  let _translateService: jasmine.SpyObj<TranslateService>;
  let authService: jasmine.SpyObj<AuthService>;
  let functions: jasmine.SpyObj<AngularFireFunctions>;

  beforeEach((): void => {
    const firestoreSpy = jasmine.createSpyObj('FirestoreService', ['getActivities', 'getActivityById', 'createActivity', 'updateActivity', 'deleteActivity']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const authSpy = jasmine.createSpyObj('AuthService', [], { user$: of(null) });
    const functionsSpy = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);

    TestBed.configureTestingModule({
      providers: [
        ActivityService,
        { provide: FirestoreService, useValue: firestoreSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AngularFireFunctions, useValue: functionsSpy },
      ],
    });

    service = TestBed.inject(ActivityService);
    firestoreService = TestBed.inject(FirestoreService) as jasmine.SpyObj<FirestoreService>;
    _loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    _translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    functions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getActivities', () => {
    it('should call getPublicActivities when user is not authenticated', () => {
      const publicFunctionSpy = jasmine.createSpy('publicFunction').and.returnValue(Promise.resolve({ content: mockActivities }));
      functions.httpsCallable.and.returnValue(publicFunctionSpy);
      service.getActivities().subscribe();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getPublicContent');
      expect(publicFunctionSpy).toHaveBeenCalled();
    });

    it('should call getFilteredActivities when user is authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));
      const filteredFunctionSpy = jasmine.createSpy('filteredFunction').and.returnValue(Promise.resolve({ activities: mockActivities }));
      functions.httpsCallable.and.returnValue(filteredFunctionSpy);
      service.getActivities().subscribe();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getFilteredActivities');
      expect(filteredFunctionSpy).toHaveBeenCalled();
    });

    it('should fall back to public content if filtered activities call fails', () => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));

      const filteredFunctionSpy = jasmine.createSpy('filteredFunction').and.returnValue(throwError(() => new Error('fail')));
      const publicFunctionSpy = jasmine.createSpy('publicFunction').and.returnValue(of(mockActivities));

      functions.httpsCallable.and.callFake((name: string): any => {
        if (name === 'getFilteredActivities') {
          return (): any => filteredFunctionSpy();
        }
        if (name === 'getPublicContent') {
          return (): any => publicFunctionSpy();
        }
        return (): any => of({});
      });

      service.getActivities().subscribe();

      expect(functions.httpsCallable).toHaveBeenCalledWith('getFilteredActivities');
      expect(filteredFunctionSpy).toHaveBeenCalled();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getPublicContent');
      expect(publicFunctionSpy).toHaveBeenCalled();
    });
  });

  it('should get activity by ID', () => {
    firestoreService.getActivityById.and.returnValue(of(mockActivities[0]));
    service.getActivityById('1').subscribe(activity => {
      expect(activity).toEqual(mockActivities[0]);
    });
    expect(firestoreService.getActivityById).toHaveBeenCalledWith('1');
  });

  it('should create an activity', async () => {
    firestoreService.createActivity.and.resolveTo();
    await service.createActivity(mockActivities[0]);
    expect(firestoreService.createActivity).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('should update an activity', async () => {
    firestoreService.updateActivity.and.resolveTo();
    await service.updateActivity(mockActivities[0]);
    expect(firestoreService.updateActivity).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('should delete an activity', async () => {
    firestoreService.deleteActivity.and.resolveTo();
    await service.deleteActivity('1');
    expect(firestoreService.deleteActivity).toHaveBeenCalledWith('1');
  });
});
