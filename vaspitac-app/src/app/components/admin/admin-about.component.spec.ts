import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminAboutComponent } from './admin-about.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AboutService } from '../../services/about.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { LanguageService } from '../../services/language.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { AboutContent, Experience } from '../../models/about-content.model';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Test suite for AdminAboutComponent
 * Tests admin functionality for managing about page content
 */
describe('AdminAboutComponent', () => {
  let component: AdminAboutComponent;
  let fixture: ComponentFixture<AdminAboutComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAboutService: jasmine.SpyObj<AboutService>;
  let mockImageUploadService: jasmine.SpyObj<ImageUploadService>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;

  const mockUserProfile: UserProfile = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    permissions: []
  };

  const mockAboutContent: AboutContent = {
    name: 'Test Name',
    role: 'Test Role',
    bioParagraphs: ['Test bio paragraph'],
    experiences: [
      {
        title: 'Test Experience',
        description: 'Test description',
        dateRange: '2020-2023'
      }
    ],
    email: 'test@example.com',
    phone: '+1234567890',
    location: 'Test Location',
    profileImageUrl: 'https://example.com/image.jpg',
    lastUpdated: new Date().toISOString()
  };

  /**
   * Sets up the testing environment before each test
   */
  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: 'test-uid' })
    });
    mockUserService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    mockAboutService = jasmine.createSpyObj('AboutService', ['getAboutContent', 'updateAboutContent']);
    mockImageUploadService = jasmine.createSpyObj('ImageUploadService', ['uploadImage', 'isValidImage']);
    mockLanguageService = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage', 'setLanguage']);

    mockUserService.getUserProfile.and.returnValue(of(mockUserProfile));
    mockAboutService.getAboutContent.and.returnValue(of(mockAboutContent));
    mockAboutService.updateAboutContent.and.returnValue(Promise.resolve());
    mockLanguageService.getCurrentLanguage.and.returnValue('sr');
    mockImageUploadService.isValidImage.and.returnValue(true);
    mockImageUploadService.uploadImage.and.returnValue(of('https://example.com/uploaded-image.jpg'));

    await TestBed.configureTestingModule({
      declarations: [AdminAboutComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: AboutService, useValue: mockAboutService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Tests that the component is created successfully
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests that user profile is loaded on initialization
   */
  it('should load user profile on init', () => {
    expect(mockUserService.getUserProfile).toHaveBeenCalledWith('test-uid');
    component.userProfile$.subscribe(profile => {
      expect(profile).toEqual(mockUserProfile);
    });
  });

  /**
   * Tests that about content is loaded on initialization
   */
  it('should load about content on init', () => {
    expect(mockAboutService.getAboutContent).toHaveBeenCalled();
    expect(component.aboutContent).toEqual(mockAboutContent);
  });

  /**
   * Tests that current language is loaded on initialization
   */
  it('should load current language on init', () => {
    expect(mockLanguageService.getCurrentLanguage).toHaveBeenCalled();
    expect(component.currentLanguage).toBe('sr');
  });

  /**
   * Tests that form data is initialized with about content
   */
  it('should initialize form data with about content', () => {
    expect(component.formData.name).toBe(mockAboutContent.name);
    expect(component.formData.role).toBe(mockAboutContent.role);
    expect(component.formData.bioParagraphs).toEqual(mockAboutContent.bioParagraphs || []);
    expect(component.formData.experiences).toEqual(mockAboutContent.experiences || []);
    expect(component.formData.email).toBe(mockAboutContent.email);
    expect(component.formData.phone).toBe(mockAboutContent.phone || '');
    expect(component.formData.location).toBe(mockAboutContent.location);
    expect(component.formData.profileImageUrl).toBe(mockAboutContent.profileImageUrl || '');
  });

  /**
   * Tests admin role validation
   */
  it('should correctly identify admin users', () => {
    expect(component.isAdmin(mockUserProfile)).toBe(true);
    
    const nonAdminProfile = { ...mockUserProfile, role: UserRole.FREE_USER };
    expect(component.isAdmin(nonAdminProfile)).toBe(false);
    
    expect(component.isAdmin(null)).toBe(false);
  });

  /**
   * Tests form validation with valid data
   */
  it('should validate form with valid data', () => {
    component.formData = {
      name: 'Test Name',
      role: 'Test Role',
      bioParagraphs: ['Test bio'],
      experiences: [],
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'Test Location',
      profileImageUrl: ''
    };

    const isValid = (component as any).validateForm();
    expect(isValid).toBe(true);
    expect(Object.keys(component.formErrors).length).toBe(0);
  });

  /**
   * Tests form validation with invalid data
   */
  it('should validate form with invalid data', () => {
    component.formData = {
      name: '',
      role: '',
      bioParagraphs: [''],
      experiences: [],
      email: '',
      phone: '',
      location: '',
      profileImageUrl: ''
    };

    const isValid = (component as any).validateForm();
    expect(isValid).toBe(false);
    expect(component.formErrors['name']).toBe('Name is required');
    expect(component.formErrors['role']).toBe('Role is required');
    expect(component.formErrors['bioParagraphs']).toBe('At least one biography paragraph is required');
    expect(component.formErrors['email']).toBe('Email is required');
    expect(component.formErrors['phone']).toBe('Phone is required');
    expect(component.formErrors['location']).toBe('Location is required');
  });

  /**
   * Tests form submission with valid data
   */
  it('should handle form submission with valid data', async () => {
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      name: 'Test Name',
      role: 'Test Role',
      bioParagraphs: ['Test bio'],
      experiences: [],
      email: 'test@example.com',
      phone: '+1234567890',
      location: 'Test Location',
      profileImageUrl: ''
    };

    await component.handleSubmit(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockAboutService.updateAboutContent).toHaveBeenCalled();
  });

  /**
   * Tests form submission with invalid data
   */
  it('should not submit form with invalid data', async () => {
    const event = new Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      name: '',
      role: '',
      bioParagraphs: [''],
      experiences: [],
      email: '',
      phone: '',
      location: '',
      profileImageUrl: ''
    };

    await component.handleSubmit(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockAboutService.updateAboutContent).not.toHaveBeenCalled();
  });

  /**
   * Tests adding biography paragraph
   */
  it('should add biography paragraph', () => {
    const initialLength = component.formData.bioParagraphs.length;
    component.addBioParagraph();
    expect(component.formData.bioParagraphs.length).toBe(initialLength + 1);
  });

  /**
   * Tests removing biography paragraph
   */
  it('should remove biography paragraph', () => {
    component.formData.bioParagraphs = ['Paragraph 1', 'Paragraph 2'];
    const initialLength = component.formData.bioParagraphs.length;
    
    component.removeBioParagraph(0);
    expect(component.formData.bioParagraphs.length).toBe(initialLength - 1);
    expect(component.formData.bioParagraphs[0]).toBe('Paragraph 2');
  });

  /**
   * Tests that biography paragraph cannot be removed when only one remains
   */
  it('should not remove biography paragraph when only one remains', () => {
    component.formData.bioParagraphs = ['Only paragraph'];
    component.removeBioParagraph(0);
    expect(component.formData.bioParagraphs.length).toBe(1);
  });

  /**
   * Tests adding experience
   */
  it('should add experience', () => {
    const initialLength = component.formData.experiences.length;
    component.addExperience();
    expect(component.formData.experiences.length).toBe(initialLength + 1);
    expect(component.formData.experiences[0]).toEqual({
      title: '',
      description: '',
      dateRange: ''
    });
  });

  /**
   * Tests removing experience
   */
  it('should remove experience', () => {
    component.formData.experiences = [
      { title: 'Exp 1', description: 'Desc 1', dateRange: '2020-2021' },
      { title: 'Exp 2', description: 'Desc 2', dateRange: '2021-2022' }
    ];
    
    component.removeExperience(0);
    expect(component.formData.experiences.length).toBe(1);
    expect(component.formData.experiences[0].title).toBe('Exp 2');
  });

  /**
   * Tests language change functionality
   */
  it('should change language', () => {
    component.changeLanguage('en');
    expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('en');
    expect(component.currentLanguage).toBe('en');
  });

  /**
   * Tests image selection and upload
   */
  it('should handle image selection and upload', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } };

    component.onImageSelected(mockEvent);

    expect(mockImageUploadService.isValidImage).toHaveBeenCalledWith(mockFile);
    expect(mockImageUploadService.uploadImage).toHaveBeenCalledWith(mockFile, 'profile-avatars');
  });

  /**
   * Tests image selection with invalid file
   */
  it('should handle invalid image file', () => {
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const mockEvent = { target: { files: [mockFile] } };

    mockImageUploadService.isValidImage.and.returnValue(false);
    spyOn(component, 'showError');

    component.onImageSelected(mockEvent);

    expect(component.showError).toHaveBeenCalledWith('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
  });

  /**
   * Tests error handling during image upload
   */
  it('should handle image upload error', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = { target: { files: [mockFile] } };

    mockImageUploadService.uploadImage.and.returnValue(of('error'));
    spyOn(component, 'showError');

    component.onImageSelected(mockEvent);

    expect(component.showError).toHaveBeenCalledWith('Upload Error', 'Failed to upload image. Please try again.');
  });

  /**
   * Tests error display functionality
   */
  it('should show error modal', () => {
    component.showError('Test Title', 'Test Message');
    expect(component.showErrorModal).toBe(true);
    expect(component.errorTitle).toBe('Test Title');
    expect(component.errorMessage).toBe('Test Message');
  });

  /**
   * Tests error modal hiding
   */
  it('should hide error modal', () => {
    component.showErrorModal = true;
    component.errorTitle = 'Test';
    component.errorMessage = 'Test';

    component.hideError();
    expect(component.showErrorModal).toBe(false);
    expect(component.errorTitle).toBe('');
    expect(component.errorMessage).toBe('');
  });

  /**
   * Tests success message display
   */
  it('should show success message', (done) => {
    component.showSuccess('Test success message');
    expect(component.showSuccessMessage).toBe(true);
    expect(component.successMessage).toBe('Test success message');

    setTimeout(() => {
      expect(component.showSuccessMessage).toBe(false);
      expect(component.successMessage).toBe('');
      done();
    }, 3100);
  });

  /**
   * Tests navigation to admin dashboard
   */
  it('should navigate to admin dashboard', () => {
    component.navigateToAdmin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  /**
   * Tests about content update functionality
   */
  it('should update about content successfully', async () => {
    component.formData = {
      name: 'Updated Name',
      role: 'Updated Role',
      bioParagraphs: ['Updated bio'],
      experiences: [],
      email: 'updated@example.com',
      phone: '+9876543210',
      location: 'Updated Location',
      profileImageUrl: 'https://example.com/updated.jpg'
    };

    await (component as any).updateAboutContent();

    expect(mockAboutService.updateAboutContent).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Updated Name',
      role: 'Updated Role',
      bioParagraphs: ['Updated bio'],
      email: 'updated@example.com',
      phone: '+9876543210',
      location: 'Updated Location',
      profileImageUrl: 'https://example.com/updated.jpg'
    }));
  });

  /**
   * Tests about content update error handling
   */
  it('should handle about content update error', async () => {
    mockAboutService.updateAboutContent.and.returnValue(Promise.reject(new Error('Update failed')));
    spyOn(component, 'showError');

    await (component as any).updateAboutContent();

    expect(component.showError).toHaveBeenCalledWith('Update Error', 'Failed to update about content. Please try again.');
  });

  /**
   * Tests that bio paragraphs are filtered to remove empty ones
   */
  it('should filter empty bio paragraphs on update', async () => {
    component.formData.bioParagraphs = ['Valid paragraph', '', 'Another valid paragraph', ''];

    await (component as any).updateAboutContent();

    expect(mockAboutService.updateAboutContent).toHaveBeenCalledWith(jasmine.objectContaining({
      bioParagraphs: ['Valid paragraph', 'Another valid paragraph']
    }));
  });
}); 