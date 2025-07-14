import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { AboutService } from '../../services/about.service';
import { AboutContent, Experience } from '../../models/about-content.model';
import { ImageUploadService } from '../../services/image-upload.service';
import { LanguageService } from '../../services/language.service';

/**
 * Admin about component for managing about page content
 * Provides editing capabilities for about page sections
 */
@Component({
  selector: 'app-admin-about',
  templateUrl: './admin-about.component.html',
  styleUrls: ['./admin-about.component.scss']
})
export class AdminAboutComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  aboutContent: AboutContent | null = null;
  showForm = false;
  currentLanguage = 'sr';
  availableLanguages = ['sr', 'en'];

  // Error handling
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';

  // Success handling
  showSuccessMessage = false;
  successMessage = '';

  // Form validation
  formErrors: { [key: string]: string } = {};

  // Image upload
  isUploadingImage = false;
  imagePreview: string | null = null;

  formData = {
    name: '',
    role: '',
    bioParagraphs: [''],
    experiences: [] as Experience[],
    email: '',
    phone: '',
    location: '',
    profileImageUrl: ''
  };

  /**
   * Initializes the admin about component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param aboutService - About service for content management
   * @param languageService - Language service for internationalization
   * @param imageUploadService - Service for image upload functionality
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _aboutService: AboutService,
    private _languageService: LanguageService,
    private _imageUploadService: ImageUploadService
  ) {}

  /**
   * Initializes component data and loads about content
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCurrentLanguage();
    this.loadAboutContent();
  }

  /**
   * Loads the current user profile
   */
  private loadUserProfile(): void {
    this._auth.user$.pipe(
      switchMap(user => {
        if (user) {
          return this._userService.getUserProfile(user.uid);
        }
        return of(null);
      })
    ).subscribe(profile => {
      this.userProfile$ = of(profile);
    });
  }

  /**
   * Loads the current language setting
   */
  private loadCurrentLanguage(): void {
    this.currentLanguage = this._languageService.getCurrentLanguage();
  }

  /**
   * Loads about content from the service
   */
  private loadAboutContent(): void {
    this._aboutService.getAboutContent().subscribe(content => {
      this.aboutContent = content;
      this.initializeFormData();
    });
  }

  /**
   * Initializes form data with current about content
   */
  private initializeFormData(): void {
    if (this.aboutContent) {
      this.formData = {
        name: this.aboutContent.name || '',
        role: this.aboutContent.role || '',
        bioParagraphs: [...(this.aboutContent.bioParagraphs || [''])],
        experiences: [...(this.aboutContent.experiences || [])],
        email: this.aboutContent.email || '',
        phone: this.aboutContent.phone || '',
        location: this.aboutContent.location || '',
        profileImageUrl: this.aboutContent.profileImageUrl || ''
      };
      this.imagePreview = this.aboutContent.profileImageUrl || null;
    }
  }

  /**
   * Handles form submission for updating about content
   * @param event - Form submission event
   */
  handleSubmit(event: globalThis.Event): void {
    event.preventDefault();
    
    // Validate form before submission
    if (!this.validateForm()) {
      return;
    }
    
    this.updateAboutContent();
  }

  /**
   * Validates the form data
   * @returns True if form is valid, false otherwise
   */
  private validateForm(): boolean {
    this.formErrors = {};
    
    if (!this.formData.name.trim()) {
      this.formErrors['name'] = 'Name is required';
    }
    
    if (!this.formData.role.trim()) {
      this.formErrors['role'] = 'Role is required';
    }
    
    if (!this.formData.bioParagraphs.length || !this.formData.bioParagraphs[0].trim()) {
      this.formErrors['bioParagraphs'] = 'At least one biography paragraph is required';
    }
    
    if (!this.formData.email.trim()) {
      this.formErrors['email'] = 'Email is required';
    }
    
    if (!this.formData.phone.trim()) {
      this.formErrors['phone'] = 'Phone is required';
    }
    
    if (!this.formData.location.trim()) {
      this.formErrors['location'] = 'Location is required';
    }
    
    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * Updates the about content
   */
  private updateAboutContent(): void {
    const updatedContent: AboutContent = {
      name: this.formData.name,
      role: this.formData.role,
      bioParagraphs: this.formData.bioParagraphs.filter(p => p.trim()),
      experiences: this.formData.experiences,
      email: this.formData.email,
      phone: this.formData.phone,
      location: this.formData.location,
      profileImageUrl: this.formData.profileImageUrl,
      lastUpdated: new Date().toISOString()
    };

    this._aboutService.updateAboutContent(updatedContent).then(() => {
      this.aboutContent = updatedContent;
      this.showForm = false;
      this.showSuccess('About content updated successfully!');
    }).catch((error: Error) => {
      console.error('Error updating about content:', error);
      this.showError('Update Error', 'Failed to update about content. Please try again.');
    });
  }

  /**
   * Handles image selection and upload
   * @param event - File input change event
   */
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!this._imageUploadService.isValidImage(file)) {
      this.showError('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
      return;
    }

    this.isUploadingImage = true;
    this._imageUploadService.uploadImage(file, 'admin-uploads/about-images/').subscribe({
      next: (url: string) => {
        this.formData.profileImageUrl = url;
        this.imagePreview = url;
        this.isUploadingImage = false;
      },
      error: (error: Error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        this.showError('Upload Error', 'Failed to upload image. Please try again.');
      }
    });
  }

  /**
   * Adds a new biography paragraph
   */
  addBioParagraph(): void {
    this.formData.bioParagraphs.push('');
  }

  /**
   * Removes a biography paragraph at the specified index
   * @param index - Index of the paragraph to remove
   */
  removeBioParagraph(index: number): void {
    if (this.formData.bioParagraphs.length > 1) {
      this.formData.bioParagraphs.splice(index, 1);
    }
  }

  /**
   * Adds a new experience entry
   */
  addExperience(): void {
    this.formData.experiences.push({
      title: '',
      description: '',
      dateRange: ''
    });
  }

  /**
   * Removes an experience entry at the specified index
   * @param index - Index of the experience to remove
   */
  removeExperience(index: number): void {
    this.formData.experiences.splice(index, 1);
  }

  /**
   * Changes the current language and reloads content
   * @param language - The language to switch to
   */
  changeLanguage(language: string): void {
    this.currentLanguage = language;
    this._languageService.setLanguage(language);
    this.loadAboutContent();
  }

  /**
   * Shows error modal with specified title and message
   * @param title - Error title
   * @param message - Error message
   */
  showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  /**
   * Hides the error modal
   */
  hideError(): void {
    this.showErrorModal = false;
    this.errorTitle = '';
    this.errorMessage = '';
  }

  /**
   * Shows success message
   * @param message - Success message
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Checks if the current user has admin privileges
   * @param userProfile - The user profile to check
   * @returns True if user is admin, false otherwise
   */
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === UserRole.ADMIN;
  }

  /**
   * Navigates back to the admin dashboard
   */
  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
  }
} 