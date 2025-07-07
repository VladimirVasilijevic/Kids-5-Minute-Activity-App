import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';

import { LanguageService } from './services/language.service';
import { ActivityService } from './services/activity.service';
import { BlogService } from './services/blog.service';
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
export class AppComponent implements OnInit {
  currentLang = 'sr';
  activeRoute = '';
  isSearchOpen = false;
  activities: Activity[] = [];
  blogPosts: BlogPost[] = [];

  /**
   * Initializes the app component with translation and routing services
   * @param translate - Translation service for i18n support
   * @param router - Angular router for navigation
   * @param languageService - Service for language management
   */
  constructor(
    private translate: TranslateService,
    private _router: Router,
    private _languageService: LanguageService,
    private _activityService: ActivityService,
    private _blogService: BlogService
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

  ngOnInit(): void {
    this.loadData();
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

  /**
   * Loads activities and blog posts data for search functionality
   */
  private loadData(): void {
    this._activityService.getActivities().subscribe(activities => {
      this.activities = activities;
    });

    this._blogService.getBlogPosts().subscribe(blogPosts => {
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
}
