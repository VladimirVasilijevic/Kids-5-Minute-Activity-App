/**
 * ProfileCardComponent displays a profile card for the logged-in user.
 * Uses Tailwind for styling and i18n for text.
 */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  /** User display name */
  @Input() name = '';
  /** User avatar URL */
  @Input() avatarUrl = '';
  /** Emits when the card is clicked */
  @Output() profileClick = new EventEmitter<void>();

  /** Handle card click */
  onClick(): void {
    this.profileClick.emit();
  }
} 