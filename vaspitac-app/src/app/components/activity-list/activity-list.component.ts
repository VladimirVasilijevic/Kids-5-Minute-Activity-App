import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';

/**
 * Component for displaying and filtering a list of activities
 */
@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
})
export class ActivityListComponent implements OnInit {
  activities$!: Observable<Activity[]>;
  allActivities: Activity[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  lang!: string;

  private categoryFilter$ = new BehaviorSubject<string>('');

  /**
   * Initializes the activity list component with required services
   * @param _activityService - Service for activity data operations
   * @param _translate - Service for internationalization
   * @param _router - Service for navigation
   * @param _route - Service for route parameters
   */
  constructor(
    private _activityService: ActivityService,
    private _translate: TranslateService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  /**
   * Initializes the component by setting up language, loading activities, and configuring filters
   */
  ngOnInit(): void {
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'sr';

    // Handle query parameters for category filtering
    this._route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category) {
        this.selectedCategory = category;
        this.categoryFilter$.next(category);
      }
    });

    this.activities$ = combineLatest([
      this._translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
      this.categoryFilter$,
    ]).pipe(
      switchMap(([lang, category]: [string, string]) => {
        this.lang = lang;
        // Load activities for the current language
        return this._activityService.getActivities(lang).pipe(
          map((activities) => {
            this.allActivities = activities;
            this.categories = Array.from(new Set(activities.map((a) => a.category)));
            return category ? activities.filter((a) => a.category === category) : activities;
          })
        );
      })
    );
  }

  /**
   * Selects a category filter and updates the URL
   * @param category - The category to filter by
   */
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.categoryFilter$.next(category);
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { category: category || null },
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Navigates to the activity detail page
   * @param id - The activity ID to navigate to
   */
  goToActivity(id: string | number): void {
    this._router.navigate(['/activity', id], {
      queryParams: { category: this.selectedCategory || null },
    });
  }

  /**
   * Navigates to subscription page for premium content
   */
  goToSubscription(): void {
    this._router.navigate(['/subscription']);
  }

  /**
   * Navigates back to the home page and scrolls to top
   */
  goBack(): void {
    this._router.navigate(['/']).then(() => {
       
      if (typeof window !== 'undefined' && window) {
         
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
