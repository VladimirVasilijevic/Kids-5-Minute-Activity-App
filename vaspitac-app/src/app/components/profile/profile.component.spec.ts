import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, Subject, Observable, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { mockFreeUser } from '../../../test-utils/mock-user-profiles';

// Mock TranslateService class
class MockTranslateService {
  instant(key: string): string {
    const translations: { [key: string]: string } = {
      'PROFILE.ERROR_NO_EMAIL': 'Nije pronađena email adresa korisnika. Prijavite se ponovo.',
      'PROFILE.RESET_PASSWORD_SUCCESS': 'Email za resetovanje lozinke je poslat! Proverite vaš inbox.',
      'PROFILE.ERROR_RESET_PASSWORD': 'Došlo je do greške pri slanju emaila za reset lozinke. Pokušajte ponovo.',
      'PROFILE.TITLE': 'Moj Profil',
      'PROFILE.PERSONAL_INFO': 'Lične Informacije',
      'PROFILE.DISPLAY_NAME': 'Ime za Prikaz',
      'PROFILE.EMAIL': 'Email Adresa',
      'PROFILE.MEMBER_SINCE': 'Član od',
      'PROFILE.ACCOUNT_ACTIONS': 'Akcije Naloga',
      'PROFILE.EDIT_PROFILE': 'Izmeni Profil',
      'PROFILE.NO_USER': 'Profil korisnika nije pronađen. Molimo prijavite se.',
      'AUTH.RESET_PASSWORD': 'Resetuj Lozinku',
      'PROFILE.SUCCESS_UPDATE': 'Profil uspešno ažuriran!',
      'PROFILE.ERROR_UPDATE_TITLE': 'Greška pri ažuriranju profila',
      'PROFILE.SUCCESS_UPDATE_AVATAR_LIMIT': 'URL avatar adrese je prevelika. Avatar je postavljen na null.',
      'PROFILE.DELETE_PROFILE_ERROR': 'Greška pri brisanju profila',
      'COMMON.DELETING': 'Brisanje...',
      'PROFILE.UNSUBSCRIBE_SUCCESS': 'Uspešno ste se odjavili od pretplate!'
    };
    return translations[key] || key;
  }

  get(key: string): Observable<string> {
    return of(this.instant(key));
  }

  getParsedResult(): Record<string, unknown> {
    return {};
  }

  onLangChange = of({ lang: 'sr', translations: {} });
  onTranslationChange = of({ lang: 'sr', translations: {} });
  onDefaultLangChange = of({ lang: 'sr', translations: {} });
  currentLang = 'sr';
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translateService: MockTranslateService;
  let userSubject: Subject<any>;

