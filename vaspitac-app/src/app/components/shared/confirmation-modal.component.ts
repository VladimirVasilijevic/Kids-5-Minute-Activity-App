import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Reusable confirmation modal component
 * Displays confirmation messages with action buttons
 */
@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  /** Whether the modal is open */
  @Input() isOpen = false;
  
  /** Confirmation title */
  @Input() title = 'Confirm Action';
  
  /** Confirmation message */
  @Input() message = 'Are you sure you want to proceed?';
  
  /** Confirm button text */
  @Input() confirmText = 'Confirm';
  
  /** Cancel button text */
  @Input() cancelText = 'Cancel';
  
  /** Confirm button variant (danger, warning, primary) */
  @Input() confirmVariant: 'danger' | 'warning' | 'primary' = 'danger';
  
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();
  
  /** Emits when confirmation is requested */
  @Output() confirm = new EventEmitter<void>();

  /**
   * Handles closing the modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handles confirmation action
   */
  onConfirm(): void {
    this.confirm.emit();
  }
} 