import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';

/**
 *
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
   *
   * @param activityService
   * @param translate
   * @param router
   * @param route
   */
  constructor(
    private activityService: ActivityService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   *
   */
  ngOnInit() {
    this.lang = this.translate.currentLang || this.translate.getDefaultLang() || 'sr';

    // Handle query parameters for category filtering
    this.route.queryParams.subscribe((params) => {
      const category = params['category'];
      if (category) {
        this.selectedCategory = category;
        this.categoryFilter$.next(category);
      }
    });

    this.activityService.getActivities().subscribe((activities) => {
      this.allActivities = activities;
      this.categories = Array.from(new Set(activities.map((a) => a.category)));
    });

    this.activities$ = combineLatest([
      this.activityService.getActivities(),
      this.translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
      this.categoryFilter$,
    ]).pipe(
      map(([activities, lang, category]) => {
        this.lang = lang;
        return category ? activities.filter((a) => a.category === category) : activities;
      })
    );
  }

  /**
   *
   * @param category
   */
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.categoryFilter$.next(category);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category || null },
      queryParamsHandling: 'merge',
    });
  }

  /**
   *
   * @param id
   */
  goToActivity(id: string | number) {
    this.router.navigate(['/activity', id], {
      queryParams: { category: this.selectedCategory || null },
    });
  }

  /**
   *
   */
  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
