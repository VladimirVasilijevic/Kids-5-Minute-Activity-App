import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Modal for requesting a password reset email
 */
@Component({
  selector: 'app-reset-password-modal',
  templateUrl: './reset-password-modal.component.html',
  styleUrls: ['./reset-password-modal.component.scss']
})
export class ResetPasswordModalComponent {
  /** Whether the modal is open */
  @Input() isOpen = false;
  /** Email to prefill */
  @Input() email = '';
  /** Loading state */
  @Input() isLoading = false;
  /** Error message */
  @Input() errorMessage: string | null = null;
  /** Whether the email field should be disabled (when pre-filled) */
  @Input() disableEmail = false;
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();
  /** Emits the email to send reset to */
  @Output() send = new EventEmitter<string>();
  @Input() success = false;

  localEmail = '';

  ngOnChanges(): void {
    this.localEmail = this.email || '';
  }

  onSend(): void {
    if (!this.localEmail) return;
    this.send.emit(this.localEmail);
  }

  onClose(): void {
    this.close.emit();
  }
} 