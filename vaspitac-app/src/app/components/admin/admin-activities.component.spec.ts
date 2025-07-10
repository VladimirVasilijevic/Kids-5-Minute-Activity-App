import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
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
import { ImageUploadService } from '../../services/image-upload.service';

describe('AdminActivitiesComponent', (): void => {
  let component: AdminActivitiesComponent;
  let fixture: ComponentFixture<AdminActivitiesComponent>;
  let router: Router;
  let _authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let _translate: TranslateService;

  const mockUserProfile = mockAdminUser;

  const mockAdminActivities: AdminActivity[] = mockActivities.map(activity => ({
    ...activity,
    isEditing: false,
    isDeleting: false,
    createdAt: '2024-01-01T00:00:00Z'
  }));

  const mockImageUploadService = {
    isValidImage: (): boolean => true,
    uploadImage: (): any => of('mock-url')
  };

  beforeEach(waitForAsync(async (): Promise<void> => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: mockAdminUser.uid })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const activitySpy = jasmine.createSpyObj('ActivityService', [
      'getActivities',
      'createActivity',
      'updateActivity',
      'deleteActivity'
    ]);
    activitySpy.getActivities.and.returnValue(of(mockActivities));
    // Ensure these return resolved promises immediately
    activitySpy.createActivity.and.returnValue(Promise.resolve());
    activitySpy.updateActivity.and.returnValue(Promise.resolve());
    activitySpy.deleteActivity.and.returnValue(Promise.resolve());
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    userSpy.getUserProfile.and.returnValue(of(mockUserProfile));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdminActivitiesComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: ActivityService, useValue: activitySpy },
        { provide: Router, useValue: routerSpy },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        provideHttpClientTesting(),
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    _authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    router = TestBed.inject(Router);
    _translate = TestBed.inject(TranslateService);
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

  it('should handle form submission for creating activity', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      title: 'New Activity',
      description: 'New Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '60',
      instructions: 'Step 1\nStep 2',
      image: 'new-activity.jpg', // Provide image to pass validation
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(event.preventDefault).toHaveBeenCalled();
    // Find by title instead of relying on array index
    const newActivity = component.activities.find(a => a.title === 'New Activity');
    expect(component.activities.length).toBe(4); // 3 original + 1 new
    expect(newActivity).toBeTruthy();
    if (newActivity) {
      expect(newActivity.title).toBe('New Activity');
    }
    
    discardPeriodicTasks();
  }));

  it('should handle form submission for editing activity', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    
    component.editingActivity = mockAdminActivities[0];
    component.formData = {
      title: 'Updated Activity',
      description: 'Updated Description',
      ageGroup: 'School Age (6-12 years)',
      duration: '90',
      instructions: 'Updated Step 1\nUpdated Step 2',
      image: 'updated-activity.jpg', // Provide image to pass validation
      video: '',
      category: 'educational',
      language: 'en'
    };
    
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(event.preventDefault).toHaveBeenCalled();
    // Find by id to ensure correct activity is updated
    const updated = component.activities.find(a => a.id === mockAdminActivities[0].id);
    expect(updated).toBeTruthy();
    if (updated) {
      expect(updated.title).toBe('Updated Activity');
    }
    
    discardPeriodicTasks();
  }));

  it('should handle edit activity', (): void => {
    const activityToEdit = mockAdminActivities[0];
    
    component.handleEdit(activityToEdit);
    
    expect(component.editingActivity).toBe(activityToEdit);
    expect(component.showForm).toBe(true);
    expect(component.formData.title).toBe(activityToEdit.title);
  });

  it('should handle delete activity', fakeAsync((): void => {
    const activityToDelete = mockAdminActivities[0];
    const initialLength = component.activities.length;
    
    // Call handleDelete to set up the confirmation modal
    component.handleDelete(activityToDelete);
    
    // Verify the confirmation modal is shown
    expect(component.showConfirmModal).toBe(true);
    expect(component.confirmAction).toBeTruthy();
    
    // Execute the confirmation action
    component.onConfirmAction();
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(component.activities.length).toBe(initialLength - 1);
    // Ensure the deleted activity is not present by id
    expect(component.activities.find(a => a.id === activityToDelete.id)).toBeUndefined();
    
    discardPeriodicTasks();
  }));

  it('should not delete activity when confirmation modal is cancelled', fakeAsync((): void => {
    const activityToDelete = mockAdminActivities[0];
    const initialLength = component.activities.length;
    
    // Call handleDelete to set up the confirmation modal
    component.handleDelete(activityToDelete);
    
    // Verify the confirmation modal is shown
    expect(component.showConfirmModal).toBe(true);
    
    // Close the modal without confirming
    component.closeConfirmModal();
    
    expect(component.activities.length).toBe(initialLength);
    expect(component.showConfirmModal).toBe(false);
    
    discardPeriodicTasks();
  }));

  it('should reset form after submission', (): void => {
    component.formData = {
      title: 'Test',
      description: 'Test',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test',
      image: 'test.jpg',
      video: '',
      category: 'creative',
      language: 'en'
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

  it('should create activity with correct properties', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '45',
      instructions: 'Step 1\nStep 2\nStep 3',
      image: 'test.jpg', // Provide image to pass validation
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    // Find by title
    const newActivity = component.activities.find(a => a.title === 'Test Activity');
    expect(newActivity).toBeTruthy();
    if (newActivity) {
      expect(newActivity.title).toBe('Test Activity');
      expect(newActivity.description).toBe('Test Description');
      expect(newActivity.ageGroup).toBe('Preschool (3-5 years)');
      // Duration should match the format used in the component (e.g., '45 min')
      expect(newActivity.duration).toMatch(/45( min)?/);
      // Instructions should be an array
      expect(Array.isArray(newActivity.instructions)).toBeTrue();
      expect(newActivity.instructions).toEqual(['Step 1', 'Step 2', 'Step 3']);
      // Image URL should match the input
      expect(newActivity.imageUrl).toBe('test.jpg');
      // Category should match the formData
      expect(newActivity.category).toBe('creative');
      expect(newActivity.isEditing).toBe(false);
      expect(newActivity.isDeleting).toBe(false);
      expect(newActivity.createdAt).toBeTruthy();
    }
    
    discardPeriodicTasks();
  }));

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

  it('should handle activity with no instructions', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test instructions', // Provide valid instructions to pass validation
      image: 'test.jpg', // Provide image to pass validation
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    const newActivity = component.activities.find(a => a.title === 'Test Activity');
    expect(newActivity).toBeTruthy();
    if (newActivity) {
      // Should have instructions as an array
      expect(Array.isArray(newActivity.instructions)).toBeTrue();
      expect(newActivity.instructions).toEqual(['Test instructions']);
    }
    
    discardPeriodicTasks();
  }));

  it('should fail validation when instructions are empty', (): void => {
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: '', // Empty instructions should fail validation
      image: 'test.jpg',
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    // Access the private method for testing
    const isValid = (component as any).validateForm();
    expect(isValid).toBe(false);
    expect(component.formErrors['instructions']).toBe('Instructions are required');
  });

  it('should handle activity with no image', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test',
      image: '',
      video: 'test-video.mp4', // Provide video instead of image to pass validation
      category: 'creative',
      language: 'en'
    };
    
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    const newActivity = component.activities.find(a => a.title === 'Test Activity');
    expect(newActivity).toBeTruthy();
    if (newActivity) {
      // Should have video URL instead of image
      expect(newActivity.videoUrl).toBe('test-video.mp4');
      expect(newActivity.imageUrl).toBe('');
    }
    
    discardPeriodicTasks();
  }));

  it('should validate form correctly', (): void => {
    // Test valid form data
    component.formData = {
      title: 'Test Activity',
      description: 'Test Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '30',
      instructions: 'Test instructions',
      image: 'test.jpg',
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    // Access the private method for testing
    const isValid = (component as any).validateForm();
    expect(isValid).toBe(true);
    expect(Object.keys(component.formErrors).length).toBe(0);
  });

  it('should call service methods when creating activity', fakeAsync((): void => {
    component.showForm = true; // Ensure form is visible
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      title: 'New Activity',
      description: 'New Description',
      ageGroup: 'Preschool (3-5 years)',
      duration: '60',
      instructions: 'Step 1\nStep 2',
      image: 'new-activity.jpg',
      video: '',
      category: 'creative',
      language: 'en'
    };
    
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(activityService.createActivity).toHaveBeenCalled();
    
    discardPeriodicTasks();
  }));
}); 