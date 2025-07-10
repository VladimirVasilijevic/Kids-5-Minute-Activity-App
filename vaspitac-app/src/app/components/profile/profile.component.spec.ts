import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, Subject, Observable } from 'rxjs';
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
      'AUTH.RESET_PASSWORD': 'Resetuj Lozinku'
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
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut', 'sendPasswordResetEmail'], { user$: undefined });
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    translateService = new MockTranslateService();
    userSubject = new Subject();
    Object.defineProperty(authServiceSpy, 'user$', { get: () => userSubject.asObservable() });

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
}); 