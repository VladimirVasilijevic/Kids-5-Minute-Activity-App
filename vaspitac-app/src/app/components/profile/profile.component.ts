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
import { UserProfile, UserRole } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public UserRole = UserRole;
  userProfile$: Observable<UserProfile | null> = of(null);
  isLoading = true;
  isChangingPassword = false;
  passwordChangeError: string | null = null;

  // Modal state
  showEditProfileModal = false;
  showChangePasswordModal = false;
  showResetPasswordModal = false;
  showDeleteProfileModal = false;
  selectedUser: UserProfile | null = null;
  
  // Reset password modal state
  resetLoading = false;
  resetError: string | null = null;
  resetSuccess = false;

  // Delete profile modal state
  deleteProfilePassword = '';
  deleteProfileLoading = false;
  deleteProfileError: string | null = null;

  // Unsubscribe modal state
  showUnsubscribeModal = false;
  unsubscribeLoading = false;

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

  /**
   * Navigate to subscription page
   */
  navigateToSubscribe(): void {
    this._router.navigate(['/subscribe']);
  }

  /**
   * Manage subscription (placeholder for future implementation)
   */
  manageSubscription(): void {
    // TODO: Implement subscription management
    console.log('Manage subscription clicked');
    this.showSuccess('Subscription management coming soon!');
  }

  /**
   * Cancel subscription (placeholder for future implementation)
   */
  cancelSubscription(): void {
    // TODO: Implement subscription cancellation
    console.log('Cancel subscription clicked');
    this.showSuccess('Subscription cancellation coming soon!');
  }

  /**
   * Renew subscription (placeholder for future implementation)
   */
  renewSubscription(): void {
    // TODO: Implement subscription renewal
    console.log('Renew subscription clicked');
    this.showSuccess('Subscription renewal coming soon!');
  }

  /**
   * Show the unsubscribe confirmation modal
   */
  onUnsubscribe(): void {
    this.showUnsubscribeModal = true;
  }

  /**
   * Confirm unsubscribe action
   */
  async confirmUnsubscribe(): Promise<void> {
    if (!this.selectedUser) {
      return;
    }

    this.unsubscribeLoading = true;

    try {
      // TODO: Implement actual unsubscribe logic with backend
      // For now, just show success message
      console.log('Unsubscribing user:', this.selectedUser.uid);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close modal and show success
      this.closeUnsubscribeModal();
      this.showSuccess(this._translate.instant('PROFILE.UNSUBSCRIBE_SUCCESS'));
      
    } catch (error) {
      console.error('Error unsubscribing:', error);
      const errorMessage = (error as Error).message || this._translate.instant('PROFILE.ERROR_UPDATE_MESSAGE');
      this.showError(this._translate.instant('PROFILE.ERROR_UPDATE_TITLE'), errorMessage);
    } finally {
      this.unsubscribeLoading = false;
    }
  }

  /**
   * Close the unsubscribe modal
   */
  closeUnsubscribeModal(): void {
    this.showUnsubscribeModal = false;
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
   * Show the delete profile modal
   */
  onDeleteProfile(): void {
    this.deleteProfilePassword = '';
    this.deleteProfileError = null;
    this.showDeleteProfileModal = true;
  }

  /**
   * Handle password input change for delete profile
   */
  onDeleteProfilePasswordChange(event: Event): void {
    this.deleteProfilePassword = (event.target as HTMLInputElement).value;
  }

  /**
   * Confirm delete profile with password verification
   */
  async confirmDeleteProfile(): Promise<void> {
    if (!this.selectedUser || !this.deleteProfilePassword) {
      return;
    }

    this.deleteProfileLoading = true;
    this.deleteProfileError = null;

    try {
      // First, verify the password by attempting to re-authenticate
      const currentUser = await this._auth.getCurrentUser();
      if (!currentUser || !currentUser.email) {
        throw new Error(this._translate.instant('PROFILE.ERROR_NO_EMAIL'));
      }

      // Re-authenticate with the provided password
      await this._auth.signIn(currentUser.email, this.deleteProfilePassword!);

      // Now delete the user profile using the new Cloud Function
      await this._userService.deleteOwnProfile({ password: this.deleteProfilePassword }).toPromise();

      // Sign out and redirect to home
      await this._auth.signOut();
      this._router.navigate(['/']);

    } catch (error) {
      console.error('Error deleting profile:', error);
      this.deleteProfileError = (error as Error).message || this._translate.instant('PROFILE.DELETE_PROFILE_ERROR');
      this.showError(
        this._translate.instant('PROFILE.ERROR_UPDATE_TITLE'), 
        this.deleteProfileError || this._translate.instant('PROFILE.DELETE_PROFILE_ERROR')
      );
    } finally {
      this.deleteProfileLoading = false;
    }
  }

  /**
   * Close the delete profile modal
   */
  closeDeleteProfileModal(): void {
    this.showDeleteProfileModal = false;
    this.deleteProfilePassword = '';
    this.deleteProfileError = null;
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
        let _avatarUrlTooLong = false;
        
        if (profileData.avatarUrl) {
          if (profileData.avatarUrl.length < 2000) {
            photoURL = profileData.avatarUrl;
          } else {
            // If URL is too long, we'll store it in Firestore but not in Firebase Auth
            console.warn('Avatar URL too long for Firebase Auth, storing only in Firestore');
            _avatarUrlTooLong = true;
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
        this.showSuccess(this._translate.instant('PROFILE.SUCCESS_UPDATE_AVATAR_LIMIT'));
      } else {
        this.showSuccess(this._translate.instant('PROFILE.SUCCESS_UPDATE'));
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = (error as Error).message || this._translate.instant('PROFILE.ERROR_UPDATE_MESSAGE');
      this.showError(this._translate.instant('PROFILE.ERROR_UPDATE_TITLE'), errorMessage);
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