import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface MockUser {
  id: string;
  displayName: string;
  email: string;
  role: 'admin' | 'subscriber' | 'free_user' | 'trial_user';
  createdAt: string;
  avatarUrl: string;
  isEditing?: boolean;
  isDeleting?: boolean;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent {
  users: MockUser[] = [
    {
      id: '1',
      displayName: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      createdAt: '2024-01-01T12:00:00Z',
      avatarUrl: 'https://ui-avatars.com/api/?name=Test+Admin&background=22c55e&color=fff'
    },
    {
      id: '2',
      displayName: 'Jane Doe',
      email: 'jane@example.com',
      role: 'subscriber',
      createdAt: '2024-02-15T09:30:00Z',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Doe&background=22c55e&color=fff'
    }
  ];
  searchTerm = '';
  filteredUsers: MockUser[] = this.users;
  isUserModalOpen = false;
  isDeleteModalOpen = false;
  selectedUser: MockUser | null = null;
  userFormModel = {
    displayName: '',
    email: '',
    password: '',
    role: 'subscriber' as 'admin' | 'subscriber' | 'free_user' | 'trial_user'
  };

  // Confirmation modal state for reset password
  showResetConfirmModal = false;
  resetConfirmTitle = '';
  resetConfirmMessage = '';
  resetConfirmAction: (() => void) | null = null;

  constructor(private _router: Router) {}

  ngOnInit() {
    this.filterUsers();
  }

  onSearchChange() {
    this.filterUsers();
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.displayName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  openUserModal(user?: MockUser) {
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
        role: 'subscriber'
      };
    }
  }

  closeUserModal() {
    this.isUserModalOpen = false;
    this.selectedUser = null;
  }

  openDeleteModal(user: MockUser) {
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

  resetPassword(user: MockUser) {
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

  getAvatarUrl(user: MockUser) {
    return user.avatarUrl;
  }

  getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'subscriber':
        return 'bg-green-100 text-green-800';
      case 'trial_user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  navigateToAdmin() {
    this._router.navigate(['/admin']);
  }
} 