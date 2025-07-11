/**
 * ProfileComponent displays and manages user profile information.
 * Allows users to view and edit their profile details.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  isLoading = true;
  isChangingPassword = false;
  passwordChangeError: string | null = null;

  // Modal state
  showEditProfileModal = false;
  showChangePasswordModal = false;
  showResetPasswordModal = false;
  selectedUser: UserProfile | null = null;
  
  // Reset password modal state
  resetLoading = false;
  resetError: string | null = null;
  resetSuccess = false;

  // Error and success modal state
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';
  showSuccessMessage = false;
  successMessage = '';

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => {
        if (user) {
          return this._userService.getUserProfile(user.uid);
        } else {
          // Redirect to home if not logged in
          this._router.navigate(['/']);
          return of(null);
        }
      })
    );
    this.userProfile$.subscribe(user => {
      this.isLoading = false;
      this.selectedUser = user;
    });
  }

  /** Navigate back to home */
  goBack(): void {
    this._router.navigate(['/']);
  }

  /** Handle logout */
  onLogout(): void {
    this._auth.signOut();
    this._router.navigate(['/']);
  }

  /** Open edit profile modal */
  openEditProfile(): void {
    this.showEditProfileModal = true;
  }

  /**
   * Show the reset password modal
   */
  onResetPassword(): void {
    this.resetError = null;
    this.resetSuccess = false;
    this.showResetPasswordModal = true;
  }

  /**
   * Handle sending the reset password email from the modal
   */
  async onSendResetPassword(email: string): Promise<void> {
    this.resetLoading = true;
    this.resetError = null;
    try {
      await this._auth.sendPasswordResetEmail(email);
      this.resetSuccess = true;
    } catch (error) {
      console.error('Password reset email error:', error);
      this.resetError = (error as Error).message || this._translate.instant('PROFILE.ERROR_RESET_PASSWORD');
    } finally {
      this.resetLoading = false;
    }
  }

  /**
   * Handle closing the reset password modal
   */
  onCloseResetPassword(): void {
    this.showResetPasswordModal = false;
    this.resetSuccess = false;
  }

  /** Close modals */
  closeEditProfile(): void {
    this.showEditProfileModal = false;
  }
  
  closeChangePassword(): void {
    this.showChangePasswordModal = false;
    this.passwordChangeError = null;
  }

  /**
   * Handle saving profile changes from the edit modal
   */
  async onSaveProfile(profileData: { displayName: string; avatarUrl?: string | null }): Promise<void> {
    if (!this.selectedUser) return;

    try {
      // Prepare the update data - only include fields that have values
      const updateData: Partial<UserProfile> = {
        displayName: profileData.displayName,
        updatedAt: new Date().toISOString()
      };

      // Only include avatarUrl if it has a value (not null or undefined)
      if (profileData.avatarUrl) {
        updateData.avatarUrl = profileData.avatarUrl;
      }

      // Update the user profile in Firestore (merge will only update provided fields)
      await this._userService.setUserProfile({
        ...this.selectedUser,
        ...updateData
      });
      
      // Update Firebase Auth display name and photo URL
      const currentUser = await this._auth.getCurrentUser();
      if (currentUser) {
        // Check if avatar URL is too long for Firebase Auth (limit is ~2048 characters)
        let photoURL: string | null = null;
        let avatarUrlTooLong = false;
        
        if (profileData.avatarUrl) {
          if (profileData.avatarUrl.length < 2000) {
            photoURL = profileData.avatarUrl;
          } else {
            // If URL is too long, we'll store it in Firestore but not in Firebase Auth
            console.warn('Avatar URL too long for Firebase Auth, storing only in Firestore');
            avatarUrlTooLong = true;
          }
        }
        
        await currentUser.updateProfile({
          displayName: profileData.displayName,
          photoURL: photoURL
        });
      }
      
      // Update the local user profile
      this.selectedUser = {
        ...this.selectedUser,
        ...updateData
      };
      
      // Close the modal
      this.closeEditProfile();
      
      // Show success message
      if (profileData.avatarUrl && profileData.avatarUrl.length >= 2000) {
        this.showSuccess('Profile updated successfully! (Avatar stored in profile but not synced to account due to URL length)');
      } else {
        this.showSuccess('Profile updated successfully!');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = (error as Error).message || 'Failed to update profile. Please try again.';
      this.showError('Update Error', errorMessage);
    }
  }

  /**
   * Shows error modal with specified message
   * @param title - Error title
   * @param message - Error message
   */
  showError(title: string, message: string): void {
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
} 