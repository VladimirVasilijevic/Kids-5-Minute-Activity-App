import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';
import firebase from 'firebase/compat/app';

describe('AuthService', () => {
  let service: AuthService;
  let afAuthSpy: jasmine.SpyObj<AngularFireAuth>;

  beforeEach(() => {
    afAuthSpy = jasmine.createSpyObj('AngularFireAuth', [
      'createUserWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'signOut',
      'signInWithPopup',
    ], {
      authState: of(null)
    });

    // Mock firebase.auth object
    firebase.auth = {
      GoogleAuthProvider: function() { return { providerId: 'google.com' }; },
      FacebookAuthProvider: function() { return { providerId: 'facebook.com' }; }
    } as any;



    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AngularFireAuth, useValue: afAuthSpy },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose user$ observable', (done) => {
    service.user$.subscribe(user => {
      expect(user).toBeNull();
      done();
    });
  });

  it('should call createUserWithEmailAndPassword and updateProfile on signUp', async () => {
    const updateProfileSpy = jasmine.createSpy('updateProfile');
    const user = { updateProfile: updateProfileSpy } as any;
    afAuthSpy.createUserWithEmailAndPassword.and.returnValue(Promise.resolve({ user, credential: null }));
    const result = await service.signUp('test@test.com', '123456', 'Test');
    expect(afAuthSpy.createUserWithEmailAndPassword).toHaveBeenCalledWith('test@test.com', '123456');
    expect(updateProfileSpy).toHaveBeenCalledWith({ displayName: 'Test' });
    expect(result).toBe(user);
  });

  it('should call signInWithEmailAndPassword on signIn', async () => {
    const user = { uid: '1' } as any;
    afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.resolve({ user, credential: null }));
    const result = await service.signIn('test@test.com', '123456');
    expect(afAuthSpy.signInWithEmailAndPassword).toHaveBeenCalledWith('test@test.com', '123456');
    expect(result).toBe(user);
  });

  it('should call signOut', async () => {
    afAuthSpy.signOut.and.returnValue(Promise.resolve());
    await service.signOut();
    expect(afAuthSpy.signOut).toHaveBeenCalled();
  });

  it('should call signInWithPopup with Google provider', async () => {
    const user = { uid: '1' } as any;
    afAuthSpy.signInWithPopup.and.returnValue(Promise.resolve({ user, credential: null }));
    const result = await service.signInWithProvider('google');
    expect(afAuthSpy.signInWithPopup).toHaveBeenCalled();
    expect(result).toBe(user);
  });

  it('should call signInWithPopup with Facebook provider', async () => {
    const user = { uid: '1' } as any;
    afAuthSpy.signInWithPopup.and.returnValue(Promise.resolve({ user, credential: null }));
    const result = await service.signInWithProvider('facebook');
    expect(afAuthSpy.signInWithPopup).toHaveBeenCalled();
    expect(result).toBe(user);
  });

  it('should throw error for unsupported provider', async () => {
    try {
      await service.signInWithProvider('twitter');
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Unsupported provider');
    }
  });
}); 