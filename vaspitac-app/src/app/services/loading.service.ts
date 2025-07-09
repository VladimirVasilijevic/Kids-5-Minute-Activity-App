import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface for loading state configuration
 */
export interface LoadingState {
  /** Whether the loading screen is visible */
  isVisible: boolean;
  /** Custom message to display */
  message: string;
  /** Whether to show the spinner */
  showSpinner: boolean;
}

/**
 * Service for managing loading states and splash screen visibility
 * Provides centralized control for showing/hiding loading indicators
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  /** BehaviorSubject for loading state */
  private loadingStateSubject = new BehaviorSubject<LoadingState>({
    isVisible: false,
    message: '',
    showSpinner: true
  });

  /** Observable for loading state changes */
  public loadingState$: Observable<LoadingState> = this.loadingStateSubject.asObservable();

  /**
   * Get current loading state
   * @returns Current loading state
   */
  get currentState(): LoadingState {
    return this.loadingStateSubject.value;
  }

  /**
   * Show loading screen with default settings
   */
  show(): void {
    this.updateState({
      isVisible: true,
      message: '',
      showSpinner: true
    });
  }

  /**
   * Show loading screen with custom message
   * @param message - Custom message to display
   * @param showSpinner - Whether to show spinner (default: true)
   */
  showWithMessage(message: string, showSpinner: boolean = true): void {
    this.updateState({
      isVisible: true,
      message,
      showSpinner
    });
  }

  /**
   * Hide loading screen
   */
  hide(): void {
    this.updateState({
      isVisible: false,
      message: '',
      showSpinner: true
    });
  }

  /**
   * Update loading state
   * @param state - New loading state
   */
  private updateState(state: LoadingState): void {
    this.loadingStateSubject.next(state);
  }

  /**
   * Show loading for a specific duration
   * @param duration - Duration in milliseconds
   * @param message - Optional custom message
   */
  showForDuration(duration: number, message?: string): void {
    this.showWithMessage(message || '', true);
    
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Show loading while executing an async operation
   * @param operation - Async operation to execute
   * @param message - Optional custom message
   * @returns Promise that resolves when operation completes
   */
  async showWhile<T>(operation: () => Promise<T>, message?: string): Promise<T> {
    try {
      this.showWithMessage(message || '', true);
      return await operation();
    } finally {
      this.hide();
    }
  }
} 