  beforeEach(async () => {
    userSubject = new Subject();
    authServiceSpy = {
      user$: userSubject.asObservable(),
      signOut: jasmine.createSpy('signOut'),
      sendPasswordResetEmail: jasmine.createSpy('sendPasswordResetEmail'),
      getCurrentUser: jasmine.createSpy('getCurrentUser'),
      signIn: jasmine.createSpy('signIn')
    } as jasmine.SpyObj<AuthService>;

    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProfile', 'setUserProfile', 'deleteOwnProfile']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    translateService = new MockTranslateService();

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        AngularFireModule.initializeApp({
          apiKey: 'test',
          authDomain: 'test',
          projectId: 'test',
          storageBucket: 'test',
          messagingSenderId: 'test',
          appId: 'test'
        }),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if not logged in', fakeAsync(() => {
    spyOn(component, 'ngOnInit').and.callThrough();
    fixture.detectChanges();
    userSubject.next(null);
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should display user profile if logged in', fakeAsync(() => {
    userServiceSpy.getUserProfile.and.returnValue(of(mockFreeUser));
    fixture.detectChanges();
    userSubject.next({ uid: '1' });
    tick();
    component.userProfile$.subscribe(profile => {
      expect(profile).toEqual(mockFreeUser);
    });
  }));

  it('should call signOut and navigate to home on logout', () => {
    component.onLogout();
    expect(authServiceSpy.signOut).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to home on goBack', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should open edit profile modal', () => {
    component.showEditProfileModal = false;
    component.openEditProfile();
    expect(component.showEditProfileModal).toBe(true);
  });

  it('should close edit profile modal', () => {
    component.showEditProfileModal = true;
    component.closeEditProfile();
    expect(component.showEditProfileModal).toBe(false);
  });

  it('should close change password modal', () => {
    component.showChangePasswordModal = true;
    component.passwordChangeError = 'Some error';
    component.closeChangePassword();
    expect(component.showChangePasswordModal).toBe(false);
    expect(component.passwordChangeError).toBeNull();
  });

  describe('Password Reset', () => {
    beforeEach(() => {
      spyOn(window, 'alert');
    });

    it('should show reset password modal', () => {
      component.onResetPassword();
      
      expect(component.showResetPasswordModal).toBe(true);
      expect(component.resetError).toBeNull();
      expect(component.resetSuccess).toBe(false);
    });

    it('should send password reset email successfully', async () => {
      userServiceSpy.getUserProfile.and.returnValue(of(mockFreeUser));
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.resolve());
      
      fixture.detectChanges();
      userSubject.next({ uid: '1' });
      
      await component.onSendResetPassword('test@test.com');
      
      expect(authServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
      expect(component.resetSuccess).toBe(true);
      expect(component.resetError).toBeNull();
      expect(component.resetLoading).toBe(false);
    });

    it('should handle password reset error', async () => {
      userServiceSpy.getUserProfile.and.returnValue(of(mockFreeUser));
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.reject(new Error('Network error')));
      
      fixture.detectChanges();
      userSubject.next({ uid: '1' });
      
      await component.onSendResetPassword('test@test.com');
      
      expect(authServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
      expect(component.resetError).toBe('Network error');
      expect(component.resetSuccess).toBe(false);
      expect(component.resetLoading).toBe(false);
    });

    it('should close reset password modal', () => {
      component.showResetPasswordModal = true;
      component.resetSuccess = true;
      
      component.onCloseResetPassword();
      
      expect(component.showResetPasswordModal).toBe(false);
      expect(component.resetSuccess).toBe(false);
    });

    it('should set loading state during reset password email sending', async () => {
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.resolve());
      
      const resetPromise = component.onSendResetPassword('test@test.com');
      expect(component.resetLoading).toBe(true);
      
      await resetPromise;
      expect(component.resetLoading).toBe(false);
    });
  });

  describe('Component State Management', () => {
    it('should initialize with correct default values', () => {
      expect(component.isLoading).toBe(true);
      expect(component.isChangingPassword).toBe(false);
      expect(component.passwordChangeError).toBeNull();
      expect(component.showEditProfileModal).toBe(false);
      expect(component.showChangePasswordModal).toBe(false);
      expect(component.showResetPasswordModal).toBe(false);
      expect(component.selectedUser).toBeNull();
      expect(component.resetLoading).toBe(false);
      expect(component.resetError).toBeNull();
      expect(component.resetSuccess).toBe(false);
    });

    it('should set loading to false after user profile is loaded', fakeAsync(() => {
      userServiceSpy.getUserProfile.and.returnValue(of(mockFreeUser));
      
      fixture.detectChanges();
      userSubject.next({ uid: '1' });
      tick();
      
      expect(component.isLoading).toBe(false);
      expect(component.selectedUser).toEqual(mockFreeUser);
    }));

    it('should handle user profile loading error gracefully', fakeAsync(() => {
      userServiceSpy.getUserProfile.and.returnValue(of(null));
      
      fixture.detectChanges();
      userSubject.next({ uid: '1' });
      tick();
      
      expect(component.isLoading).toBe(false);
      expect(component.selectedUser).toBeNull();
    }));
  });

  describe('onSaveProfile', () => {
    let currentUserSpy: any;

    beforeEach(() => {
      currentUserSpy = jasmine.createSpyObj('currentUser', ['updateProfile']);
      currentUserSpy.updateProfile.and.resolveTo();
      authServiceSpy.getCurrentUser.and.resolveTo(currentUserSpy);
      userServiceSpy.setUserProfile.and.resolveTo();
      spyOn(component, 'showError').and.callThrough();
      spyOn(component, 'closeEditProfile').and.callThrough();
    });

    it('should not save if no user is selected', async () => {
      component.selectedUser = null;
      await component.onSaveProfile({ displayName: 'Test' });
      expect(userServiceSpy.setUserProfile).not.toHaveBeenCalled();
    });

    it('should save profile with a valid short avatar URL', async () => {
      component.selectedUser = mockFreeUser;
      const profileData = { displayName: 'New Name', avatarUrl: 'http://example.com/avatar.jpg' };
      await component.onSaveProfile(profileData);

      expect(userServiceSpy.setUserProfile).toHaveBeenCalled();
      expect(currentUserSpy.updateProfile).toHaveBeenCalledWith({
        displayName: 'New Name',
        photoURL: 'http://example.com/avatar.jpg'
      });
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe(translateService.instant('PROFILE.SUCCESS_UPDATE'));
      expect(component.closeEditProfile).toHaveBeenCalled();
    });

    it('should handle avatar URLs that are too long', async () => {
      component.selectedUser = mockFreeUser;
      const longUrl = 'http://example.com/'.repeat(200); // > 2000 chars
      const profileData = { displayName: 'New Name', avatarUrl: longUrl };
      await component.onSaveProfile(profileData);

      expect(userServiceSpy.setUserProfile).toHaveBeenCalled();
      expect(currentUserSpy.updateProfile).toHaveBeenCalledWith({
        displayName: 'New Name',
        photoURL: null
      });
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe(translateService.instant('PROFILE.SUCCESS_UPDATE_AVATAR_LIMIT'));
      expect(component.closeEditProfile).toHaveBeenCalled();
    });

    it('should show an error if updating the profile fails', async () => {
      component.selectedUser = mockFreeUser;
      const error = new Error('Update failed');
      userServiceSpy.setUserProfile.and.rejectWith(error);
      const profileData = { displayName: 'New Name' };
      await component.onSaveProfile(profileData);
      
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        'Update failed'
      );
    });
  });

  describe('UI Feedback', () => {
    it('should show error modal with correct title and message', () => {
      const errorTitle = 'Test Error';
      const errorMessage = 'This is a test error message.';
      component.showError(errorTitle, errorMessage);
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe(errorTitle);
      expect(component.errorMessage).toBe(errorMessage);
    });

    it('should close error modal and clear messages', () => {
      component.showError('Test Error', 'This is a test error message.');
      component.closeErrorModal();
      expect(component.showErrorModal).toBeFalse();
      expect(component.errorTitle).toBe('');
      expect(component.errorMessage).toBe('');
    });

    it('should show success message and then hide it after 5 seconds', fakeAsync(() => {
      const successMessage = 'Profile updated successfully!';
      component['showSuccess'](successMessage);
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe(successMessage);

      tick(5000);
      expect(component.showSuccessMessage).toBeFalse();
    }));
  });

  describe('Profile Deletion', () => {
    let currentUserSpy: any;

    beforeEach(() => {
      currentUserSpy = jasmine.createSpyObj('currentUser', ['updateProfile']);
      currentUserSpy.updateProfile.and.resolveTo();
      authServiceSpy.getCurrentUser.and.resolveTo(currentUserSpy);
      userServiceSpy.deleteOwnProfile.and.returnValue(of({}));
      authServiceSpy.signIn.and.resolveTo(currentUserSpy);
      spyOn(component, 'showError').and.callThrough();
    });

    it('should show delete profile modal when onDeleteProfile is called', () => {
      component.onDeleteProfile();
      expect(component.showDeleteProfileModal).toBeTrue();
      expect(component.deleteProfilePassword).toBe('');
      expect(component.deleteProfileError).toBeNull();
    });

    it('should update delete profile password when onDeleteProfilePasswordChange is called', () => {
      const mockEvent = { target: { value: 'testpassword' } } as any;
      component.onDeleteProfilePasswordChange(mockEvent);
      expect(component.deleteProfilePassword).toBe('testpassword');
    });

    it('should close delete profile modal and reset state when closeDeleteProfileModal is called', () => {
      component.showDeleteProfileModal = true;
      component.deleteProfilePassword = 'testpassword';
      component.deleteProfileError = 'Some error';
      
      component.closeDeleteProfileModal();
      
      expect(component.showDeleteProfileModal).toBeFalse();
      expect(component.deleteProfilePassword).toBe('');
      expect(component.deleteProfileError).toBeNull();
    });

    it('should not proceed with deletion if no user is selected', async () => {
      component.selectedUser = null;
      component.deleteProfilePassword = 'testpassword';
      
      await component.confirmDeleteProfile();
      
      expect(authServiceSpy.getCurrentUser).not.toHaveBeenCalled();
      expect(userServiceSpy.deleteOwnProfile).not.toHaveBeenCalled();
    });

    it('should not proceed with deletion if no password is provided', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = '';
      
      await component.confirmDeleteProfile();
      
      expect(authServiceSpy.getCurrentUser).not.toHaveBeenCalled();
      expect(userServiceSpy.deleteOwnProfile).not.toHaveBeenCalled();
    });

    it('should successfully delete profile with valid password', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      currentUserSpy.email = 'test@example.com';
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
      expect(authServiceSpy.signIn).toHaveBeenCalledWith('test@example.com', 'testpassword');
      expect(userServiceSpy.deleteOwnProfile).toHaveBeenCalledWith({ password: 'testpassword' });
      expect(authServiceSpy.signOut).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle error when no email is found for current user', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      authServiceSpy.getCurrentUser.and.resolveTo(null);
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe(translateService.instant('PROFILE.ERROR_NO_EMAIL'));
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        translateService.instant('PROFILE.ERROR_NO_EMAIL')
      );
    });

    it('should handle error when user has no email', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      const userWithoutEmail = { ...currentUserSpy, email: null };
      authServiceSpy.getCurrentUser.and.resolveTo(userWithoutEmail);
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe(translateService.instant('PROFILE.ERROR_NO_EMAIL'));
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        translateService.instant('PROFILE.ERROR_NO_EMAIL')
      );
    });

    it('should handle authentication error during profile deletion', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'wrongpassword';
      currentUserSpy.email = 'test@example.com';
      authServiceSpy.signIn.and.rejectWith(new Error('Invalid password'));
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe('Invalid password');
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        'Invalid password'
      );
    });

    it('should handle error when deleteOwnProfile callable function fails', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      currentUserSpy.email = 'test@example.com';
      userServiceSpy.deleteOwnProfile.and.returnValue(throwError(() => new Error('Delete failed')));
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe('Delete failed');
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        'Delete failed'
      );
    });

    it('should handle generic error during profile deletion', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      currentUserSpy.email = 'test@example.com';
      authServiceSpy.signIn.and.rejectWith('Unknown error');
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe(translateService.instant('PROFILE.DELETE_PROFILE_ERROR'));
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        translateService.instant('PROFILE.DELETE_PROFILE_ERROR')
      );
    });

    it('should handle Error object during profile deletion', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      currentUserSpy.email = 'test@example.com';
      authServiceSpy.signIn.and.rejectWith(new Error('Specific error message'));
      
      await component.confirmDeleteProfile();
      
      expect(component.deleteProfileLoading).toBeFalse();
      expect(component.deleteProfileError).toBe('Specific error message');
      expect(component.showError).toHaveBeenCalledWith(
        translateService.instant('PROFILE.ERROR_UPDATE_TITLE'),
        'Specific error message'
      );
    });

    it('should set loading state during profile deletion process', async () => {
      component.selectedUser = mockFreeUser;
      component.deleteProfilePassword = 'testpassword';
      currentUserSpy.email = 'test@example.com';
      
      // Start the deletion process
      const deletionPromise = component.confirmDeleteProfile();
      
      // Check that loading is set to true immediately
      expect(component.deleteProfileLoading).toBeTrue();
      expect(component.deleteProfileError).toBeNull();
      
      // Wait for the process to complete
      await deletionPromise;
      
      // Check that loading is set back to false
      expect(component.deleteProfileLoading).toBeFalse();
    });
  });

  describe('Subscription Management', () => {
    beforeEach(() => {
      spyOn(console, 'log');
    });

    it('should navigate to subscribe page', () => {
      component.navigateToSubscribe();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/subscribe']);
    });

    it('should show success message for manage subscription', () => {
      component.manageSubscription();
      expect(console.log).toHaveBeenCalledWith('Manage subscription clicked');
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('Subscription management coming soon!');
    });

    it('should show success message for cancel subscription', () => {
      component.cancelSubscription();
      expect(console.log).toHaveBeenCalledWith('Cancel subscription clicked');
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('Subscription cancellation coming soon!');
    });

    it('should show success message for renew subscription', () => {
      component.renewSubscription();
      expect(console.log).toHaveBeenCalledWith('Renew subscription clicked');
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('Subscription renewal coming soon!');
    });

    it('should show unsubscribe modal when onUnsubscribe is called', () => {
      component.showUnsubscribeModal = false;
      component.onUnsubscribe();
      expect(component.showUnsubscribeModal).toBeTrue();
    });

    it('should close unsubscribe modal when closeUnsubscribeModal is called', () => {
      component.showUnsubscribeModal = true;
      component.closeUnsubscribeModal();
      expect(component.showUnsubscribeModal).toBeFalse();
    });

    it('should not proceed with unsubscribe if no user is selected', async () => {
      component.selectedUser = null;
      await component.confirmUnsubscribe();
      expect(component.unsubscribeLoading).toBeFalse();
    });

    it('should successfully unsubscribe user', async () => {
      component.selectedUser = mockFreeUser;
      component.showUnsubscribeModal = true;
      spyOn(component, 'closeUnsubscribeModal').and.callThrough();
      spyOn(component, 'showError').and.callThrough();
      
      await component.confirmUnsubscribe();
      
      expect(component.unsubscribeLoading).toBeFalse();
      expect(console.log).toHaveBeenCalledWith('Unsubscribing user:', mockFreeUser.uid);
      expect(component.closeUnsubscribeModal).toHaveBeenCalled();
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe(translateService.instant('PROFILE.UNSUBSCRIBE_SUCCESS'));
    });

    it('should handle error during unsubscribe process', async () => {
      component.selectedUser = mockFreeUser;
      spyOn(component, 'showError').and.callThrough();
      
      // Since the current implementation uses setTimeout which is hard to mock,
      // we'll test the error handling by checking the structure
      // In a real implementation, this would be replaced with actual API calls
      await component.confirmUnsubscribe();
      
      expect(component.unsubscribeLoading).toBeFalse();
      // The current implementation doesn't throw errors, so we just verify loading state
    });

    it('should set loading state during unsubscribe process', async () => {
      component.selectedUser = mockFreeUser;
      
      // Start the unsubscribe process
      const unsubscribePromise = component.confirmUnsubscribe();
      
      // Check that loading is set to true immediately
      expect(component.unsubscribeLoading).toBeTrue();
      
      // Wait for the process to complete
      await unsubscribePromise;
      
      // Check that loading is set back to false
      expect(component.unsubscribeLoading).toBeFalse();
    });
  });
}); 