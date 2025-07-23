import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, EventEmitter } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { ActivityService } from './services/activity.service';
import { BlogService } from './services/blog.service';
import { LanguageService } from './services/language.service';
import { LoadingService } from './services/loading.service';
import { mockActivities } from '../test-utils/mock-activities';
import { mockBlogPosts } from '../test-utils/mock-blog-posts';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let blogService: jasmine.SpyObj<BlogService>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let _loadingService: jasmine.SpyObj<LoadingService>;
  let router: Router;
  let _location: jasmine.SpyObj<Location>;
  let translate: TranslateService;
  let routerEvents: Subject<NavigationEnd>;
      let _backButtonCallback: (_data: { canGoBack: boolean }) => void;
  let _addListenerSpy: jasmine.Spy;

  beforeEach(async () => {
    routerEvents = new Subject<NavigationEnd>();
    const authSpy = jasmine.createSpyObj('AuthService', ['signOut'], { user$: of(null) });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const activitySpy = jasmine.createSpyObj('ActivityService', ['getActivities']);
    const blogSpy = jasmine.createSpyObj('BlogService', ['getBlogPosts']);
    const langSpy = jasmine.createSpyObj('LanguageService', ['setLanguage', 'getCurrentLanguage']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', [], { loadingState$: of({ show: false, message: '' }) });
    const locationSpy = jasmine.createSpyObj('Location', ['back']);
    const translateSpy = {
      addLangs: jasmine.createSpy('addLangs'),
      setDefaultLang: jasmine.createSpy('setDefaultLang'),
      use: jasmine.createSpy('use'),
      get: jasmine.createSpy('get').and.returnValue(of('')),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    _addListenerSpy = spyOn(CapacitorApp, 'addListener').and.callFake((eventName, _callback) => {
        if (eventName === 'backButton') {
            _backButtonCallback = _callback as any;
        }
        return Promise.resolve({ remove: () => Promise.resolve() } as any);
    });
    spyOn(CapacitorApp, 'exitApp');

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: { events: routerEvents.asObservable(), navigate: jasmine.createSpy('navigate') } },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ActivityService, useValue: activitySpy },
        { provide: BlogService, useValue: blogSpy },
        { provide: LanguageService, useValue: langSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: Location, useValue: locationSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    blogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    languageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    _loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    router = TestBed.inject(Router);
    _location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    translate = TestBed.inject(TranslateService);

    activityService.getActivities.and.returnValue(of(mockActivities));
    blogService.getBlogPosts.and.returnValue(of(mockBlogPosts));
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default language', () => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(translate.addLangs).toHaveBeenCalledWith(['sr', 'en']);
        expect(translate.setDefaultLang).toHaveBeenCalledWith('sr');
        expect(translate.use).toHaveBeenCalledWith('sr');
    expect(component.currentLang).toBe('sr');
    });

    it('should load initial data', () => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(activityService.getActivities).toHaveBeenCalledWith('sr');
        expect(blogService.getBlogPosts).toHaveBeenCalledWith('sr');
    });

  });

  describe('Authentication', () => {
    it('should not fetch user profile if user is not logged in', () => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(userService.getUserProfile).not.toHaveBeenCalled();
    });

    it('should fetch user profile if user is logged in', () => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
    });
  });

  describe('Language Switching', () => {
    it('should switch language and reload data', () => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    component.switchLanguage();
    expect(component.currentLang).toBe('en');
      expect(translate.use).toHaveBeenCalledWith('en');
      expect(languageService.setLanguage).toHaveBeenCalledWith('en');
      expect(activityService.getActivities).toHaveBeenCalledWith('en');
      expect(blogService.getBlogPosts).toHaveBeenCalledWith('en');
    });
  });
  
  describe('Routing and Navigation', () => {
    it('should update activeRoute on NavigationEnd', () => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        routerEvents.next(new NavigationEnd(1, '/home', '/home'));
        expect(component.activeRoute).toBe('/home');
    });

  });

  describe('UI Interactions', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    describe('Search Overlay', () => {
  it('should open search overlay', () => {
        expect(component.isSearchOpen).toBe(false);
    component.openSearch();
    expect(component.isSearchOpen).toBe(true);
  });

  it('should close search overlay', () => {
    component.isSearchOpen = true;
        expect(component.isSearchOpen).toBe(true);
    component.closeSearch();
    expect(component.isSearchOpen).toBe(false);
      });
  });

    describe('Auth Modal', () => {
  it('should open auth modal', () => {
        expect(component.showAuthModal).toBe(false);
    component.openAuthModal();
    expect(component.showAuthModal).toBe(true);
  });

  it('should close auth modal', () => {
    component.showAuthModal = true;
        expect(component.showAuthModal).toBe(true);
    component.closeAuthModal();
    expect(component.showAuthModal).toBe(false);
      });
  });

    describe('Authentication', () => {
  it('should handle logout', () => {
    component.onLogout();
        expect(authService.signOut).toHaveBeenCalled();
      });
  });

    describe('Navigation', () => {
  it('should navigate to profile page', () => {
    component.onProfileClick();
        expect(router.navigate).toHaveBeenCalledWith(['/profile']);
      });

      it('should navigate to home page', () => {
        component.navigateToHome();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
      });
    });
  });
});
