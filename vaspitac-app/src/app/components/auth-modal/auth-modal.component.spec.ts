import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AuthModalComponent } from './auth-modal.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';




describe('AuthModalComponent', () => {
  let component: AuthModalComponent;
  let fixture: ComponentFixture<AuthModalComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'signUp', 'signInWithProvider']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['setUserProfile']);

    await TestBed.configureTestingModule({
      declarations: [AuthModalComponent],
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event and reset form on close', () => {
    spyOn(component.close, 'emit');
    component.isLogin = false;
    component.name = 'Test';
    component.email = 'test@test.com';
    component.password = '123456';
    component.error = 'err';
    component.isLoading = true;
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.isLogin).toBe(true);
  });

  it('should switch between login and register mode', () => {
    expect(component.isLogin).toBe(true);
    component.switchMode();
    expect(component.isLogin).toBe(false);
    component.switchMode();
    expect(component.isLogin).toBe(true);
  });

  it('should show error if required fields are missing on submit (login)', fakeAsync(() => {
    component.isLogin = true;
    component.email = '';
    component.password = '';
    component.onSubmit({ preventDefault: () => {} } as any);
    tick();
    expect(component.error).toBeTruthy();
  }));

  it('should show error if required fields are missing on submit (register)', fakeAsync(() => {
    component.isLogin = false;
    component.email = 'test@test.com';
    component.password = '123456';
    component.name = '';
    component.onSubmit({ preventDefault: () => {} } as any);
    tick();
    expect(component.error).toBeTruthy();
  }));

  it('should call AuthService.signIn on login', fakeAsync(() => {
    component.isLogin = true;
    component.email = 'test@test.com';
    component.password = '123456';
    authServiceSpy.signIn.and.returnValue(Promise.resolve({ uid: '1' } as any));
    spyOn(component, 'onClose');
    component.onSubmit({ preventDefault: () => {} } as any);
    tick();
    expect(authServiceSpy.signIn).toHaveBeenCalledWith('test@test.com', '123456');
    expect(component.onClose).toHaveBeenCalled();
  }));

  it('should call AuthService.signUp and UserService.setUserProfile on register', fakeAsync(() => {
    component.isLogin = false;
    component.email = 'test@test.com';
    component.password = '123456';
    component.name = 'Test';
    authServiceSpy.signUp.and.returnValue(Promise.resolve({ uid: '1', photoURL: '' } as any));
    userServiceSpy.setUserProfile.and.returnValue(Promise.resolve());
    spyOn(component, 'onClose');
    component.onSubmit({ preventDefault: () => {} } as any);
    tick();
    expect(authServiceSpy.signUp).toHaveBeenCalledWith('test@test.com', '123456', 'Test');
    expect(userServiceSpy.setUserProfile).toHaveBeenCalled();
    expect(component.onClose).toHaveBeenCalled();
  }));

  it('should call AuthService.signInWithProvider and UserService.setUserProfile on social login', fakeAsync(() => {
    authServiceSpy.signInWithProvider.and.returnValue(Promise.resolve({ uid: '1', displayName: 'Test', email: 'test@test.com', photoURL: '' } as any));
    userServiceSpy.setUserProfile.and.returnValue(Promise.resolve());
    spyOn(component, 'onClose');
    component.onSocialLogin('google');
    tick();
    expect(authServiceSpy.signInWithProvider).toHaveBeenCalledWith('google');
    expect(userServiceSpy.setUserProfile).toHaveBeenCalled();
    expect(component.onClose).toHaveBeenCalled();
  }));
}); 