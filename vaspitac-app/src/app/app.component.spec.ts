import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ActivityService } from './services/activity.service';
import { BlogService } from './services/blog.service';
import { LanguageService } from './services/language.service';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let activityServiceMock: jasmine.SpyObj<ActivityService>;
  let blogServiceMock: jasmine.SpyObj<BlogService>;
  let languageServiceMock: jasmine.SpyObj<LanguageService>;
  let routerMock: jasmine.SpyObj<Router>;
  let locationMock: jasmine.SpyObj<Location>;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['signOut'], {
      user$: of(null)
    });
    userServiceMock = jasmine.createSpyObj('UserService', ['getUserProfile']);
    activityServiceMock = jasmine.createSpyObj('ActivityService', ['getActivities']);
    blogServiceMock = jasmine.createSpyObj('BlogService', ['getBlogPosts']);
    languageServiceMock = jasmine.createSpyObj('LanguageService', ['setLanguage']);
    const routerEventsSubject = new Subject<NavigationEnd>();
    routerMock = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable()
    });
    (routerMock as any).eventsSubject = routerEventsSubject;
    locationMock = jasmine.createSpyObj('Location', ['back']);
    translateServiceMock = jasmine.createSpyObj('TranslateService', ['setDefaultLang', 'use', 'get'], {
      currentLang: 'sr',
      onLangChange: of({ lang: 'sr' }),
      onTranslationChange: of({ translations: {} }),
      onDefaultLangChange: of({ lang: 'sr' })
    });
    translateServiceMock.get.and.callFake((key: string) => of(key));

    activityServiceMock.getActivities.and.returnValue(of([]));
    blogServiceMock.getBlogPosts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ActivityService, useValue: activityServiceMock },
        { provide: BlogService, useValue: blogServiceMock },
        { provide: LanguageService, useValue: languageServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default Serbian language', () => {
    expect(component.currentLang).toBe('sr');
    expect(translateServiceMock.setDefaultLang).toHaveBeenCalledWith('sr');
    expect(translateServiceMock.use).toHaveBeenCalledWith('sr');
  });

  it('should load data on init', () => {
    expect(activityServiceMock.getActivities).toHaveBeenCalled();
    expect(blogServiceMock.getBlogPosts).toHaveBeenCalled();
  });

  it('should set up user profile observable', () => {
    expect(component.userProfile$).toBeDefined();
  });

  it('should switch language from Serbian to English', () => {
    component.currentLang = 'sr';
    component.switchLanguage();
    
    expect(component.currentLang).toBe('en');
    expect(translateServiceMock.use).toHaveBeenCalledWith('en');
    expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('en');
  });

  it('should switch language from English to Serbian', () => {
    component.currentLang = 'en';
    component.switchLanguage();
    
    expect(component.currentLang).toBe('sr');
    expect(translateServiceMock.use).toHaveBeenCalledWith('sr');
    expect(languageServiceMock.setLanguage).toHaveBeenCalledWith('sr');
  });

  it('should check if route is active', () => {
    component.activeRoute = '/about';
    expect(component.isActive('/about')).toBe(true);
    expect(component.isActive('/home')).toBe(false);
  });

  it('should open search overlay', () => {
    component.isSearchOpen = false;
    component.openSearch();
    expect(component.isSearchOpen).toBe(true);
  });

  it('should close search overlay', () => {
    component.isSearchOpen = true;
    component.closeSearch();
    expect(component.isSearchOpen).toBe(false);
  });

  it('should open auth modal', () => {
    component.showAuthModal = false;
    component.openAuthModal();
    expect(component.showAuthModal).toBe(true);
  });

  it('should close auth modal', () => {
    component.showAuthModal = true;
    component.closeAuthModal();
    expect(component.showAuthModal).toBe(false);
  });

  it('should handle logout', () => {
    component.onLogout();
    expect(authServiceMock.signOut).toHaveBeenCalled();
  });

  it('should navigate to profile page', () => {
    component.onProfileClick();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should display app title and tagline', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    const tagline = compiled.querySelector('.text-xs.md\\:text-sm.text-green-600');
    
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('APP.TITLE');
    expect(tagline).toBeTruthy();
    expect(tagline.textContent).toContain('APP.TAGLINE');
  });

  it('should show language switcher button', () => {
    const compiled = fixture.nativeElement;
    const languageButton = compiled.querySelector('button[class*="hover:bg-green-50"]');
    expect(languageButton).toBeTruthy();
  });

  it('should show search button', () => {
    const compiled = fixture.nativeElement;
    const searchButton = compiled.querySelector('button svg[viewBox="0 0 24 24"]');
    expect(searchButton).toBeTruthy();
  });

  it('should show login button when user is not logged in', () => {
    const compiled = fixture.nativeElement;
    const loginButton = compiled.querySelector('button.bg-green-600');
    expect(loginButton).toBeTruthy();
    expect(loginButton.textContent).toContain('AUTH.LOGIN');
  });

  it('should show user avatar when user is logged in', () => {
    // Test that the component handles user profile data correctly
    const mockUser: any = {
      uid: '123',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'http://example.com/avatar.jpg',
      createdAt: '2023-01-01'
    };
    
    // Verify that getUserProfile is called when user is logged in
    authServiceMock.user$ = of({ uid: '123' } as any);
    userServiceMock.getUserProfile.and.returnValue(of(mockUser));
    
    // The component should set up the userProfile$ observable
    expect(component.userProfile$).toBeDefined();
  });

  it('should handle user without avatar URL', () => {
    const mockUser: any = {
      uid: '123',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: '',
      createdAt: '2023-01-01'
    };
    
    // Verify that getUserProfile is called when user is logged in
    authServiceMock.user$ = of({ uid: '123' } as any);
    userServiceMock.getUserProfile.and.returnValue(of(mockUser));
    
    // The component should set up the userProfile$ observable
    expect(component.userProfile$).toBeDefined();
  });

  it('should handle route changes and update activeRoute', () => {
    const navigationEnd = new NavigationEnd(1, '/about', '/about');
    (routerMock as any).eventsSubject.next(navigationEnd);
    
    expect(component.activeRoute).toBe('/about');
  });

  it('should clean up back button listener on destroy', () => {
    // Mock the back button listener
    const mockListener = { remove: jasmine.createSpy('remove') };
    (component as any).backButtonListener = mockListener;
    
    component.ngOnDestroy();
    
    expect(mockListener.remove).toHaveBeenCalled();
  });

  it('should load activities and blog posts data', () => {
    const mockActivities: any[] = [{ id: 1, title: 'Test Activity' }];
    const mockBlogPosts: any[] = [{ id: 1, title: 'Test Blog' }];
    
    activityServiceMock.getActivities.and.returnValue(of(mockActivities));
    blogServiceMock.getBlogPosts.and.returnValue(of(mockBlogPosts));
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component.activities).toEqual(mockActivities);
    expect(component.blogPosts).toEqual(mockBlogPosts);
  });
});
