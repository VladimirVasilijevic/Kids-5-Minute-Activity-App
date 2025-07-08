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
  selectedUser: UserProfile | null = null;

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
   * Trigger password reset for the logged-in user
   */
  onResetPassword(): void {
    if (!this.selectedUser || !this.selectedUser.email) {
      window.alert(this._translate.instant('PROFILE.ERROR_NO_EMAIL'));
      return;
    }
    this._auth.sendPasswordResetEmail(this.selectedUser.email)
      .then(() => {
        window.alert(this._translate.instant('PROFILE.RESET_PASSWORD_SUCCESS'));
      })
      .catch((error) => {
        console.error('Password reset email error:', error);
        window.alert(this._translate.instant('PROFILE.ERROR_RESET_PASSWORD'));
      });
  }

  /** Close modals */
  closeEditProfile(): void {
    this.showEditProfileModal = false;
  }
  
  closeChangePassword(): void {
    this.showChangePasswordModal = false;
    this.passwordChangeError = null;
  }
} 