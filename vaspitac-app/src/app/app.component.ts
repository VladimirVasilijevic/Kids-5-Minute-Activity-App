import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';

import { LanguageService } from './services/language.service';

/**
 * Main application component that handles routing and language switching
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentLang = 'sr';
  activeRoute = '';

  /**
   * Initializes the app component with translation and routing services
   * @param translate - Translation service for i18n support
   * @param router - Angular router for navigation
   * @param languageService - Service for language management
   */
  constructor(
    private translate: TranslateService,
    private _router: Router,
    private _languageService: LanguageService
  ) {
    // Set default language
    translate.setDefaultLang('sr');
    translate.use('sr');
    this.currentLang = 'sr';

    // Listen for route changes
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects;
      }
    });
  }

  /**
   * Switches between Serbian and English languages
   * @returns {void}
   */
  switchLanguage(): void {
    this.currentLang = this.currentLang === 'sr' ? 'en' : 'sr';
    this.translate.use(this.currentLang);
    this._languageService.setLanguage(this.currentLang);
  }

  /**
   * Checks if the given route is currently active
   * @param route - The route path to check
   * @returns {boolean} True if the route is active, false otherwise
   */
  isActive(route: string): boolean {
    return this.activeRoute === route;
  }
}
