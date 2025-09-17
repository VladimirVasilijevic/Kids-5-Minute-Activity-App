import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { SubscriptionPlan } from '../../models/subscription-plan.model';
import { SubscriptionPlansService } from '../../services/subscription-plans.service';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Subscription component for managing user subscriptions
 */
@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {
  plans: SubscriptionPlan[] = [];
  userProfile$: Observable<UserProfile | null> = of(null);
  userEmail$: Observable<string> = of('');
  isProcessing = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  errorMessage = '';
  showPaymentModal = false;
  selectedPlan: SubscriptionPlan | null = null;
  private languageSubscription?: Subscription;

  constructor(
    private _router: Router,
    private _translate: TranslateService,
    private _auth: AuthService,
    private _userService: UserService,
    private _subscriptionPlansService: SubscriptionPlansService
  ) {}

  ngOnInit(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => user ? this._userService.getUserProfile(user.uid) : of(null))
    );
    
    // Create userEmail$ observable from userProfile$
    this.userEmail$ = this.userProfile$.pipe(
      switchMap(profile => of(profile?.email || ''))
    );
    
    // Wait for translation service to be ready
    this.languageSubscription = this._translate.onLangChange.subscribe(() => {
      this.loadSubscriptionPlans();
    });
    
    // Initial load
    this.loadSubscriptionPlans();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }
  /**
   * Load subscription plans from JSON files
   */
  private loadSubscriptionPlans(): void {
    this._subscriptionPlansService.getSubscriptionPlans().subscribe(plans => {
      this.plans = plans;
    });
  }

  /**
   * Handle subscription button click
   * @param planId - The plan ID to subscribe to
   */
  handleSubscribe(planId: string): void {
    if (planId === UserRole.FREE_USER) {
      return; // Free plan is current plan
    }

    if (planId === 'premium') {
      this.selectedPlan = this.plans.find(plan => plan.id === planId) || null;
      this.openPaymentModal();
    }
  }

  /**
   * Process mock payment flow
   */
  private processMockPayment(): void {
    this.isProcessing = true;
    this.hideMessages();

    // Simulate payment processing
    setTimeout(() => {
      this.isProcessing = false;
      
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        this.showSuccessMessage = true;
        this.showSuccess(this._translate.instant('SUBSCRIBE.PAYMENT.SUCCESS'));
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          this._router.navigate(['/']);
        }, 2000);
      } else {
        this.showErrorMessage = true;
        this.errorMessage = this._translate.instant('SUBSCRIBE.PAYMENT.ERROR');
      }
    }, 2000);
  }

  /**
   * Navigate back to home
   */
  goBack(): void {
    this._router.navigate(['/']);
  }

  /**
   * Navigate to about page
   */
  navigateToAbout(): void {
    this._router.navigate(['/about'], { fragment: 'contact' });
  }

  /**
   * Show success message
   * @param _message - Success message to display
   */
  private showSuccess(_message: string): void {
    // This would typically use a toast service
    // Success
  }

  /**
   * Hide all messages
   */
  private hideMessages(): void {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
    this.errorMessage = '';
  }

  /**
   * Check if user is already subscribed
   * @param userProfile - User profile to check
   * @returns True if user has active subscription
   */
  isSubscribed(userProfile: UserProfile | null): boolean {
    if (!userProfile) return false;
    return userProfile.role === UserRole.SUBSCRIBER || 
           userProfile.role === UserRole.ADMIN ||
           (userProfile.subscription?.status === 'active' || 
            userProfile.subscription?.status === 'trial');
  }

  /**
   * Opens the payment instructions modal
   */
  openPaymentModal(): void {
    this.showPaymentModal = true;
  }

  /**
   * Closes the payment instructions modal
   */
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPlan = null;
  }

  /**
   * Copies PayPal link to clipboard
   */
  copyPayPalLink(): void {
    const paypalLink = 'https://paypal.me/anavaspitac?country.x=RS&locale.x=en_US';
    navigator.clipboard.writeText(paypalLink).then(() => {
      // PayPal link copied successfully
    }).catch(err => {
      console.error('Failed to copy PayPal link:', err);
    });
  }

  /**
   * Copies bank details to clipboard
   */
  copyBankDetails(): void {
    const phoneNumber = '+381 61 634 9493';
    const bankDetails = `Broj računa: ${this._translate.instant('SHOP.BANK_ACCOUNT')}
Primalac: ${this._translate.instant('SHOP.BANK_RECIPIENT')}
Telefon (Viber): ${phoneNumber}`;
    
    navigator.clipboard.writeText(bankDetails).then(() => {
      // Bank details copied successfully
    }).catch(err => {
      console.error('Failed to copy bank details:', err);
    });
  }

  /**
   * Get current plan for user
   * @param userProfile - User profile to check
   * @returns Current plan ID
   */
  getCurrentPlan(userProfile: UserProfile | null): string {
    if (!userProfile) return UserRole.FREE_USER;
    
    if (userProfile.role === UserRole.ADMIN) return 'premium';
    if (userProfile.role === UserRole.SUBSCRIBER) return 'premium';
    if (userProfile.subscription?.status === 'active' || 
        userProfile.subscription?.status === 'trial') return 'premium';
    
    return UserRole.FREE_USER;
  }
} 