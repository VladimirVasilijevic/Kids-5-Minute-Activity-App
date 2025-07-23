import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SubscriptionPlan } from '../models/subscription-plan.model';
import { UserRole } from '../models/user-profile.model';
import { TranslateService } from '@ngx-translate/core';

interface SubscriptionTranslation {
  NAME: string;
  PRICE: string;
  DESCRIPTION: string;
  FEATURES?: string[];
  LIMITATIONS?: string[];
  BUTTON: string;
}

interface SubscriptionTranslations {
  FREE?: SubscriptionTranslation;
  PREMIUM?: SubscriptionTranslation;
}

/**
 * Service for managing subscription plans data
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlansService {

  constructor(
    private _translate: TranslateService
  ) {}

  /**
   * Get subscription plans for the current language
   * @returns Observable of subscription plans array
   */
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this._translate.get('SUBSCRIBE').pipe(
      map(translations => this.buildSubscriptionPlans(translations)),
      catchError(error => {
        console.error('Error loading subscription plans:', error);
        return of([]);
      })
    );
  }

  /**
   * Get subscription plans for a specific language
   * @param language - The language code ('en' or 'sr')
   * @returns Observable of subscription plans array
   */
  getSubscriptionPlansByLanguage(language: string): Observable<SubscriptionPlan[]> {
    return this._translate.getTranslation(language).pipe(
      map(translations => this.buildSubscriptionPlans(translations['SUBSCRIBE'])),
      catchError(error => {
        console.error(`Error loading subscription plans for ${language}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific subscription plan by ID
   * @param planId - The plan ID to find
   * @returns Observable of the found plan or null
   */
  getSubscriptionPlanById(planId: string): Observable<SubscriptionPlan | null> {
    return this.getSubscriptionPlans().pipe(
      map(plans => plans.find(plan => plan.id === planId) || null)
    );
  }

  /**
   * Build subscription plans from translation data
   * @param translations - The SUBSCRIBE section from translations
   * @returns Array of subscription plans
   */
  private buildSubscriptionPlans(translations: SubscriptionTranslations): SubscriptionPlan[] {
    const plans: SubscriptionPlan[] = [];

    // Build Free plan
    if (translations.FREE) {
      plans.push({
        id: UserRole.FREE_USER,
        name: translations.FREE.NAME,
        price: translations.FREE.PRICE,
        description: translations.FREE.DESCRIPTION,
        features: translations.FREE.FEATURES || [],
        limitations: translations.FREE.LIMITATIONS || [],
        buttonText: translations.FREE.BUTTON,
        color: 'border-gray-200',
        popular: false,
        order: 1
      });
    }

    // Build Premium plan
    if (translations.PREMIUM) {
      plans.push({
        id: 'premium',
        name: translations.PREMIUM.NAME,
        price: translations.PREMIUM.PRICE,
        description: translations.PREMIUM.DESCRIPTION,
        features: translations.PREMIUM.FEATURES || [],
        limitations: translations.PREMIUM.LIMITATIONS || [],
        buttonText: translations.PREMIUM.BUTTON,
        color: 'border-teal-500',
        popular: true,
        order: 2
      });
    }

    return plans.sort((a, b) => a.order - b.order);
  }
} 