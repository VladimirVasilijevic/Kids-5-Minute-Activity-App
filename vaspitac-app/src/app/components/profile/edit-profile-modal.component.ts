import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProfile } from '../../models/user-profile.model';
import { ImageUploadService } from '../../services/image-upload.service';

/**
 * Modal for editing user profile (name and avatar)
 */
@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent {
  /** Whether the modal is open */
  @Input() isOpen = false;
  /** The user profile to edit */
  @Input() user: UserProfile | null = null;
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();
  /** Emits the updated profile */
  @Output() save = new EventEmitter<{ displayName: string; avatarUrl?: string | null }>();
  /** Emits when an error occurs */
  @Output() error = new EventEmitter<string>();

  // Local state for form fields
  displayName = '';
  avatarUrl: string | null = null;
  avatarFile: File | null = null;
  isUploadingImage = false;
  imagePreview: string | null = null;

  constructor(private _imageUploadService: ImageUploadService) {}

  ngOnChanges(): void {
    if (this.user) {
      this.displayName = this.user.displayName;
      this.avatarUrl = this.user.avatarUrl || null;
      this.imagePreview = this.user.avatarUrl || null;
    }
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!this._imageUploadService.isValidImage(file)) {
        this.error.emit('Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
        return;
      }
      
      this.avatarFile = file;
      this.uploadImage(file);
    }
  }

  private uploadImage(file: File): void {
    this.isUploadingImage = true;
    
    this._imageUploadService.uploadImage(file, 'profile-avatars/').subscribe({
      next: (downloadUrl) => {
        this.avatarUrl = downloadUrl;
        this.imagePreview = downloadUrl;
        this.isUploadingImage = false;
      },
      error: (error: Error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        this.error.emit(error.message || 'Failed to upload image. Please try again.');
      }
    });
  }

  removeAvatar(): void {
    this.avatarUrl = null;
    this.avatarFile = null;
    this.imagePreview = null;
  }

  onSave(event: Event): void {
    event.preventDefault();
    this.save.emit({ displayName: this.displayName, avatarUrl: this.avatarUrl });
  }

  onClose(): void {
    this.close.emit();
  }
} 