import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { of } from 'rxjs';

import { UserService } from './user.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { mockFreeUser } from '../../test-utils/mock-user-profiles';

describe('UserService', () => {
  let service: UserService;
  let firestore: jasmine.SpyObj<AngularFirestore>;
  let functions: jasmine.SpyObj<AngularFireFunctions>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    const functionsSpy = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AngularFirestore, useValue: firestoreSpy },
        { provide: AngularFireFunctions, useValue: functionsSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(UserService);
    firestore = TestBed.inject(AngularFirestore) as jasmine.SpyObj<AngularFirestore>;
    functions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('User Profile Management', () => {
    it('should get a user profile', (done) => {
      (firestore.doc as jasmine.Spy).and.returnValue({ valueChanges: () => of(mockFreeUser) });
      service.getUserProfile('1').subscribe(profile => {
        expect(profile).toEqual(mockFreeUser);
        done();
      });
      expect(firestore.doc).toHaveBeenCalledWith('users/1' as any);
    });

    it('should set a user profile', async () => {
      const docSpy = firestore.doc as jasmine.Spy;
      const setSpy = jasmine.createSpyObj('doc', ['set']);
      docSpy.and.returnValue(setSpy);
      setSpy.set.and.resolveTo();
      await service.setUserProfile(mockFreeUser);
      expect(firestore.doc).toHaveBeenCalledWith(`users/${mockFreeUser.uid}` as any);
      expect(setSpy.set).toHaveBeenCalledWith(mockFreeUser, { merge: true });
    });
  });

  describe('Firebase Callable Functions', () => {
    let callableSpy: jasmine.Spy;

    beforeEach(() => {
        callableSpy = jasmine.createSpy().and.returnValue(Promise.resolve({}));
        functions.httpsCallable.and.returnValue(callableSpy);
    });

    it('should create a user', () => {
      const userData = { email: 'test@test.com', password: 'password', displayName: 'Test User', role: 'FREE_USER' };
      service.createUser(userData).subscribe();
      expect(functions.httpsCallable).toHaveBeenCalledWith('createUser');
      expect(callableSpy).toHaveBeenCalledWith(userData);
    });

    it('should update a user', () => {
        const userData = { uid: '1', displayName: 'New Name', role: 'SUBSCRIBER' };
        service.updateUser(userData).subscribe();
        expect(functions.httpsCallable).toHaveBeenCalledWith('updateUser');
        expect(callableSpy).toHaveBeenCalledWith(userData);
    });
  
    it('should delete a user', () => {
        const userData = { uid: '1' };
        service.deleteUser(userData).subscribe();
        expect(functions.httpsCallable).toHaveBeenCalledWith('deleteUser');
        expect(callableSpy).toHaveBeenCalledWith(userData);
    });

    it('should reset a user password', () => {
        const userData = { email: 'test@test.com' };
        service.resetUserPassword(userData).subscribe();
        expect(functions.httpsCallable).toHaveBeenCalledWith('resetUserPassword');
        expect(callableSpy).toHaveBeenCalledWith(userData);
    });

    it('should delete own profile', () => {
        const userData = { password: 'password' };
        service.deleteOwnProfile(userData).subscribe();
        expect(functions.httpsCallable).toHaveBeenCalledWith('deleteOwnProfile');
        expect(callableSpy).toHaveBeenCalledWith(userData);
    });
  });
}); 