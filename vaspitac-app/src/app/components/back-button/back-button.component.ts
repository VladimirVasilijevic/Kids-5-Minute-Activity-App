import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Reusable back button component with customizable label and click event
 */
@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent {
  /** The label to display next to the back arrow */
  @Input() label = 'Nazad';
  /** Emits when the button is clicked */
  @Output() back = new EventEmitter<void>();

  /** Handles click event */
  onClick(): void {
    this.back.emit();
  }
} 