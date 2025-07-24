import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: UserProfile[] = [];
  searchTerm = '';
  filteredUsers: UserProfile[] = [];
  isUserModalOpen = false;
  isDeleteModalOpen = false;
  selectedUser: UserProfile | null = null;
  userFormModel = {
    displayName: '',
    email: '',
    password: '',
    role: UserRole.SUBSCRIBER as UserRole
  };

  // Confirmation modal state for reset password
  showResetConfirmModal = false;
  resetConfirmTitle = '';
  resetConfirmMessage = '';
  resetConfirmAction: (() => void) | null = null;

  // Error and success modal state
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';
  showSuccessMessage = false;
  successMessage = '';

  constructor(private _router: Router, private _userService: UserService) {}

  ngOnInit(): void {
    this._userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  onSearchChange(): void {
    this.filterUsers();
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.displayName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term))
    );
  }

  openUserModal(user?: UserProfile): void {
    this.isUserModalOpen = true;
    if (user) {
      this.selectedUser = user;
      this.userFormModel = {
        displayName: user.displayName,
        email: user.email,
        password: '',
        role: user.role
      };
    } else {
      this.selectedUser = null;
      this.userFormModel = {
        displayName: '',
        email: '',
        password: '',
        role: UserRole.FREE_USER // Default to free user instead of subscriber
      };
    }
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: UserProfile): void {
    this.selectedUser = user;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (!this.selectedUser) {
      // Add user
      this._userService.createUser({
        email: this.userFormModel.email,
        password: this.userFormModel.password,
        displayName: this.userFormModel.displayName,
        role: this.userFormModel.role as UserRole // always send enum value
      })
      .pipe(
        catchError(err => {
          this.showError('Create Error', err?.message || 'Failed to create user.');
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.closeUserModal();
          this.showSuccess('User created successfully!');
          this.ngOnInit(); // reload users
        }
      });
    } else {
      // Update user
      this._userService.updateUser({
        uid: this.selectedUser.uid,
        displayName: this.userFormModel.displayName,
        role: this.userFormModel.role as UserRole // always send enum value
      })
      .pipe(
        catchError(err => {
          this.showError('Update Error', err?.message || 'Failed to update user.');
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.closeUserModal();
          this.showSuccess('User updated successfully!');
          this.ngOnInit(); // reload users
        }
      });
    }
  }

  resetPassword(user: UserProfile): void {
    this.resetConfirmTitle = 'Reset Password';
    this.resetConfirmMessage = `Are you sure you want to send a password reset email to ${user.email}?`;
    this.resetConfirmAction = (): void => {
      this._userService.resetUserPassword({ email: user.email })
        .pipe(
          catchError(err => {
            this.showError('Reset Error', err?.message || 'Failed to send password reset email.');
            return EMPTY;
          })
        )
        .subscribe({
          next: (result: { success: boolean; resetLink?: string; message?: string }) => {
            this.showSuccess('Password reset email sent successfully!');
            // For testing, you can log the reset link
            if (result?.resetLink) {
              // Password reset link generated
            }
          }
        });
    };
    this.showResetConfirmModal = true;
  }

  closeResetConfirmModal(): void {
    this.showResetConfirmModal = false;
    this.resetConfirmTitle = '';
    this.resetConfirmMessage = '';
    this.resetConfirmAction = null;
  }

  onConfirmResetPassword(): void {
    if (this.resetConfirmAction) {
      this.resetConfirmAction();
    }
    this.closeResetConfirmModal();
  }

  confirmDeleteUser(): void {
    if (!this.selectedUser) return;
    
    this._userService.deleteUser({ uid: this.selectedUser.uid })
      .pipe(
        catchError(err => {
          this.showError('Delete Error', err?.message || 'Failed to delete user.');
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.closeDeleteModal();
          this.showSuccess('User deleted successfully!');
          this.ngOnInit(); // reload users
        }
      });
  }

  getAvatarUrl(user: UserProfile): string {
    return user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=22c55e&color=fff`;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.SUBSCRIBER:
        return 'bg-green-100 text-green-800';
      case UserRole.TRIAL_USER:
        return 'bg-blue-100 text-blue-800';
      case UserRole.FREE_USER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get display name for user role
   * @param role - User role
   * @returns Display name for the role
   */
  getRoleDisplayName(role: string): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.SUBSCRIBER:
        return 'Subscriber';
      case UserRole.TRIAL_USER:
        return 'Trial';
      case UserRole.FREE_USER:
        return 'Free';
      default:
        return role;
    }
  }

  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
  }

  showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorTitle = '';
    this.errorMessage = '';
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 4000);
  }
} 