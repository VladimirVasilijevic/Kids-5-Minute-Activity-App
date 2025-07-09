import { Component } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

/**
 * Demo component to showcase SplashScreen functionality
 * Demonstrates different loading scenarios and usage patterns
 */
@Component({
  selector: 'app-splash-demo',
  templateUrl: './splash-demo.component.html',
  styleUrls: ['./splash-demo.component.scss'],
})
export class SplashDemoComponent {
  /**
   * Constructor for SplashDemoComponent
   * @param loadingService - Service for managing loading states
   */
  constructor(private _loadingService: LoadingService) {}

  /**
   * Show basic loading screen
   */
  showBasicLoading(): void {
    this._loadingService.show();
  }

  /**
   * Show loading with custom message
   */
  showLoadingWithMessage(): void {
    this._loadingService.showWithMessage('Loading your data...');
  }

  /**
   * Show loading without spinner
   */
  showLoadingWithoutSpinner(): void {
    this._loadingService.showWithMessage('Processing...', false);
  }

  /**
   * Show loading for specific duration
   */
  showLoadingForDuration(): void {
    this._loadingService.showForDuration(2500, 'Quick loading...');
  }

  /**
   * Show loading while executing async operation
   */
  async showLoadingWhileAsync(): Promise<void> {
    const result = await this._loadingService.showWhile(
      async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'Operation completed!';
      },
      'Processing async operation...'
    );
    
    console.log('Async operation result:', result);
  }

  /**
   * Simulate network call with loading
   */
  async simulateNetworkCall(): Promise<void> {
    try {
      const result = await this._loadingService.showWhile(
        async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate potential error
          if (Math.random() > 0.7) {
            throw new Error('Network error occurred');
          }
          
          return { data: 'Successfully loaded data' };
        },
        'Fetching data from server...'
      );
      
      console.log('Network call result:', result);
    } catch (error) {
      console.error('Network call failed:', error);
    }
  }

  /**
   * Hide the splash screen
   */
  hideSplashScreen(): void {
    this._loadingService.hide();
  }
} 