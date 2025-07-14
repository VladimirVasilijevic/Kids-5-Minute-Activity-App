import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { ActivityService } from '../../services/activity.service';
import { AdminActivity } from '../../models/admin-activity.model';
import { ImageUploadService } from '../../services/image-upload.service';
import { LanguageService } from '../../services/language.service';
import { CATEGORY_KEYS } from '../../models/category-keys';

/**
 * Admin activities component for managing craft activities and tutorials
 * Provides CRUD operations for activities
 */
@Component({
  selector: 'app-admin-activities',
  templateUrl: './admin-activities.component.html',
  styleUrls: ['./admin-activities.component.scss']
})
export class AdminActivitiesComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  activities: AdminActivity[] = [];
  showForm = false;
  editingActivity: AdminActivity | null = null;
  
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

  // Form validation
  formErrors: { [key: string]: string } = {};

  // Image upload
  isUploadingImage = false;
  imagePreview: string | null = null;

  // Video upload
  isUploadingVideo = false;
  videoPreview: string | null = null;

  formData = {
    title: '',
    description: '',
    materials: '',
    ageGroup: '',
    duration: '30',
    instructions: '',
    image: '',
    video: '',
    category: '',
    language: 'en'
  };

  /** Available age groups for activities */
  ageGroups = [
    'Toddler (1-2 years)',
    'Preschool (3-5 years)',
    'School Age (6-12 years)',
    'Teen (13+ years)',
    'All Ages'
  ];

  /** Available categories for activities */
  categories = Object.values(CATEGORY_KEYS);

  /** Available languages */
  languages = [
    { code: 'en', name: 'English' },
    { code: 'sr', name: 'Serbian' }
  ];

  /**
   * Initializes the admin activities component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param activityService - Activity service for content management
   * @param imageUploadService - Service for image upload functionality
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _activityService: ActivityService,
    private _imageUploadService: ImageUploadService,
    private _translate: TranslateService,
    private _languageService: LanguageService
  ) {}

  /**
   * Initializes component data and loads activities
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadActivities();
  }

  /**
   * Loads the current user's profile
   */
  private loadUserProfile(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => user ? this._userService.getUserProfile(user.uid) : of(null))
    );
  }

  /**
   * Loads activities from the service
   */
  private loadActivities(): void {
    this._activityService.getActivities().subscribe(activities => {
      this.activities = activities.map(activity => ({
        ...activity,
        isEditing: false,
        isDeleting: false
      }));
    });
  }

  /**
   * Handles form submission for creating or editing activities
   * @param event - Form submission event
   */
  handleSubmit(event: globalThis.Event): void {
    event.preventDefault();
    
    // Validate form before submission
    if (!this.validateForm()) {
      return;
    }
    
    if (this.editingActivity) {
      this.updateActivity();
    } else {
      this.createActivity();
    }
  }

  /**
   * Validates the form data
   * @returns True if form is valid, false otherwise
   */
  private validateForm(): boolean {
    this.formErrors = {};
    
    if (!this.formData.title.trim()) {
      this.formErrors['title'] = 'Title is required';
    }
    
    if (!this.formData.description.trim()) {
      this.formErrors['description'] = 'Description is required';
    }
    
    if (!this.formData.ageGroup.trim()) {
      this.formErrors['ageGroup'] = 'Age group is required';
    }
    
    // Duration validation
    if (!this.formData.duration || this.formData.duration.toString().trim() === '') {
      this.formErrors['duration'] = 'Duration is required';
    }
    
    if (!this.formData.instructions.trim()) {
      this.formErrors['instructions'] = 'Instructions are required';
    }
    
    if (!this.formData.category.trim()) {
      this.formErrors['category'] = 'Category is required';
    }
    
    if (!this.formData.language.trim()) {
      this.formErrors['language'] = 'Language is required';
    }
    // Require at least one of image or video
    if (!this.formData.image && !this.formData.video) {
      this.formErrors['media'] = 'Either an image or a video is required.';
    }
    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * Creates a new activity
   */
  private createActivity(): void {
    const newActivity: AdminActivity = {
      id: Date.now().toString(),
      title: this.formData.title,
      description: this.formData.description,
      materials: this.formData.materials ? this.formData.materials.split('\n').filter(line => line.trim() !== '') : [],
      ageGroup: this.formData.ageGroup,
      duration: this.formData.duration ? `${this.formData.duration} min` : '',
      instructions: this.formData.instructions
        ? this.formData.instructions.split(/\r?\n/).filter(line => line.trim() !== '')
        : [],
      imageUrl: this.formData.image || '',
      videoUrl: this.formData.video || '',
      category: this.formData.category,
      language: this.formData.language,
      isEditing: false,
      isDeleting: false,
      createdAt: new Date().toISOString()
    };

    // Create activity in service
    this._activityService.createActivity(newActivity).then(() => {
      // Add to local array after successful creation
      this.activities.push(newActivity);
      this.resetForm();
      this.showSuccess('Activity created successfully!');
    }).catch((error: Error) => {
      console.error('Error creating activity:', error);
      this.showError('Create Error', 'Failed to create activity. Please try again.');
    });
  }

  /**
   * Updates an existing activity
   */
  private updateActivity(): void {
    if (!this.editingActivity) return;

    const updatedActivity: AdminActivity = {
      ...this.editingActivity,
      title: this.formData.title,
      description: this.formData.description,
      materials: this.formData.materials ? this.formData.materials.split('\n').filter(line => line.trim() !== '') : [],
      ageGroup: this.formData.ageGroup,
      duration: this.formData.duration ? `${this.formData.duration} min` : '',
      instructions: this.formData.instructions
        ? this.formData.instructions.split(/\r?\n/).filter(line => line.trim() !== '')
        : [],
      imageUrl: this.formData.image || '',
      videoUrl: this.formData.video || '',
      category: this.formData.category,
      language: this.formData.language
    };

    // Update activity in service
    this._activityService.updateActivity(updatedActivity).then(() => {
      // Update local array after successful update
      const index = this.activities.findIndex(a => a.id === this.editingActivity?.id);
      if (index !== -1) {
        this.activities[index] = updatedActivity;
      }
      this.resetForm();
      this.showSuccess('Activity updated successfully!');
    }).catch((error: Error) => {
      console.error('Error updating activity:', error);
      this.showError('Update Error', 'Failed to update activity. Please try again.');
    });
  }

  /**
   * Resets the form and editing state
   */
  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      materials: '',
      ageGroup: '',
      duration: '30',
      instructions: '',
      image: '',
      video: '',
      category: '',
      language: 'en'
    };
    this.editingActivity = null;
    this.imagePreview = null; // Clear image preview
    this.videoPreview = null; // Clear video preview
    this.showForm = false;
  }

  /**
   * Handles file selection for image upload
   * @param event - File input change event
   */
  onImageSelected(event: globalThis.Event): void {
    const input = event.target as globalThis.HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!this._imageUploadService.isValidImage(file)) {
      this.showError('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
      return;
    }
    
    this.uploadImage(file);
  }

  /**
   * Uploads an image to Firebase Storage
   * @param file - The image file to upload
   */
  private uploadImage(file: globalThis.File): void {
    this.isUploadingImage = true;
    
    this._imageUploadService.uploadImage(file, 'activity-images/').subscribe({
      next: (downloadUrl) => {
        this.formData.image = downloadUrl;
        this.imagePreview = downloadUrl;
        this.isUploadingImage = false;
      },
      error: (error: Error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        
        // Show specific error message based on error type
        let errorMessage = 'Failed to upload image. Please try again.';
        if (error.message) {
          errorMessage = error.message;
        }
        
        this.showError('Upload Error', errorMessage);
      }
    });
  }

  /**
   * Handles drag over event for image upload
   * @param event - Drag over event
   */
  onDragOver(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles drop event for image upload
   * @param event - Drop event
   */
  onDrop(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!this._imageUploadService.isValidImage(file)) {
      this.showError('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
      return;
    }
    
    this.uploadImage(file);
  }

  /**
   * Removes the current image
   */
  removeImage(): void {
    this.formData.image = '';
    this.imagePreview = null;
    // Clear video if image is set
    this.formData.video = '';
    this.videoPreview = null;
  }

  /**
   * Validates if a file is a valid video
   * @param file - The file to validate
   * @returns True if the file is a valid video
   */
  private isValidVideo(file: globalThis.File): boolean {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Handles file selection for video upload
   * @param event - File input change event
   */
  onVideoSelected(event: globalThis.Event): void {
    const input = event.target as globalThis.HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!this.isValidVideo(file)) {
      this.showError('Invalid Video', 'Please select a valid video file (MP4, WebM, OGV) under 50MB.');
      return;
    }
    
    this.uploadVideo(file);
  }

  /**
   * Uploads a video to Firebase Storage
   * @param file - The video file to upload
   */
  private uploadVideo(file: globalThis.File): void {
    this.isUploadingVideo = true;
    
    this._imageUploadService.uploadImage(file, 'activity-videos/').subscribe({
      next: (downloadUrl) => {
        this.formData.video = downloadUrl;
        this.videoPreview = downloadUrl;
        this.isUploadingVideo = false;
      },
      error: (error: Error) => {
        console.error('Error uploading video:', error);
        this.isUploadingVideo = false;
        
        let errorMessage = 'Failed to upload video. Please try again.';
        if (error.message) {
          errorMessage = error.message;
        }
        
        this.showError('Upload Error', errorMessage);
      }
    });
  }

  /**
   * Handles drag over event for video upload
   * @param event - Drag over event
   */
  onDragOverVideo(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles drop event for video upload
   * @param event - Drop event
   */
  onDropVideo(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!this.isValidVideo(file)) {
      this.showError('Invalid Video', 'Please select a valid video file (MP4, WebM, OGV) under 50MB.');
      return;
    }
    
    this.uploadVideo(file);
  }

  /**
   * Removes the current video
   */
  removeVideo(): void {
    this.formData.video = '';
    this.videoPreview = null;
  }

  /**
   * Handles editing an activity
   * @param activity - The activity to edit
   */
  handleEdit(activity: AdminActivity): void {
    this.editingActivity = activity;
    this.formData = {
      title: activity.title,
      description: activity.description,
      materials: activity.materials ? activity.materials.join('\n') : '',
      ageGroup: activity.ageGroup || '',
      duration: activity.duration ? activity.duration.replace(' min', '') : '',
      instructions: activity.instructions ? activity.instructions.join('\n') : '',
      image: activity.imageUrl || '',
      video: activity.videoUrl || '',
      category: activity.category || '',
      language: activity.language || 'en'
    };
    this.imagePreview = activity.imageUrl || null;
    this.videoPreview = activity.videoUrl || null;
    this.showForm = true;
  }

  /**
   * Handles deleting an activity
   * @param activity - The activity to delete
   */
  handleDelete(activity: AdminActivity): void {
    this.confirmTitle = 'Delete Activity';
    this.confirmMessage = `Are you sure you want to delete "${activity.title}"? This action cannot be undone.`;
    this.confirmAction = (): void => {
      // Delete activity from service
      this._activityService.deleteActivity(activity.id).then(() => {
        // Remove from local array after successful deletion
        this.activities = this.activities.filter(a => a.id !== activity.id);
        this.showSuccess('Activity deleted successfully!');
      }).catch((error: Error) => {
        console.error('Error deleting activity:', error);
        this.showError('Delete Error', 'Failed to delete activity. Please try again.');
      });
    };
    this.showConfirmModal = true;
  }

  /**
   * Shows error modal with specified message
   * @param title - Error title
   * @param message - Error message
   */
  private showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  /**
   * Shows success message
   * @param message - Success message
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }

  /**
   * Closes the error modal
   */
  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorTitle = '';
    this.errorMessage = '';
  }

  /**
   * Closes the confirmation modal
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmAction = null;
  }

  /**
   * Handles confirmation action
   */
  onConfirmAction(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.closeConfirmModal();
  }

  /**
   * Navigates back to the admin dashboard
   */
  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
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
   * Formats the creation date for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 