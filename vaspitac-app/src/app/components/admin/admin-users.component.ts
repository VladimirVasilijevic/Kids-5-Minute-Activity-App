import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';

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

  constructor(private _router: Router, private _userService: UserService) {}

  ngOnInit() {
    this._userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  onSearchChange() {
    this.filterUsers();
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      (user.displayName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term))
    );
  }

  openUserModal(user?: UserProfile) {
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
        role: UserRole.SUBSCRIBER
      };
    }
  }

  closeUserModal() {
    this.isUserModalOpen = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: UserProfile) {
    this.selectedUser = user;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.selectedUser = null;
  }

  saveUser() {
    // Placeholder for save logic
    this.closeUserModal();
  }

  resetPassword(user: UserProfile) {
    this.resetConfirmTitle = 'Reset Password';
    this.resetConfirmMessage = `Are you sure you want to send a password reset email to ${user.email}?`;
    this.resetConfirmAction = () => {
      // Placeholder for reset password logic
      alert('Password reset email sent to ' + user.email);
    };
    this.showResetConfirmModal = true;
  }

  closeResetConfirmModal() {
    this.showResetConfirmModal = false;
    this.resetConfirmTitle = '';
    this.resetConfirmMessage = '';
    this.resetConfirmAction = null;
  }

  onConfirmResetPassword() {
    if (this.resetConfirmAction) {
      this.resetConfirmAction();
    }
    this.closeResetConfirmModal();
  }

  confirmDeleteUser() {
    // Placeholder for delete logic
    this.closeDeleteModal();
  }

  getAvatarUrl(user: UserProfile) {
    return user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=22c55e&color=fff`;
  }

  getRoleBadgeClass(role: string) {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.SUBSCRIBER:
        return 'bg-green-100 text-green-800';
      case UserRole.TRIAL_USER:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  navigateToAdmin() {
    this._router.navigate(['/admin']);
  }
} 