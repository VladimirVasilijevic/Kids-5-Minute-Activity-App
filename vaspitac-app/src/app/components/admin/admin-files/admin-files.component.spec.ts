import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AdminFilesComponent } from './admin-files.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { LanguageService } from '../../../services/language.service';
import { DigitalFileService } from '../../../services/digital-file.service';
import { UserProfile, UserRole } from '../../../models/user-profile.model';

describe('AdminFilesComponent', () => {
  let component: AdminFilesComponent;
  let fixture: ComponentFixture<AdminFilesComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockLanguageService: jasmine.SpyObj<LanguageService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockDigitalFileService: jasmine.SpyObj<DigitalFileService>;

  const mockAdminUser: UserProfile = {
    uid: 'admin-uid',
    email: 'admin@test.com',
    displayName: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: '2023-01-01T00:00:00Z',
    permissions: []
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], { user$: of({ uid: 'admin-uid' } as any) });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const languageSpy = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['get']);
    const digitalFileSpy = jasmine.createSpyObj('DigitalFileService', ['getFiles', 'getFile', 'createFile', 'updateFile', 'deleteFile', 'getActiveFiles']);

    await TestBed.configureTestingModule({
      declarations: [AdminFilesComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: LanguageService, useValue: languageSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: DigitalFileService, useValue: digitalFileSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFilesComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    mockLanguageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    mockTranslateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    mockDigitalFileService = TestBed.inject(DigitalFileService) as jasmine.SpyObj<DigitalFileService>;

    // Setup default mocks
    mockUserService.getUserProfile.and.returnValue(of(mockAdminUser));
    mockLanguageService.getCurrentLanguage.and.returnValue('sr');
    mockTranslateService.get.and.returnValue(of('Translated Text'));
    mockDigitalFileService.getFiles.and.returnValue(of([]));
    mockDigitalFileService.getActiveFiles.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.files).toEqual([]);
    expect(component.filteredFiles).toEqual([]);
    expect(component.showForm).toBe(false);
    expect(component.editingFile).toBeNull();
    expect(component.currentLanguage).toBe('sr');
  });

  it('should check if user is admin', () => {
    expect(component.isAdmin(mockAdminUser)).toBe(true);
    
    const nonAdminUser: UserProfile = {
      ...mockAdminUser,
      role: UserRole.SUBSCRIBER
    };
    expect(component.isAdmin(nonAdminUser)).toBe(false);
  });

  it('should navigate to admin dashboard', () => {
    component.navigateToAdmin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show add form', () => {
    component.showAddForm();
    expect(component.showForm).toBe(true);
    expect(component.editingFile).toBeNull();
  });

  it('should reset form', () => {
    component.showForm = true;
    component.editingFile = {} as any;
    component.formData.title = 'Test';
    
    component.resetForm();
    
    expect(component.showForm).toBe(false);
    expect(component.editingFile).toBeNull();
    expect(component.formData.title).toBe('');
  });

  it('should validate form correctly', () => {
    // Test invalid form
    component.formData = {
      title: '',
      description: '',
      priceRSD: 0,
      priceEUR: 0,
      accessLevel: 'BASIC',
      language: 'sr'
    };
    
    const isValid = (component as any).validateForm();
    expect(isValid).toBe(false);
    expect(component.formErrors['title']).toBeTruthy();
    expect(component.formErrors['description']).toBeTruthy();
    expect(component.formErrors['priceRSD']).toBeTruthy();
    expect(component.formErrors['priceEUR']).toBeTruthy();
  });

  it('should filter files correctly', () => {
    component.files = [
      {
        id: '1',
        title: 'Test File 1',
        description: 'Description 1',
        language: 'sr',
        accessLevel: 'BASIC',
        isActive: true
      } as any,
      {
        id: '2',
        title: 'Test File 2',
        description: 'Description 2',
        language: 'en',
        accessLevel: 'PREMIUM',
        isActive: false
      } as any
    ];

    component.searchTerm = 'Test File 1';
    component.filterFiles();
    expect(component.filteredFiles.length).toBe(1);
    expect(component.filteredFiles[0].title).toBe('Test File 1');
  });

  it('should handle file selection validation', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB
    
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    component.onFileSelected(mockEvent);
    expect(component.selectedFile).toBe(mockFile);
    expect(component.filePreview).toBe('test.pdf');
  });

  it('should toggle description preview', () => {
    expect(component.showDescriptionPreview).toBe(false);
    component.toggleDescriptionPreview();
    expect(component.showDescriptionPreview).toBe(true);
    component.toggleDescriptionPreview();
    expect(component.showDescriptionPreview).toBe(false);
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(1024)).toBe('1 KB');
    expect(component.formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(component.formatFileSize(0)).toBe('0 Bytes');
  });
});
