import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CategoryService } from '../../services/category.service';
import { AboutService } from '../../services/about.service';
import { mockCategories } from '../../../test-utils/mock-categories';
import { mockAdminUser, mockFreeUser } from '../../../test-utils/mock-user-profiles';
import { mockAboutContent } from '../../../test-utils/mock-about-content';
import { CATEGORY_KEYS, CategoryKey } from '../../models/category-keys';
import { Category } from '../../models/category.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let aboutService: jasmine.SpyObj<AboutService>;

  const typedMockCategories: Category[] = mockCategories.map(c => ({...c, id: c.id as CategoryKey}));

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut'], { user$: of(null) });
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getCategories']);
    const aboutServiceSpy = jasmine.createSpyObj('AboutService', ['getAboutContent']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AboutService, useValue: aboutServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    aboutService = TestBed.inject(AboutService) as jasmine.SpyObj<AboutService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of(null));
      categoryService.getCategories.and.returnValue(of(typedMockCategories));
      aboutService.getAboutContent.and.returnValue(of(mockAboutContent));
      fixture.detectChanges();
    });

    it('should load categories and about content', () => {
      expect(categoryService.getCategories).toHaveBeenCalled();
      expect(aboutService.getAboutContent).toHaveBeenCalled();
    });

    it('should not try to load a user profile', () => {
      expect(userService.getUserProfile).not.toHaveBeenCalled();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));
      userService.getUserProfile.and.returnValue(of(mockFreeUser));
      categoryService.getCategories.and.returnValue(of(typedMockCategories));
      aboutService.getAboutContent.and.returnValue(of(mockAboutContent));
      fixture.detectChanges();
    });

    it('should load user profile', () => {
      expect(userService.getUserProfile).toHaveBeenCalledWith('test-uid');
    });

    it('should show the auth modal when openAuthModal is called', () => {
      component.openAuthModal();
      expect(component.showAuthModal).toBeTrue();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      spyOn(window, 'scrollTo');
    });

    it('should navigate to /about', fakeAsync(() => {
      component.goToCategory(CATEGORY_KEYS.ABOUT);
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/about']);
    }));

    it('should navigate to /shop', fakeAsync(() => {
      component.goToCategory(CATEGORY_KEYS.SHOP);
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/shop']);
    }));

    it('should navigate to /subscribe', fakeAsync(() => {
      component.goToCategory(CATEGORY_KEYS.SUBSCRIBE);
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/subscribe']);
    }));

    it('should navigate to /blog', fakeAsync(() => {
      component.goToCategory(CATEGORY_KEYS.BLOG);
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/blog']);
    }));



    it('should navigate to /activities with category', fakeAsync(() => {
      component.goToCategory(CATEGORY_KEYS.PHYSICAL);
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.PHYSICAL } });
    }));

    it('should navigate to /activities for unknown category', fakeAsync(() => {
      component.goToCategory('UNKNOWN');
      tick();
      expect(router.navigate).toHaveBeenCalledWith(['/activities']);
    }));
  });

  describe('Admin functionality', () => {
    it('should return true for an admin user', () => {
      expect(component.isAdmin(mockAdminUser)).toBeTrue();
    });

    it('should return false for a non-admin user', () => {
      expect(component.isAdmin(mockFreeUser)).toBeFalse();
    });

    it('should navigate to the admin dashboard', () => {
      component.navigateToAdmin();
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });
  });

  it('should handle profile click', () => {
    component.onProfileClick();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle logout', () => {
    component.onLogout();
    expect(authService.signOut).toHaveBeenCalled();
  });
});
