import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Reusable error notification modal component
 * Displays error messages with action buttons
 */
@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent {
  /** Whether the modal is open */
  @Input() isOpen = false;
  
  /** Error title */
  @Input() title = 'Error';
  
  /** Error message */
  @Input() message = 'An error occurred';
  
  /** Whether to show a retry button */
  @Input() showRetry = false;
  
  /** Whether to show a close button */
  @Input() showClose = true;
  
  /** Retry button text */
  @Input() retryText = 'Retry';
  
  /** Close button text */
  @Input() closeText = 'Close';
  
  /** Emits when the modal should be closed */
  @Output() close = new EventEmitter<void>();
  
  /** Emits when retry is requested */
  @Output() retry = new EventEmitter<void>();

  /**
   * Handles closing the modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handles retry action
   */
  onRetry(): void {
    this.retry.emit();
  }
} 