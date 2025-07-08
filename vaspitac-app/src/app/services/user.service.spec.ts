import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';

describe('UserService', () => {
  let service: UserService;
  let afsSpy: jasmine.SpyObj<AngularFirestore>;
  let docSpy: any;

  beforeEach(() => {
    docSpy = jasmine.createSpyObj('doc', ['valueChanges', 'set']);
    afsSpy = jasmine.createSpyObj('AngularFirestore', ['doc']);
    afsSpy.doc.and.returnValue(docSpy);

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: AngularFirestore, useValue: afsSpy },
      ],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user profile as observable', (done) => {
    const profile: UserProfile = {
      uid: '1',
      displayName: 'Test',
      email: 'test@test.com',
      avatarUrl: '',
      createdAt: '2023-01-01',
    };
    docSpy.valueChanges.and.returnValue(of(profile));
    service.getUserProfile('1').subscribe(result => {
      expect(result).toEqual(profile);
      done();
    });
    expect(afsSpy.doc).toHaveBeenCalledWith('users/1' as any);
  });

  it('should return null if user profile does not exist', (done) => {
    docSpy.valueChanges.and.returnValue(of(undefined));
    service.getUserProfile('2').subscribe(result => {
      expect(result).toBeNull();
      done();
    });
    expect(afsSpy.doc).toHaveBeenCalledWith('users/2' as any);
  });

  it('should set user profile in Firestore', async () => {
    const profile: UserProfile = {
      uid: '1',
      displayName: 'Test',
      email: 'test@test.com',
      avatarUrl: '',
      createdAt: '2023-01-01',
    };
    docSpy.set.and.returnValue(Promise.resolve());
    await service.setUserProfile(profile);
    expect(afsSpy.doc).toHaveBeenCalledWith('users/1' as any);
    expect(docSpy.set).toHaveBeenCalledWith(profile, { merge: true });
  });
}); 