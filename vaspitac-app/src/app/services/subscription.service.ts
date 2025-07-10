/**
 * SubscriptionService handles subscription management and payment processing.
 * Integrates with permission system to manage user access rights.
 */
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of, throwError, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserProfile, UserRole, Subscription, SubscriptionStatus, SubscriptionType, Permission } from '../models/user-profile.model';
import { PermissionService } from './permission.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(
    private _afs: AngularFirestore,
    private _permissionService: PermissionService,
    private _loadingService: LoadingService,
    private _translateService: TranslateService
  ) {}

  /**
   * Create a new subscription for a user
   * @param userId - User's UID
   * @param subscriptionType - Type of subscription
   * @param paymentMethod - Payment method used
   * @returns Observable of the created subscription
   */
  createSubscription(
    userId: string, 
    subscriptionType: SubscriptionType, 
    paymentMethod: string
  ): Observable<Subscription> {
    this._loadingService.showWithMessage(this._translateService.instant('SUBSCRIPTION.CREATING'));
    
    const now = new Date();
    const startDate = now.toISOString();
    
    // Calculate end date based on subscription type
    let endDate: string;
    switch (subscriptionType) {
      case SubscriptionType.MONTHLY:
        endDate = new Date(now.setMonth(now.getMonth() + 1)).toISOString();
        break;
      case SubscriptionType.YEARLY:
        endDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
        break;
      case SubscriptionType.TRIAL:
        endDate = new Date(now.setDate(now.getDate() + 7)).toISOString(); // 7-day trial
        break;
      default:
        return throwError(() => new Error('Invalid subscription type'));
    }

    const subscription: Subscription = {
      status: SubscriptionStatus.ACTIVE,
      type: subscriptionType,
      startDate,
      endDate,
      autoRenew: subscriptionType !== SubscriptionType.TRIAL,
      paymentMethod,
      lastPaymentDate: startDate,
      nextPaymentDate: endDate
    };

    // Update user profile with new subscription and permissions
    return this._afs.doc<UserProfile>(`users/${userId}`).get().pipe(
      switchMap(doc => {
        if (!doc.exists) {
          return throwError(() => new Error('User not found'));
        }

        const userProfile = doc.data() as UserProfile;
        const newRole = subscriptionType === SubscriptionType.TRIAL ? UserRole.TRIAL_USER : UserRole.SUBSCRIBER;
        const newPermissions = this._permissionService.getDefaultPermissionsForRole(newRole);

        const updatedProfile: UserProfile = {
          ...userProfile,
          role: newRole,
          subscription,
          permissions: newPermissions,
          updatedAt: new Date().toISOString()
        };

        return from(this._afs.doc<UserProfile>(`users/${userId}`).set(updatedProfile)).pipe(
          map(() => subscription),
          tap(() => {
            this._loadingService.hide();
          })
        );
      })
    );
  }

  /**
   * Cancel a user's subscription
   * @param userId - User's UID
   * @returns Observable of the updated subscription
   */
  cancelSubscription(userId: string): Observable<Subscription> {
    this._loadingService.showWithMessage(this._translateService.instant('SUBSCRIPTION.CANCELLING'));
    
    return this._afs.doc<UserProfile>(`users/${userId}`).get().pipe(
      switchMap(doc => {
        if (!doc.exists) {
          return throwError(() => new Error('User not found'));
        }

        const userProfile = doc.data() as UserProfile;
        if (!userProfile.subscription) {
          return throwError(() => new Error('No subscription found'));
        }

        const updatedSubscription: Subscription = {
          ...userProfile.subscription,
          status: SubscriptionStatus.CANCELLED,
          autoRenew: false
        };

        const updatedProfile: UserProfile = {
          ...userProfile,
          subscription: updatedSubscription,
          role: UserRole.FREE_USER,
          permissions: this._permissionService.getDefaultPermissionsForRole(UserRole.FREE_USER),
          updatedAt: new Date().toISOString()
        };

        return from(this._afs.doc<UserProfile>(`users/${userId}`).set(updatedProfile)).pipe(
          map(() => updatedSubscription),
          tap(() => {
            this._loadingService.hide();
          })
        );
      })
    );
  }

  /**
   * Renew a user's subscription
   * @param userId - User's UID
   * @returns Observable of the updated subscription
   */
  renewSubscription(userId: string): Observable<Subscription> {
    this._loadingService.showWithMessage(this._translateService.instant('SUBSCRIPTION.RENEWING'));
    
    return this._afs.doc<UserProfile>(`users/${userId}`).get().pipe(
      switchMap(doc => {
        if (!doc.exists) {
          return throwError(() => new Error('User not found'));
        }

        const userProfile = doc.data() as UserProfile;
        if (!userProfile.subscription) {
          return throwError(() => new Error('No subscription found'));
        }

        const now = new Date();
        const lastEndDate = userProfile.subscription.endDate ? new Date(userProfile.subscription.endDate) : now;
        
        // Calculate new end date based on subscription type
        let newEndDate: string;
        switch (userProfile.subscription.type) {
          case SubscriptionType.MONTHLY:
            newEndDate = new Date(lastEndDate.setMonth(lastEndDate.getMonth() + 1)).toISOString();
            break;
          case SubscriptionType.YEARLY:
            newEndDate = new Date(lastEndDate.setFullYear(lastEndDate.getFullYear() + 1)).toISOString();
            break;
          default:
            return throwError(() => new Error('Invalid subscription type for renewal'));
        }

        const updatedSubscription: Subscription = {
          ...userProfile.subscription,
          status: SubscriptionStatus.ACTIVE,
          endDate: newEndDate,
          lastPaymentDate: now.toISOString(),
          nextPaymentDate: newEndDate
        };

        const updatedProfile: UserProfile = {
          ...userProfile,
          subscription: updatedSubscription,
          role: UserRole.SUBSCRIBER,
          permissions: this._permissionService.getDefaultPermissionsForRole(UserRole.SUBSCRIBER),
          updatedAt: new Date().toISOString()
        };

        return from(this._afs.doc<UserProfile>(`users/${userId}`).set(updatedProfile)).pipe(
          map(() => updatedSubscription),
          tap(() => {
            this._loadingService.hide();
          })
        );
      })
    );
  }

  /**
   * Get subscription information for a user
   * @param userId - User's UID
   * @returns Observable of subscription or null
   */
  getSubscription(userId: string): Observable<Subscription | null> {
    this._loadingService.showWithMessage(this._translateService.instant('SUBSCRIPTION.LOADING'));
    
    return this._afs.doc<UserProfile>(`users/${userId}`).valueChanges().pipe(
      map(userProfile => userProfile?.subscription || null),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Check if subscription is expired
   * @param subscription - Subscription to check
   * @returns boolean indicating if subscription is expired
   */
  isSubscriptionExpired(subscription: Subscription): boolean {
    if (subscription.status === SubscriptionStatus.CANCELLED || 
        subscription.status === SubscriptionStatus.EXPIRED) {
      return true;
    }

    if (subscription.endDate) {
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      return endDate < now;
    }

    return false;
  }

  /**
   * Get days remaining in subscription
   * @param subscription - Subscription to check
   * @returns number of days remaining, or 0 if expired
   */
  getDaysRemaining(subscription: Subscription): number {
    if (this.isSubscriptionExpired(subscription) || !subscription.endDate) {
      return 0;
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Process payment for subscription
   * @param amount - Payment amount
   * @param paymentMethod - Payment method
   * @returns Observable of payment result
   */
  processPayment(amount: number, paymentMethod: string): Observable<{ success: boolean; transactionId?: string }> {
    this._loadingService.showWithMessage(this._translateService.instant('SUBSCRIPTION.PROCESSING_PAYMENT'));
    
    // Simulate payment processing
    return of({ success: true, transactionId: `txn_${Date.now()}` }).pipe(
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Get subscription plans
   * @returns Observable of available subscription plans
   */
  getSubscriptionPlans(): Observable<Array<{
    type: SubscriptionType;
    name: string;
    price: number;
    currency: string;
    features: string[];
    trialDays?: number;
  }>> {
    return of([
      {
        type: SubscriptionType.MONTHLY,
        name: 'Monthly Plan',
        price: 9.99,
        currency: 'USD',
        features: [
          'Access to all activities',
          'Premium blog content',
          'Download PDF guides',
          'Download video materials',
          'Priority support'
        ]
      },
      {
        type: SubscriptionType.YEARLY,
        name: 'Yearly Plan',
        price: 99.99,
        currency: 'USD',
        features: [
          'Access to all activities',
          'Premium blog content',
          'Download PDF guides',
          'Download video materials',
          'Priority support',
          '2 months free'
        ]
      },
      {
        type: SubscriptionType.TRIAL,
        name: 'Free Trial',
        price: 0,
        currency: 'USD',
        features: [
          'Access to all activities',
          'Basic blog content',
          '7-day trial period'
        ],
        trialDays: 7
      }
    ]);
  }
} 