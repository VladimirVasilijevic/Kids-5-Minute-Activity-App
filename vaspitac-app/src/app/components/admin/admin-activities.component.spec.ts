import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AdminActivitiesComponent } from './admin-activities.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ActivityService } from '../../services/activity.service';
import { AdminActivity } from '../../models/admin-activity.model';
import { mockAdminUser, mockSubscriber } from '../../../test-utils/mock-user-profiles';
import { mockActivities } from '../../../test-utils/mock-activities';

describe('AdminActivitiesComponent', (): void => {
  let component: AdminActivitiesComponent;
  let fixture: ComponentFixture<AdminActivitiesComponent>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let translate: TranslateService;

  const mockUserProfile = mockAdminUser;

  const mockAdminActivities: AdminActivity[] = mockActivities.map(activity => ({
    ...activity,
    isEditing: false,
    isDeleting: false,
    createdAt: '2024-01-01T00:00:00Z'
  }));

  beforeEach(waitForAsync(async (): Promise<void> => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: mockAdminUser.uid })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const activitySpy = jasmine.createSpyObj('ActivityService', ['getActivities']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    userSpy.getUserProfile.and.returnValue(of(mockUserProfile));
    activitySpy.getActivities.and.returnValue(of(mockActivities));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdminActivitiesComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ActivityService, useValue: activitySpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClientTesting(),
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    router = TestBed.inject(Router);
    translate = TestBed.inject(TranslateService);
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AdminActivitiesComponent);
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

  it('should transform activities to admin activities', (): void => {
    expect(component.activities.length).toBe(3);
    expect(component.activities[0]).toEqual(jasmine.objectContaining({
      ...mockActivities[0],
      isEditing: false,
      isDeleting: false
    }));
  });

  it('should identify admin users correctly', (): void => {
    expect(component.isAdmin(mockUserProfile)).toBe(true);
    
    expect(component.isAdmin(mockSubscriber)).toBe(false);
  });

  it('should return false for null user profile', (): void => {
    expect(component.isAdmin(null)).toBe(false);
  });

  it('should navigate to admin dashboard', (): void => {
    component.navigateToAdmin();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show form when creating new activity', (): void => {
    component.showForm = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const form = compiled.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should handle form submission for creating activity', (): void => {
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      title: 'New Activity',
      description: 'New Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '60',
      instructions: 'Step 1\nStep 2',
      image: 'new-activity.jpg'
    };
    
    component.handleSubmit(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.activities.length).toBe(4); // 3 original + 1 new
    expect(component.activities[3].title).toBe('New Activity');
  });

  it('should handle form submission for editing activity', (): void => {
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    
    component.editingActivity = mockAdminActivities[0];
    component.formData = {
      title: 'Updated Activity',
      description: 'Updated Description',
      ageGroup: 'School Age (6-12 years)',
      duration: '90',
      instructions: 'Updated Step 1\nUpdated Step 2',
      image: 'updated-activity.jpg'
    };
    
    component.handleSubmit(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.activities[0].title).toBe('Updated Activity');
  });

  it('should handle edit activity', (): void => {
    const activityToEdit = mockAdminActivities[0];
    
    component.handleEdit(activityToEdit);
    
    expect(component.editingActivity).toBe(activityToEdit);
    expect(component.showForm).toBe(true);
    expect(component.formData.title).toBe(activityToEdit.title);
  });

  it('should handle delete activity', (): void => {
    spyOn(window, 'confirm').and.returnValue(true);
    const activityToDelete = mockAdminActivities[0];
    const initialLength = component.activities.length;
    
    component.handleDelete(activityToDelete);
    
    expect(component.activities.length).toBe(initialLength - 1);
    expect(component.activities.find(a => a.id === activityToDelete.id)).toBeUndefined();
  });

  it('should not delete activity when user cancels', (): void => {
    spyOn(window, 'confirm').and.returnValue(false);
    const activityToDelete = mockAdminActivities[0];
    const initialLength = component.activities.length;
    
    component.handleDelete(activityToDelete);
    
    expect(component.activities.length).toBe(initialLength);
  });

  it('should reset form after submission', (): void => {
    component.formData = {
      title: 'Test',
      description: 'Test',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test',
      image: 'test.jpg'
    };
    component.editingActivity = mockAdminActivities[0];
    component.showForm = true;
    
    component.resetForm();
    
    expect(component.formData.title).toBe('');
    expect(component.editingActivity).toBeNull();
    expect(component.showForm).toBe(false);
  });

  it('should format date correctly', (): void => {
    const dateString = '2024-01-01T00:00:00Z';
    const formatted = component.formatDate(dateString);
    
    expect(formatted).toBe(new Date(dateString).toLocaleDateString());
  });

  it('should have correct age groups', (): void => {
    expect(component.ageGroups).toContain('Toddler (1-2 years)');
    expect(component.ageGroups).toContain('Preschool (3-5 years)');
    expect(component.ageGroups).toContain('School Age (6-12 years)');
    expect(component.ageGroups).toContain('Teen (13+ years)');
    expect(component.ageGroups).toContain('All Ages');
  });

  it('should create activity with correct properties', (): void => {
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '45',
      instructions: 'Step 1\nStep 2\nStep 3',
      image: 'test.jpg'
    };
    
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    
    const newActivity = component.activities[component.activities.length - 1];
    expect(newActivity.title).toBe('Test Activity');
    expect(newActivity.description).toBe('Test Description');
    expect(newActivity.ageGroup).toBe('Preschool (3-5 years)');
    expect(newActivity.duration).toBe('45');
    expect(newActivity.instructions).toEqual(['Step 1', 'Step 2', 'Step 3']);
    expect(newActivity.imageUrl).toBe('test.jpg');
    expect(newActivity.category).toBe('general');
    expect(newActivity.isEditing).toBe(false);
    expect(newActivity.isDeleting).toBe(false);
    expect(newActivity.createdAt).toBeTruthy();
  });

  it('should render activity list', (): void => {
    const compiled = fixture.nativeElement;
    const activityTable = compiled.querySelector('table');
    expect(activityTable).toBeTruthy();
  });

  it('should render admin activities title', (): void => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
  });

  it('should handle activity with no instructions', (): void => {
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: '',
      image: 'test.jpg'
    };
    
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    
    const newActivity = component.activities[component.activities.length - 1];
    expect(newActivity.instructions).toEqual([]);
  });

  it('should handle activity with no image', (): void => {
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test',
      image: ''
    };
    
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    
    const newActivity = component.activities[component.activities.length - 1];
    expect(newActivity.imageUrl).toBe('');
  });
}); 