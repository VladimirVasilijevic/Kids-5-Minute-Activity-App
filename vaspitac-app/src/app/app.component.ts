import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { UserProfile } from './models/user-profile.model';
import { LanguageService } from './services/language.service';
import { ActivityService } from './services/activity.service';
import { BlogService } from './services/blog.service';
import { LoadingService } from './services/loading.service';
import { Activity } from './models/activity.model';
import { BlogPost } from './models/blog-post.model';

/**
 * Main application component that handles routing and language switching
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  currentLang = 'sr';
  activeRoute = '';
  isSearchOpen = false;
  activities: Activity[] = [];
  blogPosts: BlogPost[] = [];
  private backButtonListener?: PluginListenerHandle;

  userProfile$: Observable<UserProfile | null> = of(null);
  showAuthModal = false;
  loadingState$ = this._loadingService.loadingState$;

  /**
   * Initializes the app component with translation and routing services
   * @param translate - Translation service for i18n support
   * @param router - Angular router for navigation
   * @param location - Location service for back navigation
   * @param languageService - Service for language management
   * @param loadingService - Service for managing loading states
   */
  constructor(
    private translate: TranslateService,
    private _router: Router,
    private _location: Location,
    private _languageService: LanguageService,
    private _activityService: ActivityService,
    private _blogService: BlogService,
    private _loadingService: LoadingService,
    private _auth: AuthService,
    private _userService: UserService
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

    // Register Android hardware back button handler using Capacitor
    this.registerAndroidBackButton();
  }

  ngOnInit(): void {
    this.loadData();
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => user ? this._userService.getUserProfile(user.uid) : of(null))
    );
  }

  ngOnDestroy(): void {
    if (this.backButtonListener) {
      this.backButtonListener.remove();
    }
  }

  /**
   * Register Android hardware back button handler using Capacitor
   */
  private registerAndroidBackButton(): void {
    CapacitorApp.addListener('backButton', ({ canGoBack: _canGoBack }: { canGoBack: boolean }) => {
      // If Angular can go back, do so
      if (window.history.length > 1) {
        this._location.back();
      } else {
        // Otherwise, exit the app
        CapacitorApp.exitApp();
      }
    }).then(listener => {
      this.backButtonListener = listener;
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
    // Reload data with new language
    this.loadData();
  }

  /**
   * Checks if the given route is currently active
   * @param route - The route path to check
   * @returns {boolean} True if the route is active, false otherwise
   */
  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  /**
   * Loads activities and blog posts data for search functionality
   */
  private loadData(): void {
    this._activityService.getActivities(this.currentLang).subscribe(activities => {
      this.activities = activities;
    });

    this._blogService.getBlogPosts(this.currentLang).subscribe(blogPosts => {
      this.blogPosts = blogPosts;
    });
  }

  /**
   * Opens the search overlay
   */
  openSearch(): void {
    this.isSearchOpen = true;
  }

  /**
   * Closes the search overlay
   */
  closeSearch(): void {
    this.isSearchOpen = false;
  }

  /** Open the auth modal */
  openAuthModal(): void {
    this.showAuthModal = true;
  }

  /** Close the auth modal */
  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  /** Handle logout */
  onLogout(): void {
    this._auth.signOut();
  }

  /** Handle profile click */
  onProfileClick(): void {
    this._router.navigate(['/profile']);
  }

  /** Navigate to home page */
  navigateToHome(): void {
    this._router.navigate(['/']);
  }
}
