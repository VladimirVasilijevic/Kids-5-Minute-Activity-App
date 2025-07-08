/**
 * AuthModalComponent provides a modal for user login and registration.
 * Supports email/password and social login, with i18n and validation.
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { TranslateService } from '@ngx-translate/core';



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

  /** True for login, false for register */
  isLogin = true;
  /** Form fields */
  name = '';
  email = '';
  password = '';
  /** Loading state */
  isLoading = false;
  /** Error message */
  error = '';

  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _translate: TranslateService
  ) {}

  /** Switch between login and register mode */
  switchMode(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
  }

  /** Close the modal */
  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  /** Reset form fields and error */
  private resetForm(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.error = '';
    this.isLoading = false;
    this.isLogin = true;
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
            createdAt: new Date().toISOString()
          };
          await this._userService.setUserProfile(profile);
        }
      }
      this.onClose();
    } catch {
      this.error = this._translate.instant('AUTH.ERROR_GENERIC');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle social login (Google, Facebook)
   * @param provider - 'google' | 'facebook'
   */
  async onSocialLogin(provider: string): Promise<void> {
    this.error = '';
    this.isLoading = true;
    try {
      const user = await this._auth.signInWithProvider(provider);
      if (user) {
        const profile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          createdAt: new Date().toISOString()
        };
        await this._userService.setUserProfile(profile);
      }
      this.onClose();
    } catch {
      this.error = this._translate.instant('AUTH.ERROR_SOCIAL');
    } finally {
      this.isLoading = false;
    }
  }
} 