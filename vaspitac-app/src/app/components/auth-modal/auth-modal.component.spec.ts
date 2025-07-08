import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthModalComponent } from './auth-modal.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { ResetPasswordModalComponent } from './reset-password-modal.component';

describe('AuthModalComponent', () => {
  let component: AuthModalComponent;
  let fixture: ComponentFixture<AuthModalComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'signUp', 'sendPasswordResetEmail']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['setUserProfile']);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      declarations: [
        AuthModalComponent,
        ResetPasswordModalComponent,
      ],
      imports: [
        FormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: class MockLoader { getTranslation(): any { return of({}); } } }
        })
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in login mode', () => {
    expect(component.isLogin).toBe(true);
  });

  it('should switch to register mode', () => {
    component.switchMode();
    expect(component.isLogin).toBe(false);
  });

  it('should switch back to login mode', () => {
    component.isLogin = false;
    component.switchMode();
    expect(component.isLogin).toBe(true);
  });

  it('should clear form when switching modes', () => {
    component.email = 'test@test.com';
    component.password = 'password';
    component.name = 'Test User';
    component.error = 'Some error';

    component.switchMode();

    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.name).toBe('');
    expect(component.error).toBe('');
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle login submission', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    authServiceSpy.signIn.and.returnValue(Promise.resolve(mockUser as any));
    component.email = 'test@test.com';
    component.password = 'password';
    component.isLogin = true;

    spyOn(component.close, 'emit');
    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(authServiceSpy.signIn).toHaveBeenCalledWith('test@test.com', 'password');
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle register submission', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    authServiceSpy.signUp.and.returnValue(Promise.resolve(mockUser as any));
    userServiceSpy.setUserProfile.and.returnValue(Promise.resolve());
    
    component.email = 'test@test.com';
    component.password = 'password';
    component.name = 'Test User';
    component.isLogin = false;

    spyOn(component.close, 'emit');
    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(authServiceSpy.signUp).toHaveBeenCalledWith('test@test.com', 'password', 'Test User');
    expect(userServiceSpy.setUserProfile).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should show error for missing fields', async () => {
    translateServiceSpy.instant.and.returnValue('Required fields');
    component.email = '';
    component.password = '';
    component.isLogin = true;

    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(component.error).toBe('Required fields');
    expect(translateServiceSpy.instant).toHaveBeenCalledWith('AUTH.REQUIRED_FIELDS');
  });

  it('should show error for missing name in register mode', async () => {
    translateServiceSpy.instant.and.returnValue('Required fields');
    component.email = 'test@test.com';
    component.password = 'password';
    component.name = '';
    component.isLogin = false;

    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(component.error).toBe('Required fields');
  });

  it('should handle authentication errors', async () => {
    const authError = new Error('Invalid credentials');
    authServiceSpy.signIn.and.returnValue(Promise.reject(authError));
    
    component.email = 'test@test.com';
    component.password = 'wrongpassword';
    component.isLogin = true;

    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(component.error).toBe('Invalid credentials');
  });

  it('should handle generic authentication errors', async () => {
    const authError = new Error('Unknown error');
    authServiceSpy.signIn.and.returnValue(Promise.reject(authError));
    translateServiceSpy.instant.and.returnValue('Generic error');
    
    component.email = 'test@test.com';
    component.password = 'password';
    component.isLogin = true;

    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    await component.onSubmit(event);

    expect(component.error).toBe('Unknown error');
  });

  it('should set loading state during submission', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    authServiceSpy.signIn.and.returnValue(Promise.resolve(mockUser as any));
    component.email = 'test@test.com';
    component.password = 'password';
    component.isLogin = true;

    const event = { preventDefault: jasmine.createSpy('preventDefault') };

    // Start submission
    const submitPromise = component.onSubmit(event);
    expect(component.isLoading).toBe(true);

    // Wait for completion
    await submitPromise;
    expect(component.isLoading).toBe(false);
  });

  // Password reset tests
  describe('Password Reset', () => {
    it('should show reset password modal', () => {
      component.email = 'test@test.com';
      component.onShowResetPassword();
      
      expect(component.showResetPasswordModal).toBe(true);
      expect(component.resetEmail).toBe('test@test.com');
      expect(component.resetError).toBeNull();
    });

    it('should handle forgot password', () => {
      spyOn(component, 'onShowResetPassword');
      component.forgotPassword();
      expect(component.onShowResetPassword).toHaveBeenCalled();
    });

    it('should close reset password modal', () => {
      component.showResetPasswordModal = true;
      component.resetSuccess = true;
      
      component.onCloseResetPassword();
      
      expect(component.showResetPasswordModal).toBe(false);
      expect(component.resetSuccess).toBe(false);
    });

    it('should send reset password email successfully', async () => {
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.resolve());
      component.resetEmail = 'test@test.com';
      
      await component.onSendResetPassword('test@test.com');
      
      expect(authServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
      expect(component.resetSuccess).toBe(true);
      expect(component.resetError).toBeNull();
      expect(component.resetLoading).toBe(false);
    });

    it('should handle reset password email error', async () => {
      const error = new Error('Email not found');
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.reject(error));
      component.resetEmail = 'test@test.com';
      
      await component.onSendResetPassword('test@test.com');
      
      expect(authServiceSpy.sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
      expect(component.resetError).toBe('Email not found');
      expect(component.resetSuccess).toBe(false);
      expect(component.resetLoading).toBe(false);
    });

    it('should handle reset password email generic error', async () => {
      const error = { message: '' };
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.reject(error));
      component.resetEmail = 'test@test.com';
      
      await component.onSendResetPassword('test@test.com');
      
      expect(component.resetError).toBe('Došlo je do greške pri slanju emaila za reset lozinke.');
      expect(component.resetLoading).toBe(false);
    });

    it('should set loading state during reset password email sending', async () => {
      authServiceSpy.sendPasswordResetEmail.and.returnValue(Promise.resolve());
      component.resetEmail = 'test@test.com';
      
      const resetPromise = component.onSendResetPassword('test@test.com');
      expect(component.resetLoading).toBe(true);
      
      await resetPromise;
      expect(component.resetLoading).toBe(false);
    });
  });
}); 