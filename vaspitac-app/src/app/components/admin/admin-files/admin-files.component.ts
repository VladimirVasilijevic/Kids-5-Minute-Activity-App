import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { UserProfile, UserRole } from '../../../models/user-profile.model';
import { DigitalFile, DigitalFileFormData } from '../../../models/digital-file.model';
import { LanguageService } from '../../../services/language.service';
import { ACCESS_LEVELS } from '../../../models/marketplace.constants';
import { formatFileSize, generateId, validateFileForUpload } from '../../../models/marketplace.utils';

/**
 * Admin files component for managing digital files
 * Provides CRUD operations for digital files in the marketplace
 */
@Component({
  selector: 'app-admin-files',
  templateUrl: './admin-files.component.html',
  styleUrls: ['./admin-files.component.scss']
})
export class AdminFilesComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  files: DigitalFile[] = [];
  filteredFiles: DigitalFile[] = [];
  showForm = false;
  editingFile: DigitalFile | null = null;
  currentLanguage = 'sr';
  availableLanguages = ['sr', 'en'];
  
  // Access levels enum for template access
  ACCESS_LEVELS = ACCESS_LEVELS;

  // Search and filters
  searchTerm = '';
  selectedLanguage = '';
  selectedAccessLevel = '';
  selectedStatus = '';

  // Error handling
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';

  // Success handling
  showSuccessMessage = false;
  successMessage = '';

  // Confirmation modal state
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  // Infinite scroll
  displayedFiles: DigitalFile[] = [];
  itemsPerPage = 20;
  currentIndex = 0;
  isLoadingMore = false;
  hasMoreItems = true;

  // Form validation
  formErrors: { [key: string]: string } = {};

  // File upload
  isUploadingFile = false;
  selectedFile: File | null = null;
  filePreview: string | null = null;

  // Markdown functionality
  showDescriptionPreview = false;

  // Form data
  formData: DigitalFileFormData = {
    title: '',
    description: '',
    priceRSD: 0,
    priceEUR: 0,
    accessLevel: 'BASIC',
    language: 'sr' as 'sr' | 'en',
    tags: []
  };

  /**
   * Initializes the admin files component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param languageService - Language service for internationalization
   * @param translate - Translation service
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _languageService: LanguageService,
    private _translate: TranslateService
  ) {}

  /**
   * Initializes component data and loads files
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCurrentLanguage();
    this.loadFiles();
  }

  /**
   * Loads the current user profile
   */
  private loadUserProfile(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => {
        if (user) {
          return this._userService.getUserProfile(user.uid);
        }
        return of(null);
      })
    );
  }

  /**
   * Loads the current language setting
   */
  private loadCurrentLanguage(): void {
    this.currentLanguage = this._languageService.getCurrentLanguage();
  }

  /**
   * Loads all digital files
   */
  private loadFiles(): void {
    // TODO: Implement file loading from service
    this.files = [];
    this.filteredFiles = [...this.files];
    this.updateDisplayedFiles();
  }

  /**
   * Checks if the current user is an admin
   * @param userProfile - The user profile to check
   * @returns True if user is admin
   */
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === UserRole.ADMIN;
  }

  /**
   * Navigates back to admin dashboard
   */
  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
  }

  /**
   * Shows the add new file form
   */
  showAddForm(): void {
    this.editingFile = null;
    this.resetForm();
    this.showForm = true;
  }

  /**
   * Handles editing a file
   * @param file - The file to edit
   */
  handleEdit(file: DigitalFile): void {
    this.editingFile = file;
    this.formData = {
      title: file.title,
      description: file.description,
      priceRSD: file.priceRSD,
      priceEUR: file.priceEUR,
      accessLevel: file.accessLevel,
      language: file.language,
      tags: file.tags || []
    };
    this.filePreview = file.fileUrl || null;
    this.showForm = true;
  }

  /**
   * Handles form submission
   * @param event - The form submit event
   */
  handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    if (this.editingFile) {
      this.updateFile();
    } else {
      this.createFile();
    }
  }

  /**
   * Validates the form data
   * @returns True if form is valid
   */
  private validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.formData.title.trim()) {
      this.formErrors['title'] = 'Title is required';
      isValid = false;
    }

    if (!this.formData.description.trim()) {
      this.formErrors['description'] = 'Description is required';
      isValid = false;
    }

    if (this.formData.priceRSD <= 0) {
      this.formErrors['priceRSD'] = 'RSD price must be greater than 0';
      isValid = false;
    }

    if (this.formData.priceEUR <= 0) {
      this.formErrors['priceEUR'] = 'EUR price must be greater than 0';
      isValid = false;
    }

    if (!this.editingFile && !this.selectedFile) {
      this.formErrors['file'] = 'File is required';
      isValid = false;
    }

    return isValid;
  }

  /**
   * Creates a new file
   */
  private createFile(): void {
    // TODO: Implement file creation
    this.showSuccessMessage = true;
    this.successMessage = 'File created successfully';
    this.resetForm();
    this.loadFiles();
  }

  /**
   * Updates an existing file
   */
  private updateFile(): void {
    if (!this.editingFile) return;

    // TODO: Implement file update
    this.showSuccessMessage = true;
    this.successMessage = 'File updated successfully';
    this.resetForm();
    this.loadFiles();
  }

  /**
   * Handles file deletion
   * @param file - The file to delete
   */
  handleDelete(file: DigitalFile): void {
    this.confirmTitle = 'Delete File';
    this.confirmMessage = `Are you sure you want to delete "${file.title}"? This action cannot be undone.`;
    this.confirmAction = () => this.deleteFile(file);
    this.showConfirmModal = true;
  }

  /**
   * Deletes a file
   * @param file - The file to delete
   */
  private deleteFile(file: DigitalFile): void {
    // TODO: Implement file deletion
    this.showSuccessMessage = true;
    this.successMessage = 'File deleted successfully';
    this.loadFiles();
  }

  /**
   * Toggles file active status
   * @param file - The file to toggle
   */
  toggleFileStatus(file: DigitalFile): void {
    const action = file.isActive ? 'deactivate' : 'activate';
    this.confirmTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} File`;
    this.confirmMessage = `Are you sure you want to ${action} "${file.title}"?`;
    this.confirmAction = () => this.updateFileStatus(file, !file.isActive);
    this.showConfirmModal = true;
  }

  /**
   * Updates file status
   * @param file - The file to update
   * @param isActive - New status
   */
  private updateFileStatus(file: DigitalFile, isActive: boolean): void {
    // TODO: Implement status update
    file.isActive = isActive;
    this.showSuccessMessage = true;
    this.successMessage = `File ${isActive ? 'activated' : 'deactivated'} successfully`;
  }

  /**
   * Handles file selection for upload
   * @param event - The file input change event
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      this.formErrors['file'] = validation.error || 'Invalid file';
      return;
    }

    this.selectedFile = file;
    this.filePreview = file.name;
    delete this.formErrors['file'];
  }

  /**
   * Filters files based on search criteria
   */
  filterFiles(): void {
    this.filteredFiles = this.files.filter(file => {
      const matchesSearch = !this.searchTerm || 
        file.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesLanguage = !this.selectedLanguage || file.language === this.selectedLanguage;
      const matchesAccessLevel = !this.selectedAccessLevel || file.accessLevel === this.selectedAccessLevel;
      const matchesStatus = !this.selectedStatus || 
        (this.selectedStatus === 'active' && file.isActive) ||
        (this.selectedStatus === 'inactive' && !file.isActive);

      return matchesSearch && matchesLanguage && matchesAccessLevel && matchesStatus;
    });
    
    this.currentIndex = 0;
    this.updateDisplayedFiles();
  }

  /**
   * Updates the displayed files for pagination
   */
  private updateDisplayedFiles(): void {
    const end = this.currentIndex + this.itemsPerPage;
    this.displayedFiles = this.filteredFiles.slice(0, end);
    this.hasMoreItems = end < this.filteredFiles.length;
  }

  /**
   * Loads more files for infinite scroll
   */
  loadMore(): void {
    if (this.isLoadingMore || !this.hasMoreItems) return;
    
    this.isLoadingMore = true;
    this.currentIndex += this.itemsPerPage;
    
    setTimeout(() => {
      this.updateDisplayedFiles();
      this.isLoadingMore = false;
    }, 500);
  }

  /**
   * Resets the form to initial state
   */
  resetForm(): void {
    this.showForm = false;
    this.editingFile = null;
    this.formData = {
      title: '',
      description: '',
      priceRSD: 0,
      priceEUR: 0,
      accessLevel: 'BASIC',
      language: this.currentLanguage as 'sr' | 'en',
      tags: []
    };
    this.selectedFile = null;
    this.filePreview = null;
    this.formErrors = {};
    this.showDescriptionPreview = false;
  }

  /**
   * Toggles description preview
   */
  toggleDescriptionPreview(): void {
    this.showDescriptionPreview = !this.showDescriptionPreview;
  }

  /**
   * Closes error modal
   */
  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorMessage = '';
    this.errorTitle = '';
  }

  /**
   * Closes success message
   */
  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
    this.successMessage = '';
  }

  /**
   * Handles confirmation modal confirmation
   */
  handleConfirm(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.closeConfirmModal();
  }

  /**
   * Closes confirmation modal
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmAction = null;
  }

  /**
   * Formats file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size
   */
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  /**
   * Gets the number of sales for a file
   * @param fileId - The file ID
   * @returns Number of sales
   */
  getFileSalesCount(fileId: string): number {
    // TODO: Implement sales count retrieval
    return 0;
  }
}
