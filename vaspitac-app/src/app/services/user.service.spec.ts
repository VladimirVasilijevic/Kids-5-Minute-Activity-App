import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { mockFreeUser } from '../../test-utils/mock-user-profiles';

describe('UserService', () => {
  let service: UserService;
  let afsSpy: jasmine.SpyObj<AngularFirestore>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let docSpy: any;

  beforeEach(() => {
    docSpy = jasmine.createSpyObj('doc', ['valueChanges', 'set']);
    afsSpy = jasmine.createSpyObj('AngularFirestore', ['doc']);
    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    
    afsSpy.doc.and.returnValue(docSpy);
    translateServiceSpy.instant.and.returnValue('Loading profile...');

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AngularFirestore, useValue: afsSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user profile as observable', (done) => {
    docSpy.valueChanges.and.returnValue(of(mockFreeUser));
    service.getUserProfile('1').subscribe(result => {
      expect(result).toEqual(mockFreeUser);
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading profile...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
      done();
    });
    expect(afsSpy.doc).toHaveBeenCalledWith('users/1' as any);
  });

  it('should return null if user profile does not exist', (done) => {
    docSpy.valueChanges.and.returnValue(of(undefined));
    service.getUserProfile('2').subscribe(result => {
      expect(result).toBeNull();
      expect(loadingServiceSpy.showWithMessage).toHaveBeenCalledWith('Loading profile...');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
      done();
    });
    expect(afsSpy.doc).toHaveBeenCalledWith('users/2' as any);
  });

  it('should set user profile in Firestore', async () => {
    docSpy.set.and.returnValue(Promise.resolve());
    await service.setUserProfile(mockFreeUser);
    expect(afsSpy.doc).toHaveBeenCalledWith('users/1' as any);
    expect(docSpy.set).toHaveBeenCalledWith(mockFreeUser, { merge: true });
  });
}); 