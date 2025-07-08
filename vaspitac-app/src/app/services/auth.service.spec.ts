import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let afAuthSpy: jasmine.SpyObj<AngularFireAuth>;

  beforeEach(() => {
    afAuthSpy = jasmine.createSpyObj('AngularFireAuth', [
      'createUserWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'signOut',
      'sendPasswordResetEmail',
    ], {
      authState: of(null)
    });

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

  it('should handle auth errors and provide user-friendly messages', async () => {
    const networkError = { code: 'auth/network-request-failed', message: 'Network error' };
    afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(networkError));
    
    try {
      await service.signIn('test@test.com', '123456');
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Network error');
      expect((error as Error).name).toBe('auth/network-request-failed');
    }
  });

  describe('Password Reset', () => {
    it('should send password reset email successfully', async () => {
      afAuthSpy.sendPasswordResetEmail.and.returnValue(Promise.resolve());
      
      await service.sendPasswordResetEmail('test@test.com');
      
      expect(afAuthSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
    });

    it('should handle password reset email error', async () => {
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      afAuthSpy.sendPasswordResetEmail.and.returnValue(Promise.reject(error));
      
      try {
        await service.sendPasswordResetEmail('nonexistent@test.com');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('No account found with this email address.');
        expect((error as Error).name).toBe('auth/user-not-found');
      }
    });

    it('should handle password reset email network error', async () => {
      const error = { code: 'auth/network-request-failed', message: 'Network error' };
      afAuthSpy.sendPasswordResetEmail.and.returnValue(Promise.reject(error));
      
      try {
        await service.sendPasswordResetEmail('test@test.com');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error. Please check your internet connection and try again.');
      }
    });
  });

  describe('User Management', () => {
    it('should get current user', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' } as any;
      Object.defineProperty(afAuthSpy, 'currentUser', { value: mockUser });
      
      const result = await service.getCurrentUser();
      
      expect(result).toBe(mockUser);
    });

    it('should return null when no current user', async () => {
      Object.defineProperty(afAuthSpy, 'currentUser', { value: null });
      
      const result = await service.getCurrentUser();
      
      expect(result).toBeNull();
    });

    it('should check if user is logged in - true case', async () => {
      const mockUser = { uid: '123' } as any;
      Object.defineProperty(afAuthSpy, 'currentUser', { value: mockUser });
      
      const result = await service.isLoggedIn();
      
      expect(result).toBe(true);
    });

    it('should check if user is logged in - false case', async () => {
      Object.defineProperty(afAuthSpy, 'currentUser', { value: null });
      
      const result = await service.isLoggedIn();
      
      expect(result).toBe(false);
    });

    it('should handle error when checking login status', async () => {
      Object.defineProperty(afAuthSpy, 'currentUser', { value: null });
      spyOn(console, 'error');
      
      const result = await service.isLoggedIn();
      
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle user-not-found error', async () => {
      const error = { code: 'auth/user-not-found', message: 'User not found' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('No account found with this email address.');
      }
    });

    it('should handle wrong-password error', async () => {
      const error = { code: 'auth/wrong-password', message: 'Wrong password' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Incorrect password. Please try again.');
      }
    });

    it('should handle email-already-in-use error', async () => {
      const error = { code: 'auth/email-already-in-use', message: 'Email already in use' };
      afAuthSpy.createUserWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signUp('test@test.com', '123456', 'Test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('An account with this email already exists.');
      }
    });

    it('should handle weak-password error', async () => {
      const error = { code: 'auth/weak-password', message: 'Weak password' };
      afAuthSpy.createUserWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signUp('test@test.com', '123', 'Test');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Password is too weak. Please choose a stronger password.');
      }
    });

    it('should handle invalid-email error', async () => {
      const error = { code: 'auth/invalid-email', message: 'Invalid email' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('invalid-email', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Invalid email address. Please check your email and try again.');
      }
    });

    it('should handle too-many-requests error', async () => {
      const error = { code: 'auth/too-many-requests', message: 'Too many requests' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Too many failed attempts. Please try again later.');
      }
    });

    it('should handle operation-not-allowed error', async () => {
      const error = { code: 'auth/operation-not-allowed', message: 'Operation not allowed' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('This sign-in method is not enabled. Please contact support.');
      }
    });

    it('should handle unknown error codes', async () => {
      const error = { code: 'auth/unknown-error', message: 'Unknown error' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Unknown error');
        expect((error as Error).name).toBe('auth/unknown-error');
      }
    });

    it('should handle error without code', async () => {
      const error = { message: 'Generic error message' };
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.reject(error));
      
      try {
        await service.signIn('test@test.com', '123456');
        fail('Expected error to be thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Generic error message');
        expect((error as Error).name).toBe('auth/unknown');
      }
    });
  });

  describe('Sign Up Edge Cases', () => {
    it('should handle sign up with null user', async () => {
      afAuthSpy.createUserWithEmailAndPassword.and.returnValue(Promise.resolve({ user: null, credential: null }));
      
      const result = await service.signUp('test@test.com', '123456', 'Test');
      
      expect(result).toBeNull();
    });

    it('should handle sign up with user but no updateProfile method', async () => {
      const user = {} as any;
      afAuthSpy.createUserWithEmailAndPassword.and.returnValue(Promise.resolve({ user, credential: null }));
      
      const result = await service.signUp('test@test.com', '123456', 'Test');
      
      expect(result).toBe(user);
    });
  });

  describe('Sign In Edge Cases', () => {
    it('should handle sign in with null user', async () => {
      afAuthSpy.signInWithEmailAndPassword.and.returnValue(Promise.resolve({ user: null, credential: null }));
      
      const result = await service.signIn('test@test.com', '123456');
      
      expect(result).toBeNull();
    });
  });
}); 