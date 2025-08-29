import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AdminFilesComponent } from './admin-files.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { LanguageService } from '../../../services/language.service';
import { DigitalFileService } from '../../../services/digital-file.service';
import { UserAccessService } from '../../../services/user-access.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { mockAdminUser } from '../../../../test-utils/mock-user-profiles';
import { mockDigitalFiles, mockDigitalFile } from '../../../../test-utils/mock-digital-files';

// Mock the marketplace.utils module
const mockMarketplaceUtils = {
  formatFileSize: (bytes: number) => `${bytes} bytes`,
  validateFileForUpload: (file: File) => ({ isValid: true, error: null })
};

describe('AdminFilesComponent', () => {
  let component: AdminFilesComponent;
  let fixture: ComponentFixture<AdminFilesComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let digitalFileService: jasmine.SpyObj<DigitalFileService>;
  let userAccessService: jasmine.SpyObj<UserAccessService>;
  let fireFunctions: jasmine.SpyObj<AngularFireFunctions>;
  let firestore: jasmine.SpyObj<AngularFirestore>;

  // Mock File object
  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: 'admin123', email: 'admin@example.com' })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const languageSpy = jasmine.createSpyObj('LanguageService', ['getCurrentLanguage']);
    const digitalFileSpy = jasmine.createSpyObj('DigitalFileService', [
      'getFiles', 'createFile', 'updateFile', 'deleteFile', 'toggleFileStatus'
    ]);
    const userAccessSpy = jasmine.createSpyObj('UserAccessService', ['grantAccess']);
    const fireFunctionsSpy = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);
    const firestoreSpy = jasmine.createSpyObj('AngularFirestore', ['collection']);

    // Setup default return values
    userSpy.getUserProfile.and.returnValue(of(mockAdminUser));
    languageSpy.getCurrentLanguage.and.returnValue('sr');
    digitalFileSpy.getFiles.and.returnValue(of(mockDigitalFiles));
    digitalFileSpy.createFile.and.returnValue(Promise.resolve('new-file-id'));
    digitalFileSpy.updateFile.and.returnValue(Promise.resolve());
    digitalFileSpy.deleteFile.and.returnValue(Promise.resolve());
    digitalFileSpy.toggleFileStatus.and.returnValue(Promise.resolve());
    userAccessSpy.grantAccess.and.returnValue(Promise.resolve());

    // Mock Firestore collection
    const collectionSpy = jasmine.createSpyObj('collection', ['ref']);
    const refSpy = jasmine.createSpyObj('ref', ['where', 'limit']);
    const querySpy = jasmine.createSpyObj('query', ['get']);
    const snapshotSpy = jasmine.createSpyObj('snapshot', [], {
      empty: false,
      docs: [{
        id: 'user123',
        data: () => ({ ...mockAdminUser, uid: 'user123' })
      }]
    });

    refSpy.where.and.returnValue(refSpy);
    refSpy.limit.and.returnValue(querySpy);
    querySpy.get.and.returnValue(Promise.resolve(snapshotSpy));
    collectionSpy.ref.and.returnValue(refSpy);
    firestoreSpy.collection.and.returnValue(collectionSpy as any);

    // Mock Firebase Functions
    const callableSpy = jasmine.createSpy().and.returnValue(Promise.resolve({ data: 'success' }));
    fireFunctionsSpy.httpsCallable.and.returnValue(callableSpy);

    await TestBed.configureTestingModule({
      declarations: [AdminFilesComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: LanguageService, useValue: languageSpy },
        { provide: DigitalFileService, useValue: digitalFileSpy },
        { provide: UserAccessService, useValue: userAccessSpy },
        { provide: AngularFireFunctions, useValue: fireFunctionsSpy },
        { provide: AngularFirestore, useValue: firestoreSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFilesComponent);
    component = fixture.componentInstance;
    
    // Initialize component state
    component.files = mockDigitalFiles;
    component.filteredFiles = mockDigitalFiles;
    component.displayedFiles = mockDigitalFiles;
    
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    languageService = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
    digitalFileService = TestBed.inject(DigitalFileService) as jasmine.SpyObj<DigitalFileService>;
    userAccessService = TestBed.inject(UserAccessService) as jasmine.SpyObj<UserAccessService>;
    fireFunctions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
    firestore = TestBed.inject(AngularFirestore) as jasmine.SpyObj<AngularFirestore>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const result = component.isAdmin(mockAdminUser);
      
      expect(result).toBeTrue();
    });

    it('should return false for non-admin user', () => {
      const nonAdminUser = { ...mockAdminUser, role: 'FREE_USER' as any };
      
      const result = component.isAdmin(nonAdminUser);
      
      expect(result).toBeFalse();
    });

    it('should return false for null user', () => {
      const result = component.isAdmin(null);
      
      expect(result).toBeFalse();
    });
  });

  describe('navigateToAdmin', () => {
    it('should navigate to admin dashboard', () => {
      router.navigate.and.returnValue(Promise.resolve(true));
      
      component.navigateToAdmin();
      
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });
  });

  describe('showAddForm', () => {
    it('should show form and reset editing state', () => {
      component.editingFile = mockDigitalFile;
      component.showForm = false;
      
      component.showAddForm();
      
      expect(component.editingFile).toBeNull();
      expect(component.showForm).toBeTrue();
    });
  });

  describe('handleEdit', () => {
    it('should populate form with file data and show form', () => {
      component.showForm = false;
      
      component.handleEdit(mockDigitalFile);
      
      expect(component.editingFile).toBe(mockDigitalFile);
      expect(component.formData.title).toBe(mockDigitalFile.title);
      expect(component.formData.description).toBe(mockDigitalFile.description);
      expect(component.formData.priceRSD).toBe(mockDigitalFile.priceRSD);
      expect(component.formData.priceEUR).toBe(mockDigitalFile.priceEUR);
      expect(component.formData.accessLevel).toBe(mockDigitalFile.accessLevel);
      expect(component.formData.language).toBe(mockDigitalFile.language);
      expect(component.formData.tags).toEqual(mockDigitalFile.tags || []);
      expect(component.filePreview).toBe(mockDigitalFile.fileUrl);
      expect(component.showForm).toBeTrue();
    });
  });

  describe('validateForm', () => {
    it('should return true for valid form', () => {
      component.formData = {
        title: 'Test File',
        description: 'Test Description',
        priceRSD: 1000,
        priceEUR: 10,
        accessLevel: 'BASIC',
        language: 'sr',
        tags: []
      };
      component.selectedFile = createMockFile('test.pdf', 1024, 'application/pdf');
      
      const result = (component as any).validateForm();
      
      expect(result).toBeTrue();
      expect(Object.keys(component.formErrors).length).toBe(0);
    });

    it('should return false and set error for missing title', () => {
      component.formData.title = '';
      
      const result = (component as any).validateForm();
      
      expect(result).toBeFalse();
      expect(component.formErrors['title']).toBe('Title is required');
    });

    it('should return false and set error for missing description', () => {
      component.formData.description = '';
      
      const result = (component as any).validateForm();
      
      expect(result).toBeFalse();
      expect(component.formErrors['description']).toBe('Description is required');
    });

    it('should return false and set error for invalid RSD price', () => {
      component.formData.priceRSD = 0;
      
      const result = (component as any).validateForm();
      
      expect(result).toBeFalse();
      expect(component.formErrors['priceRSD']).toBe('RSD price must be greater than 0');
    });

    it('should return false and set error for invalid EUR price', () => {
      component.formData.priceEUR = -5;
      
      const result = (component as any).validateForm();
      
      expect(result).toBeFalse();
      expect(component.formErrors['priceEUR']).toBe('EUR price must be greater than 0');
    });

    it('should return false and set error for missing file when creating', () => {
      component.editingFile = null;
      component.selectedFile = null;
      
      const result = (component as any).validateForm();
      
      expect(result).toBeFalse();
      expect(component.formErrors['file']).toBe('File is required');
    });
  });

  describe('createFile', () => {
    it('should show error if no file selected', fakeAsync(async () => {
      component.selectedFile = null;
      
      await (component as any).createFile();
      tick();
      
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe('File Required');
      expect(component.errorMessage).toBe('Please select a file to upload.');
      expect(digitalFileService.createFile).not.toHaveBeenCalled();
    }));

    it('should handle creation error', fakeAsync(async () => {
      component.selectedFile = createMockFile('test.pdf', 1024, 'application/pdf');
      digitalFileService.createFile.and.returnValue(Promise.reject(new Error('Creation failed')));
      spyOn(console, 'error');
      
      await (component as any).createFile();
      tick();
      
      expect(console.error).toHaveBeenCalledWith('Error creating file:', jasmine.any(Error));
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe('Error Creating File');
    }));
  });

  describe('updateFile', () => {
    it('should update file successfully', fakeAsync(async () => {
      component.editingFile = mockDigitalFile;
      component.formData = {
        title: 'Updated Title',
        description: 'Updated Description',
        priceRSD: 1500,
        priceEUR: 15,
        accessLevel: 'PREMIUM',
        language: 'en',
        tags: ['updated']
      };
      
      await (component as any).updateFile();
      tick();
      
      expect(digitalFileService.updateFile).toHaveBeenCalledWith(mockDigitalFile.id, {
        title: 'Updated Title',
        description: 'Updated Description',
        priceRSD: 1500,
        priceEUR: 15,
        accessLevel: 'PREMIUM',
        language: 'en',
        tags: ['updated']
      });
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('File updated successfully');
    }));

    it('should handle update error', fakeAsync(async () => {
      component.editingFile = mockDigitalFile;
      digitalFileService.updateFile.and.returnValue(Promise.reject(new Error('Update failed')));
      spyOn(console, 'error');
      
      await (component as any).updateFile();
      tick();
      
      expect(console.error).toHaveBeenCalledWith('Error updating file:', jasmine.any(Error));
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe('Error Updating File');
    }));
  });

  describe('handleDelete', () => {
    it('should set confirmation modal for file deletion', () => {
      component.showConfirmModal = false;
      
      component.handleDelete(mockDigitalFile);
      
      expect(component.confirmTitle).toBe('Delete File');
      expect(component.confirmMessage).toContain(mockDigitalFile.title);
      expect(component.confirmAction).toBeDefined();
      expect(component.showConfirmModal).toBeTrue();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', fakeAsync(async () => {
      await (component as any).deleteFile(mockDigitalFile);
      tick();
      
      expect(digitalFileService.deleteFile).toHaveBeenCalledWith(mockDigitalFile.id);
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('File deleted successfully');
    }));

    it('should handle deletion error', fakeAsync(async () => {
      digitalFileService.deleteFile.and.returnValue(Promise.reject(new Error('Deletion failed')));
      spyOn(console, 'error');
      
      await (component as any).deleteFile(mockDigitalFile);
      tick();
      
      expect(console.error).toHaveBeenCalledWith('Error deleting file:', jasmine.any(Error));
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe('Error Deleting File');
    }));
  });

  describe('toggleFileStatus', () => {
    it('should set confirmation modal for activating file', () => {
      const inactiveFile = { ...mockDigitalFile, isActive: false };
      component.showConfirmModal = false;
      
      component.toggleFileStatus(inactiveFile);
      
      expect(component.confirmTitle).toBe('Activate File');
      expect(component.confirmMessage).toContain(inactiveFile.title);
      expect(component.confirmAction).toBeDefined();
      expect(component.showConfirmModal).toBeTrue();
    });

    it('should set confirmation modal for deactivating file', () => {
      const activeFile = { ...mockDigitalFile, isActive: true };
      component.showConfirmModal = false;
      
      component.toggleFileStatus(activeFile);
      
      expect(component.confirmTitle).toBe('Deactivate File');
      expect(component.confirmMessage).toContain(activeFile.title);
      expect(component.confirmAction).toBeDefined();
      expect(component.showConfirmModal).toBeTrue();
    });
  });

  describe('updateFileStatus', () => {
    it('should update file status successfully', fakeAsync(async () => {
      const file = { ...mockDigitalFile, isActive: true };
      component.files = [file];
      
      await (component as any).updateFileStatus(file, false);
      tick();
      
      expect(digitalFileService.toggleFileStatus).toHaveBeenCalledWith(file.id);
      expect(component.showSuccessMessage).toBeTrue();
      expect(component.successMessage).toBe('File deactivated successfully');
    }));

    it('should handle status update error', fakeAsync(async () => {
      const file = { ...mockDigitalFile, isActive: true };
      digitalFileService.toggleFileStatus.and.returnValue(Promise.reject(new Error('Status update failed')));
      spyOn(console, 'error');
      
      await (component as any).updateFileStatus(file, false);
      tick();
      
      expect(console.error).toHaveBeenCalledWith('Error updating file status:', jasmine.any(Error));
      expect(component.showErrorModal).toBeTrue();
      expect(component.errorTitle).toBe('Error Updating Status');
    }));
  });

  describe('onFileSelected', () => {
    it('should do nothing when no file is selected', () => {
      const event = { target: { files: [] } };
      
      component.onFileSelected(event);
      
      expect(component.selectedFile).toBeNull();
      expect(component.filePreview).toBeNull();
    });
  });

  describe('filterFiles', () => {
    beforeEach(() => {
      component.files = mockDigitalFiles;
    });

    it('should filter files by search term', () => {
      component.searchTerm = 'English';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(1);
      expect(component.filteredFiles[0].title).toContain('English');
    });

    it('should filter files by language', () => {
      component.selectedLanguage = 'en';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(1);
      expect(component.filteredFiles[0].language).toBe('en');
    });

    it('should filter files by access level', () => {
      component.selectedAccessLevel = 'PREMIUM';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(1);
      expect(component.filteredFiles[0].accessLevel).toBe('PREMIUM');
    });

    it('should filter files by status', () => {
      component.selectedStatus = 'active';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(3);
      expect(component.filteredFiles.every(file => file.isActive)).toBeTrue();
    });

    it('should apply multiple filters', () => {
      component.searchTerm = 'Test';
      component.selectedLanguage = 'sr';
      component.selectedAccessLevel = 'BASIC';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(2);
      expect(component.filteredFiles.every(file => 
        file.title.includes('Test') && 
        file.language === 'sr' && 
        file.accessLevel === 'BASIC'
      )).toBeTrue();
    });

    it('should show all files when no filters applied', () => {
      component.searchTerm = '';
      component.selectedLanguage = '';
      component.selectedAccessLevel = '';
      component.selectedStatus = '';
      
      component.filterFiles();
      
      expect(component.filteredFiles.length).toBe(3);
    });
  });

  describe('updateDisplayedFiles', () => {
    it('should update displayed files for pagination', () => {
      component.filteredFiles = mockDigitalFiles;
      component.currentIndex = 0;
      component.itemsPerPage = 2;
      
      (component as any).updateDisplayedFiles();
      
      expect(component.displayedFiles.length).toBe(2);
      expect(component.hasMoreItems).toBeTrue();
    });
  });

  describe('loadMore', () => {
    it('should load more files for infinite scroll', fakeAsync(() => {
      component.filteredFiles = mockDigitalFiles;
      component.currentIndex = 0;
      component.itemsPerPage = 1;
      component.hasMoreItems = true;
      component.isLoadingMore = false;
      
      spyOn(component as any, 'updateDisplayedFiles');
      
      component.loadMore();
      tick(500);
      
      expect(component.currentIndex).toBe(1);
      expect(component.isLoadingMore).toBeFalse();
      expect((component as any).updateDisplayedFiles).toHaveBeenCalled();
    }));

    it('should not load more if already loading', () => {
      component.isLoadingMore = true;
      spyOn(component as any, 'updateDisplayedFiles');
      
      component.loadMore();
      
      expect((component as any).updateDisplayedFiles).not.toHaveBeenCalled();
    });

    it('should not load more if no more items', () => {
      component.hasMoreItems = false;
      spyOn(component as any, 'updateDisplayedFiles');
      
      component.loadMore();
      
      expect((component as any).updateDisplayedFiles).not.toHaveBeenCalled();
    });
  });

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      component.showForm = true;
      component.editingFile = mockDigitalFile;
      component.formData = { ...mockDigitalFile };
      component.selectedFile = createMockFile('test.pdf', 1024, 'application/pdf');
      component.filePreview = 'test.pdf';
      component.formErrors = { title: 'Error' };
      component.showDescriptionPreview = true;
      
      component.resetForm();
      
      expect(component.showForm).toBeFalse();
      expect(component.editingFile).toBeNull();
      expect(component.formData.title).toBe('');
      expect(component.formData.description).toBe('');
      expect(component.formData.priceRSD).toBe(0);
      expect(component.formData.priceEUR).toBe(0);
      expect(component.formData.accessLevel).toBe('BASIC');
      expect(component.formData.language).toBe('sr');
      expect(component.formData.tags).toEqual([]);
      expect(component.selectedFile).toBeNull();
      expect(component.filePreview).toBeNull();
      expect(Object.keys(component.formErrors).length).toBe(0);
      expect(component.showDescriptionPreview).toBeFalse();
    });
  });

  describe('toggleDescriptionPreview', () => {
    it('should toggle description preview state', () => {
      component.showDescriptionPreview = false;
      
      component.toggleDescriptionPreview();
      
      expect(component.showDescriptionPreview).toBeTrue();
      
      component.toggleDescriptionPreview();
      
      expect(component.showDescriptionPreview).toBeFalse();
    });
  });

  describe('closeErrorModal', () => {
    it('should close error modal and clear error message', () => {
      component.showErrorModal = true;
      component.errorMessage = 'Test error';
      component.errorTitle = 'Test title';
      
      component.closeErrorModal();
      
      expect(component.showErrorModal).toBeFalse();
      expect(component.errorMessage).toBe('');
      expect(component.errorTitle).toBe('');
    });
  });

  describe('closeSuccessMessage', () => {
    it('should close success message', () => {
      component.showSuccessMessage = true;
      component.successMessage = 'Test success';
      
      component.closeSuccessMessage();
      
      expect(component.showSuccessMessage).toBeFalse();
      expect(component.successMessage).toBe('');
    });
  });

  describe('handleConfirm', () => {
    it('should execute confirm action and close modal', () => {
      const mockAction = jasmine.createSpy('mockAction');
      component.confirmAction = mockAction;
      spyOn(component, 'closeConfirmModal');
      
      component.handleConfirm();
      
      expect(mockAction).toHaveBeenCalled();
      expect(component.closeConfirmModal).toHaveBeenCalled();
    });
  });

  describe('closeConfirmModal', () => {
    it('should close confirmation modal and clear state', () => {
      component.showConfirmModal = true;
      component.confirmTitle = 'Test title';
      component.confirmMessage = 'Test message';
      component.confirmAction = () => {};
      
      component.closeConfirmModal();
      
      expect(component.showConfirmModal).toBeFalse();
      expect(component.confirmTitle).toBe('');
      expect(component.confirmMessage).toBe('');
      expect(component.confirmAction).toBeNull();
    });
  });

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      const result = component.formatFileSize(1024);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getFileSalesCount', () => {
    it('should return placeholder sales count', () => {
      const result = component.getFileSalesCount('file1');
      
      expect(result).toBe(0);
    });
  });

  describe('openGrantAccessModal', () => {
    it('should open grant access modal with file data', () => {
      component.showGrantAccessModal = false;
      
      component.openGrantAccessModal(mockDigitalFile);
      
      expect(component.selectedFileForAccess).toBe(mockDigitalFile);
      expect(component.userEmailForAccess).toBe('');
      expect(component.adminNotesForAccess).toBe('');
      expect(component.showGrantAccessModal).toBeTrue();
    });
  });

  describe('closeGrantAccessModal', () => {
    it('should close grant access modal and clear data', () => {
      component.showGrantAccessModal = true;
      component.selectedFileForAccess = mockDigitalFile;
      component.userEmailForAccess = 'test@example.com';
      component.adminNotesForAccess = 'Test notes';
      
      component.closeGrantAccessModal();
      
      expect(component.showGrantAccessModal).toBeFalse();
      expect(component.selectedFileForAccess).toBeNull();
      expect(component.userEmailForAccess).toBe('');
      expect(component.adminNotesForAccess).toBe('');
    });
  });

  describe('grantAccess', () => {
    it('should return early if missing file data', fakeAsync(async () => {
      component.selectedFileForAccess = null;
      component.userEmailForAccess = 'user@example.com';
      
      await component.grantAccess();
      tick();
      
      expect(component.showSuccessMessage).toBeFalse();
    }));

    it('should return early if missing user email', fakeAsync(async () => {
      component.selectedFileForAccess = mockDigitalFile;
      component.userEmailForAccess = '';
      
      await component.grantAccess();
      tick();
      
      expect(component.showSuccessMessage).toBeFalse();
    }));
  });

  describe('findUserByEmail', () => {
    it('should return null if user not found', fakeAsync(async () => {
      // Mock empty snapshot
      const collectionSpy = firestore.collection as jasmine.Spy;
      const mockCollection = jasmine.createSpyObj('collection', ['ref']);
      const mockRef = jasmine.createSpyObj('ref', ['where', 'limit']);
      const mockQuery = jasmine.createSpyObj('query', ['get']);
      const mockSnapshot = jasmine.createSpyObj('snapshot', [], { empty: true });
      
      mockRef.where.and.returnValue(mockRef);
      mockRef.limit.and.returnValue(mockQuery);
      mockQuery.get.and.returnValue(Promise.resolve(mockSnapshot));
      mockCollection.ref.and.returnValue(mockRef);
      collectionSpy.and.returnValue(mockCollection);
      
      const result = await (component as any).findUserByEmail('nonexistent@example.com');
      tick();
      
      expect(result).toBeNull();
    }));
  });

  describe('showError', () => {
    it('should show error modal with custom title and message', () => {
      component.showErrorModal = false;
      
      (component as any).showError('Custom Title', 'Custom Message');
      
      expect(component.errorTitle).toBe('Custom Title');
      expect(component.errorMessage).toBe('Custom Message');
      expect(component.showErrorModal).toBeTrue();
    });
  });
});
