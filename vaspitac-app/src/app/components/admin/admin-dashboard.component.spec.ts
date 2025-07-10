import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { BlogService } from '../../services/blog.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { mockAdminUser } from '../../../test-utils/mock-user-profiles';
import { mockActivities } from '../../../test-utils/mock-activities';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';

describe('AdminDashboardComponent', (): void => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let blogService: jasmine.SpyObj<BlogService>;
  let translate: TranslateService;

  const mockUserProfile = mockAdminUser;

  beforeEach(waitForAsync(async (): Promise<void> => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: mockAdminUser.uid })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const activitySpy = jasmine.createSpyObj('ActivityService', ['getActivities']);
    const blogSpy = jasmine.createSpyObj('BlogService', ['getBlogPosts']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    userSpy.getUserProfile.and.returnValue(of(mockUserProfile));
    activitySpy.getActivities.and.returnValue(of(mockActivities));
    blogSpy.getBlogPosts.and.returnValue(of(mockBlogPosts));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdminDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ActivityService, useValue: activitySpy },
        { provide: BlogService, useValue: blogSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClientTesting(),
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    blogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    router = TestBed.inject(Router);
    translate = TestBed.inject(TranslateService);
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', (): void => {
    expect(userService.getUserProfile).toHaveBeenCalledWith(mockAdminUser.uid);
  });

  it('should load activities on init', (): void => {
    expect(activityService.getActivities).toHaveBeenCalled();
  });

  it('should load blog posts on init', (): void => {
    expect(blogService.getBlogPosts).toHaveBeenCalled();
  });

  it('should calculate correct statistics', (): void => {
    expect(component.stats.totalActivities).toBe(3);
    expect(component.stats.totalBlogs).toBe(3);
    expect(component.stats.publishedBlogs).toBe(3);
  });

  it('should identify admin users correctly', (): void => {
    expect(component.isAdmin(mockUserProfile)).toBe(true);
    
    const nonAdminProfile: UserProfile = {
      ...mockUserProfile,
      role: UserRole.SUBSCRIBER
    };
    expect(component.isAdmin(nonAdminProfile)).toBe(false);
  });

  it('should return false for null user profile', (): void => {
    expect(component.isAdmin(null)).toBe(false);
  });

  it('should navigate to blogs management page', (): void => {
    component.navigateToBlogs();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/blogs']);
  });

  it('should navigate to activities management page', (): void => {
    component.navigateToActivities();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/activities']);
  });

  it('should navigate to home page', (): void => {
    component.navigateToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should render admin dashboard title', (): void => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
  });

  it('should render statistics cards', (): void => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.bg-white.rounded-lg.shadow');
    expect(statCards.length).toBeGreaterThan(0);
  });

  it('should render navigation buttons', (): void => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
}); 