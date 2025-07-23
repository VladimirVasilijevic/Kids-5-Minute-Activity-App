import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';

import { AdminAboutComponent } from './admin-about.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AboutService } from '../../services/about.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { LanguageService } from '../../services/language.service';
import { UserRole } from '../../models/user-profile.model';
import { mockAdminUser } from '../../../test-utils/mock-user-profiles';
import { mockAboutContent } from '../../../test-utils/mock-about-content';

describe('AdminAboutComponent', () => {
  let component: AdminAboutComponent;
  let fixture: ComponentFixture<AdminAboutComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAboutService: jasmine.SpyObj<AboutService>;
  let mockImageUploadService: jasmine.SpyObj<ImageUploadService>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;
  let mockTranslateService: TranslateService;
  let fb: FormBuilder;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], { user$: of({ uid: 'admin-uid' }) });
    mockUserService = jasmine.createSpyObj('UserService', ['getUserProfile']);
    mockAboutService = jasmine.createSpyObj('AboutService', ['getAboutContent', 'updateAboutContent']);
    mockImageUploadService = jasmine.createSpyObj('ImageUploadService', ['uploadImage', 'isValidImage']);
    mockLanguageService = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage', 'setLanguage']);
    mockTranslateService = {
      instant: (key: string) => key,
      get: (key: string) => of(key),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    } as unknown as TranslateService;

    mockUserService.getUserProfile.and.returnValue(of(mockAdminUser));
    mockAboutService.getAboutContent.and.returnValue(of(mockAboutContent));
    mockAboutService.updateAboutContent.and.resolveTo();
    mockLanguageService.getCurrentLanguage.and.returnValue('en');

    await TestBed.configureTestingModule({
      declarations: [AdminAboutComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: AboutService, useValue: mockAboutService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAboutComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load user profile and about content on initialization', () => {
    fixture.detectChanges();
    expect(mockUserService.getUserProfile).toHaveBeenCalledWith('admin-uid');
    expect(mockAboutService.getAboutContent).toHaveBeenCalled();
    expect(component.aboutContent).toEqual(mockAboutContent);
  });

  it('should initialize form data from about content', () => {
    fixture.detectChanges();
    expect(component.aboutForm.value.name).toBe(mockAboutContent.name);
    expect(component.aboutForm.value.role).toBe(mockAboutContent.role);
    expect(component.imagePreview).toBe(mockAboutContent.profileImageUrl || null);
  });

  it('should correctly identify an admin user', () => {
    fixture.detectChanges();
    expect(component.isAdmin(mockAdminUser)).toBeTrue();
  });

  it('should correctly identify a non-admin user', () => {
    fixture.detectChanges();
    const nonAdminProfile = { ...mockAdminUser, role: UserRole.SUBSCRIBER };
    expect(component.isAdmin(nonAdminProfile)).toBeFalse();
  });

  describe('Form Validation', () => {
    it('should be valid when all required fields are filled', () => {
      fixture.detectChanges();
      component.aboutForm.patchValue({
        name: 'Valid Name',
        role: 'Valid Role',
        email: 'valid@email.com',
        phone: '1234567890',
        location: 'Valid Location'
      });
      component.bioParagraphs.at(0).setValue('Valid bio');
      expect(component.aboutForm.valid).toBeTrue();
    });

    it('should be invalid when required fields are empty', () => {
      fixture.detectChanges();
      component.aboutForm.patchValue({
        name: '',
        role: '',
        email: '',
        phone: '',
        location: ''
      });
      component.bioParagraphs.at(0).setValue('');
      expect(component.aboutForm.invalid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should update about content on valid form submission', async () => {
      fixture.detectChanges();
      component.aboutForm.patchValue(mockAboutContent);
      await component.handleSubmit(new Event('submit'));
      expect(mockAboutService.updateAboutContent).toHaveBeenCalled();
    });

    it('should not update about content on invalid form submission', async () => {
      fixture.detectChanges();
      component.aboutForm.patchValue({ ...mockAboutContent, name: '' });
      await component.handleSubmit(new Event('submit'));
      expect(mockAboutService.updateAboutContent).not.toHaveBeenCalled();
    });

    it('should show success message on successful update', fakeAsync(() => {
      fixture.detectChanges();
      spyOn(component, 'showSuccess');
      mockAboutService.updateAboutContent.and.resolveTo();
      component.aboutForm.patchValue(mockAboutContent);
      component.handleSubmit(new Event('submit'));
      tick();
      expect(component.showSuccess).toHaveBeenCalledWith('About content updated successfully!');
    }));

    it('should show error message on failed update', fakeAsync(() => {
      fixture.detectChanges();
      mockAboutService.updateAboutContent.and.rejectWith(new Error('Update failed'));
      spyOn(component, 'showError');
      component.aboutForm.patchValue(mockAboutContent);
      component.handleSubmit(new Event('submit'));
      tick();
      expect(component.showError).toHaveBeenCalledWith('Update Error', 'Failed to update about content. Please try again.');
    }));
  });

  describe('Bio Paragraphs and Experiences', () => {
    it('should add a new biography paragraph', () => {
      fixture.detectChanges();
      const initialLength = component.bioParagraphs.length;
      component.addBioParagraph();
      expect(component.bioParagraphs.length).toBe(initialLength + 1);
    });

    it('should remove a biography paragraph', () => {
      fixture.detectChanges();
      component.bioParagraphs.clear();
      component.bioParagraphs.push(fb.control('p1'));
      component.bioParagraphs.push(fb.control('p2'));
      component.removeBioParagraph(0);
      expect(component.bioParagraphs.length).toBe(1);
      expect(component.bioParagraphs.at(0).value).toBe('p2');
    });

    it('should add a new experience', () => {
      fixture.detectChanges();
      const initialLength = component.experiences.length;
      component.addExperience();
      expect(component.experiences.length).toBe(initialLength + 1);
    });

    it('should remove an experience', () => {
      fixture.detectChanges();
      component.experiences.clear();
      component.addExperience({ title: 'e1', description: '', dateRange: '' });
      component.removeExperience(0);
      expect(component.experiences.length).toBe(0);
    });
  });

  describe('Image Upload', () => {
    it('should upload a valid image', () => {
      fixture.detectChanges();
      mockImageUploadService.isValidImage.and.returnValue(true);
      mockImageUploadService.uploadImage.and.returnValue(of('http://example.com/new.jpg'));
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } };

      component.onImageSelected(event);

      expect(component.aboutForm.value.profileImageUrl).toBe('http://example.com/new.jpg');
      expect(component.imagePreview).toBe('http://example.com/new.jpg');
    });

    it('should show an error for an invalid image', () => {
      fixture.detectChanges();
      mockImageUploadService.isValidImage.and.returnValue(false);
      spyOn(component, 'showError');
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [file] } };

      component.onImageSelected(event);

      expect(component.showError).toHaveBeenCalled();
    });

    it('should show an error when image upload fails', () => {
        fixture.detectChanges();
        mockImageUploadService.isValidImage.and.returnValue(true);
        mockImageUploadService.uploadImage.and.returnValue(throwError(() => new Error('Upload failed')));
        spyOn(component, 'showError');
        const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const event = { target: { files: [file] } };
    
        component.onImageSelected(event);
    
        expect(component.showError).toHaveBeenCalledWith('Upload Error', 'Failed to upload image. Please try again.');
    });
  });

  it('should change language and reload content', () => {
    fixture.detectChanges();
    component.changeLanguage('sr');
    expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('sr');
    expect(mockAboutService.getAboutContent).toHaveBeenCalled();
  });

  it('should navigate to the admin dashboard', () => {
    fixture.detectChanges();
    component.navigateToAdmin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });
}); 