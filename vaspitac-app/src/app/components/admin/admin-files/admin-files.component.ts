import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { UserProfile, UserRole } from '../../../models/user-profile.model';
import { DigitalFile, DigitalFileFormData } from '../../../models/digital-file.model';
import { LanguageService } from '../../../services/language.service';
import { ACCESS_LEVELS } from '../../../models/marketplace.constants';
import { formatFileSize, validateFileForUpload } from '../../../models/marketplace.utils';
import { DigitalFileService } from '../../../services/digital-file.service';
import { UserAccessService } from '../../../services/user-access.service';
import { ImageUploadService } from '../../../services/image-upload.service';

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

  // Image upload
  isUploadingImage = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Markdown functionality
  showDescriptionPreview = false;

  // Form data
  formData: DigitalFileFormData & {
    bankAccountNumber?: string;
    phoneNumber?: string;
    author?: string;
    paypalLink?: string;
  } = {
    title: '',
    description: '',
    priceRSD: 0,
    priceEUR: 0,
    accessLevel: 'BASIC',
    language: 'sr' as 'sr' | 'en',
    tags: [],
    imageUrl: '',
    bankAccountNumber: '',
    phoneNumber: '',
    author: '',
    paypalLink: ''
  };

  // Grant access functionality
  showGrantAccessModal = false;
  selectedFileForAccess: DigitalFile | null = null;
  userEmailForAccess = '';
  adminNotesForAccess = '';
  isGrantingAccess = false;

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
    private _translate: TranslateService,
    private _digitalFileService: DigitalFileService,
    private _userAccessService: UserAccessService,
    private _functions: AngularFireFunctions,
    private _afs: AngularFirestore,
    private _imageUploadService: ImageUploadService
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
    this._digitalFileService.getFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.filteredFiles = [...this.files];
        this.updateDisplayedFiles();
      },
      error: (error) => {
        console.error('Error loading files:', error);
        this.showErrorModal = true;
        this.errorTitle = 'Error Loading Files';
        this.errorMessage = 'Failed to load digital files. Please try again.';
      }
    });
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
      tags: file.tags || [],
      imageUrl: file.imageUrl || '',
      bankAccountNumber: file.bankAccountNumber || '',
      phoneNumber: file.phoneNumber || '',
      author: file.author || '',
      paypalLink: file.paypalLink || ''
    };
    this.imagePreview = file.imageUrl || null;
    this.filePreview = file.fileUrl || null;
    this.showForm = true;
  }

  /**
   * Handles form submission
   * @param event - The form submit event
   */
  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    if (this.editingFile) {
      await this.updateFile();
    } else {
      await this.createFile();
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
  private async createFile(): Promise<void> {
    if (!this.selectedFile) {
      this.showErrorModal = true;
      this.errorTitle = 'File Required';
      this.errorMessage = 'Please select a file to upload.';
      return;
    }

    this.isUploadingFile = true;
    
    try {
      const fileId = await this._digitalFileService.createFile(this.formData, this.selectedFile);
      this.isUploadingFile = false;
      this.showSuccessMessage = true;
      this.successMessage = 'File created successfully';
      this.resetForm();
      this.loadFiles();
    } catch (error: any) {
      this.isUploadingFile = false;
      console.error('Error creating file:', error);
      this.showErrorModal = true;
      this.errorTitle = 'Error Creating File';
      this.errorMessage = error.message || 'Failed to create file. Please try again.';
    }
  }

  /**
   * Updates an existing file
   */
  private async updateFile(): Promise<void> {
    if (!this.editingFile) return;

    const updates: Partial<DigitalFile> = {
      title: this.formData.title,
      description: this.formData.description,
      priceRSD: this.formData.priceRSD,
      priceEUR: this.formData.priceEUR,
      accessLevel: this.formData.accessLevel,
      language: this.formData.language,
      tags: this.formData.tags || [],
      imageUrl: this.formData.imageUrl || undefined,
      bankAccountNumber: this.formData.bankAccountNumber || undefined,
      phoneNumber: this.formData.phoneNumber || undefined,
      author: this.formData.author || undefined,
      paypalLink: this.formData.paypalLink || undefined
    };

    try {
      await this._digitalFileService.updateFile(this.editingFile.id, updates);
      this.showSuccessMessage = true;
      this.successMessage = 'File updated successfully';
      this.resetForm();
      this.loadFiles();
    } catch (error: any) {
      console.error('Error updating file:', error);
      this.showErrorModal = true;
      this.errorTitle = 'Error Updating File';
      this.errorMessage = error.message || 'Failed to update file. Please try again.';
    }
  }

  /**
   * Handles file deletion
   * @param file - The file to delete
   */
  handleDelete(file: DigitalFile): void {
    this.confirmTitle = 'Delete File';
    this.confirmMessage = `Are you sure you want to delete "${file.title}"? This action cannot be undone.`;
    this.confirmAction = async () => await this.deleteFile(file);
    this.showConfirmModal = true;
  }

  /**
   * Deletes a file
   * @param file - The file to delete
   */
  private async deleteFile(file: DigitalFile): Promise<void> {
    try {
      await this._digitalFileService.deleteFile(file.id);
      this.showSuccessMessage = true;
      this.successMessage = 'File deleted successfully';
      this.loadFiles();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      this.showErrorModal = true;
      this.errorTitle = 'Error Deleting File';
      this.errorMessage = error.message || 'Failed to delete file. Please try again.';
    }
  }

  /**
   * Toggles file active status
   * @param file - The file to toggle
   */
  toggleFileStatus(file: DigitalFile): void {
    const action = file.isActive ? 'deactivate' : 'activate';
    this.confirmTitle = `${action.charAt(0).toUpperCase() + action.slice(1)} File`;
    this.confirmMessage = `Are you sure you want to ${action} "${file.title}"?`;
    this.confirmAction = async () => await this.updateFileStatus(file, !file.isActive);
    this.showConfirmModal = true;
  }

  /**
   * Updates file status
   * @param file - The file to update
   * @param isActive - New status
   */
  private async updateFileStatus(file: DigitalFile, isActive: boolean): Promise<void> {
    try {
      await this._digitalFileService.toggleFileStatus(file.id);
      // Update the local file object
      const index = this.files.findIndex(f => f.id === file.id);
      if (index !== -1) {
        this.files[index] = { ...this.files[index], isActive };
        this.filterFiles(); // Refresh filtered list
      }
      this.showSuccessMessage = true;
      this.successMessage = `File ${isActive ? 'activated' : 'deactivated'} successfully`;
    } catch (error: any) {
      console.error('Error updating file status:', error);
      this.showErrorModal = true;
      this.errorTitle = 'Error Updating Status';
      this.errorMessage = error.message || 'Failed to update file status. Please try again.';
    }
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
   * Handles image selection for upload
   * @param event - The image input change event
   */
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.isValidImage(file)) {
      this.formErrors['image'] = 'Please select a valid image file (JPG, PNG, WebP) under 5MB.';
      return;
    }

    this.selectedImage = file;
    this.uploadImage(file);
    delete this.formErrors['image'];
  }

  /**
   * Validates image file
   * @param file - The image file to validate
   * @returns True if valid
   */
  private isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Uploads an image to Firebase Storage
   * @param file - The image file to upload
   */
  private uploadImage(file: File): void {
    this.isUploadingImage = true;
    
    this._imageUploadService.uploadImage(file, 'digital-files/images/').subscribe({
      next: (downloadUrl) => {
        this.formData.imageUrl = downloadUrl;
        this.imagePreview = downloadUrl;
        this.isUploadingImage = false;
      },
      error: (error: Error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        this.formErrors['image'] = 'Failed to upload image. Please try again.';
      }
    });
  }

  /**
   * Handles manual image URL input
   */
  onImageUrlChange(): void {
    if (this.formData.imageUrl) {
      this.imagePreview = this.formData.imageUrl;
      delete this.formErrors['image'];
    } else {
      this.imagePreview = null;
    }
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
      tags: [],
      imageUrl: '',
      bankAccountNumber: '',
      phoneNumber: '',
      author: '',
      paypalLink: ''
    };
    this.selectedFile = null;
    this.filePreview = null;
    this.selectedImage = null;
    this.imagePreview = null;
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
    // TODO: Implement sales count retrieval from purchase service
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Opens the grant access modal for a specific file
   * @param file - The file to grant access to
   */
  openGrantAccessModal(file: DigitalFile): void {
    this.selectedFileForAccess = file;
    this.userEmailForAccess = '';
    this.adminNotesForAccess = '';
    this.showGrantAccessModal = true;
  }

  /**
   * Closes the grant access modal
   */
  closeGrantAccessModal(): void {
    this.showGrantAccessModal = false;
    this.selectedFileForAccess = null;
    this.userEmailForAccess = '';
    this.adminNotesForAccess = '';
  }

  /**
   * Grants access to a file for a specific user
   */
  async grantAccess(): Promise<void> {
    console.log('grantAccess() method called');
    console.log('selectedFileForAccess:', this.selectedFileForAccess);
    console.log('userEmailForAccess:', this.userEmailForAccess);
    
    if (!this.selectedFileForAccess || !this.userEmailForAccess) {
      console.log('Missing required data, returning early');
      return;
    }

    this.isGrantingAccess = true;
    console.log('isGrantingAccess set to true');

    try {
      console.log('Finding user by email...');
      // Find user by email - use a direct Firestore query to avoid loading service issues
      const user = await this.findUserByEmail(this.userEmailForAccess);
      console.log('Found user:', user);

      if (!user) {
        console.log('User not found, showing error');
        this.showError('User Not Found', 'No user found with this email address.');
        return;
      }

      console.log('User found successfully:', user);

      console.log('Attempting to grant access...');
      // Grant access using Firebase Function for admin-granted access
      const grantAdminAccess = this._functions.httpsCallable('grantAdminAccess');
      try {
        console.log('Calling grantAdminAccess function...');
        console.log('Parameters being sent:', { 
          userId: user.uid, 
          fileId: this.selectedFileForAccess.id, 
          adminNotes: this.adminNotesForAccess 
        });
        
        const result = await firstValueFrom(grantAdminAccess({ 
          userId: user.uid, 
          fileId: this.selectedFileForAccess.id, 
          adminNotes: this.adminNotesForAccess 
        }));
        
        console.log('grantAdminAccess successful, result:', result);
      } catch (error: any) {
        console.error('Error calling grantAdminAccess:', error);
        console.error('Error details:', {
          message: error?.message,
          code: error?.code,
          details: error?.details
        });
        
        console.log('Falling back to grantFileAccess...');
        // Fallback: try to use the existing grantFileAccess with a dummy purchase ID
        const grantFileAccess = this._functions.httpsCallable('grantFileAccess');
        await grantFileAccess({ 
          userId: user.uid, 
          fileId: this.selectedFileForAccess.id, 
          purchaseId: 'admin-granted-' + Date.now() // Generate a dummy purchase ID
        });
        console.log('grantFileAccess fallback successful');
      }
      
      console.log('Access granted successfully, showing success message');
      this.showSuccessMessage = true;
      this.successMessage = `Access granted to ${this.userEmailForAccess} for ${this.selectedFileForAccess.title}`;
      
      this.closeGrantAccessModal();
      
      // Refresh the files list
      this.loadFiles();
      
    } catch (error) {
      console.error('Error granting access:', error);
      this.showError('Access Grant Failed', 'Failed to grant access. Please try again.');
    } finally {
      console.log('Setting isGrantingAccess to false');
      this.isGrantingAccess = false;
    }
  }

  /**
   * Finds a user by email using direct Firestore query
   * @param email - User email to search for
   * @returns Promise<UserProfile | null>
   */
  private async findUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const usersRef = this._afs.collection<UserProfile>('users');
      const query = usersRef.ref.where('email', '==', email).limit(1);
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData) {
        return null;
      }
      
      return {
        ...userData,
        uid: userDoc.id
      } as UserProfile;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Shows an error modal with custom title and message
   * @param title - Error title
   * @param message - Error message
   */
  private showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }
}
