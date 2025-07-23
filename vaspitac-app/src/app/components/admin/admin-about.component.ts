import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
  aboutForm!: FormGroup;

  // Error handling
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';

  // Success handling
  showSuccessMessage = false;
  successMessage = '';

  // Image upload
  isUploadingImage = false;
  imagePreview: string | null = null;

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
    private _fb: FormBuilder,
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
    this.initializeForm();
    this.loadUserProfile();
    this.loadCurrentLanguage();
    this.loadAboutContent();
  }

  /**
   * Initializes the reactive form
   */
  private initializeForm(): void {
    this.aboutForm = this._fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: ['', Validators.required],
      profileImageUrl: [''],
      bioParagraphs: this._fb.array([this._fb.control('', Validators.required)]),
      experiences: this._fb.array([])
    });
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
      this.patchFormWithData();
    });
  }

  /**
   * Patches the form with data from aboutContent
   */
  private patchFormWithData(): void {
    if (this.aboutContent) {
      this.aboutForm.patchValue({
        name: this.aboutContent.name,
        role: this.aboutContent.role,
        email: this.aboutContent.email,
        phone: this.aboutContent.phone,
        location: this.aboutContent.location,
        profileImageUrl: this.aboutContent.profileImageUrl
      });

      this.bioParagraphs.clear();
      this.aboutContent.bioParagraphs.forEach(p => this.bioParagraphs.push(this._fb.control(p, Validators.required)));

      this.experiences.clear();
      this.aboutContent.experiences.forEach(exp => this.addExperience(exp));

      this.imagePreview = this.aboutContent.profileImageUrl || null;
    }
  }

  /**
   * Handles form submission for updating about content
   * @param event - Form submission event
   */
  handleSubmit(event: Event): void {
    event.preventDefault();
    this.aboutForm.markAllAsTouched();

    if (this.aboutForm.invalid) {
      return;
    }

    this.updateAboutContent();
  }

  /**
   * Updates the about content
   */
  private updateAboutContent(): void {
    const formValue = this.aboutForm.value;
    const updatedContent: AboutContent = {
      ...formValue,
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
        this.aboutForm.get('profileImageUrl')?.setValue(url);
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
   * Getter for bioParagraphs FormArray
   */
  get bioParagraphs(): FormArray {
    return this.aboutForm.get('bioParagraphs') as FormArray;
  }

  /**
   * Adds a new biography paragraph
   */
  addBioParagraph(): void {
    this.bioParagraphs.push(this._fb.control('', Validators.required));
  }

  /**
   * Removes a biography paragraph at the specified index
   * @param index - Index of the paragraph to remove
   */
  removeBioParagraph(index: number): void {
    if (this.bioParagraphs.length > 1) {
      this.bioParagraphs.removeAt(index);
    }
  }

  /**
   * Getter for experiences FormArray
   */
  get experiences(): FormArray {
    return this.aboutForm.get('experiences') as FormArray;
  }

  /**
   * Adds a new experience entry
   */
  addExperience(experience?: Experience): void {
    this.experiences.push(this._fb.group({
      title: [experience?.title || '', Validators.required],
      description: [experience?.description || '', Validators.required],
      dateRange: [experience?.dateRange || '', Validators.required]
    }));
  }

  /**
   * Removes an experience entry at the specified index
   * @param index - Index of the experience to remove
   */
  removeExperience(index: number): void {
    this.experiences.removeAt(index);
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