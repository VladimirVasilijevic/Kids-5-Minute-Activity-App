import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProfile } from '../../models/user-profile.model';

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

  // Local state for form fields
  displayName = '';
  avatarUrl: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatarFile: any = null;

  ngOnChanges(): void {
    if (this.user) {
      this.displayName = this.user.displayName;
      this.avatarUrl = this.user.avatarUrl || null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAvatarChange(event: any): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input = event.target as any;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.avatarFile = file;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reader = new (window as any).FileReader();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reader.onload = (e: any): void => {
        this.avatarUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.avatarUrl = null;
    this.avatarFile = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave(event: any): void {
    event.preventDefault();
    this.save.emit({ displayName: this.displayName, avatarUrl: this.avatarUrl });
  }

  onClose(): void {
    this.close.emit();
  }
} 