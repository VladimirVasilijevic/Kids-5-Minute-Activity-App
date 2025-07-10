/**
 * AuthModalComponent provides a modal for user login and registration.
 * Supports email/password and social login, with i18n and validation.
 */
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole, Permission } from '../../models/user-profile.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * Modal component for user authentication (login/register)
 */
@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  /** Whether the modal is open */
  @Input() isOpen = false;
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();

  // Form fields
  email = '';
  password = '';
  name = '';
  isLogin = true;
  isLoading = false;
  error = '';

  // Add state for reset password modal
  showResetPasswordModal = false;
  resetEmail = '';
  resetError: string | null = null;
  resetLoading = false;
  resetSuccess = false;

  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _translate: TranslateService
  ) {}

  /**
   * Switch between login and register modes
   */
  switchMode(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.email = '';
    this.password = '';
    this.name = '';
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handle form submission for login or registration
   * @param event - Form submit event
   */
  async onSubmit(event: { preventDefault(): void }): Promise<void> {
    event.preventDefault();
    this.error = '';
    if (!this.email || !this.password || (!this.isLogin && !this.name)) {
      this.error = this._translate.instant('AUTH.REQUIRED_FIELDS');
      return;
    }
    this.isLoading = true;
    try {
      if (this.isLogin) {
        await this._auth.signIn(this.email, this.password);
      } else {
        const user = await this._auth.signUp(this.email, this.password, this.name);
        if (user) {
          const profile: UserProfile = {
            uid: user.uid,
            displayName: this.name,
            email: this.email,
            avatarUrl: user.photoURL || '',
            createdAt: new Date().toISOString(),
            role: UserRole.FREE_USER,
            permissions: [Permission.VIEW_PROFILE, Permission.EDIT_PROFILE]
          };
          await this._userService.setUserProfile(profile);
        }
      }
      this.onClose();
    } catch (error: unknown) {
      this.error = (error as Error).message || this._translate.instant('AUTH.ERROR_GENERIC');
    } finally {
      this.isLoading = false;
    }
  }

  /** Show the reset password modal */
  onShowResetPassword(): void {
    this.resetEmail = this.email;
    this.resetError = null;
    this.showResetPasswordModal = true;
  }

  /** Handle sending the reset password email from the modal */
  async onSendResetPassword(email: string): Promise<void> {
    this.resetLoading = true;
    this.resetError = null;
    try {
      await this._auth.sendPasswordResetEmail(email);
      this.resetSuccess = true;
      // Do not close the modal immediately; show success message
    } catch (err: unknown) {
      this.resetError = (err as Error).message || 'Došlo je do greške pri slanju emaila za reset lozinke.';
    } finally {
      this.resetLoading = false;
    }
  }

  /** Handle closing the reset password modal */
  onCloseResetPassword(): void {
    this.showResetPasswordModal = false;
    this.resetSuccess = false;
  }

  /**
   * Trigger password reset for the entered email or prompt for email
   */
  forgotPassword(): void {
    this.onShowResetPassword();
  }
} 