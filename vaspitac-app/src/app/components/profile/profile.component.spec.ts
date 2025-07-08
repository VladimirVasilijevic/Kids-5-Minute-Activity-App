import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userSubject: Subject<any>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut'], { user$: undefined });
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userSubject = new Subject();
    Object.defineProperty(authServiceSpy, 'user$', { get: () => userSubject.asObservable() });

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
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
    const user = { uid: '1', displayName: 'Test', email: 'test@test.com', avatarUrl: '', createdAt: '2023-01-01' };
    userServiceSpy.getUserProfile.and.returnValue(of(user));
    fixture.detectChanges();
    userSubject.next({ uid: '1' });
    tick();
    component.userProfile$.subscribe(profile => {
      expect(profile).toEqual(user);
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
}); 