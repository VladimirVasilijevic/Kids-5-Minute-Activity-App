/**
 * UserCardComponent displays the logged-in user's info and logout button.
 * Uses Tailwind for styling and i18n for text.
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent {
  /** User display name */
  @Input() name = '';
  /** User email */
  @Input() email = '';
  /** User avatar URL */
  @Input() avatarUrl = '';
  /** Emits when logout is clicked */
  @Output() logout = new EventEmitter<void>();

  /** Handle logout click */
  onLogout(): void {
    this.logout.emit();
  }
} 