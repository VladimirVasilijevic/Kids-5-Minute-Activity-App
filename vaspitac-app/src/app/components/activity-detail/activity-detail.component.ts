import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

import { Activity } from '../../models/activity.model';
import { ActivityService } from '../../services/activity.service';

/**
 * Activity detail component for displaying individual activity information
 */
@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss'],
})
export class ActivityDetailComponent implements OnInit {
  activity$!: Observable<Activity | undefined>;
  lang!: string;

  /**
   * Constructor for ActivityDetailComponent
   * @param _route - Activated route service (unused)
   * @param _activityService - Activity service (unused)
   * @param _translate - Translation service (unused)
   * @param _router - Router service (unused)
   */
  constructor(
    private _route: ActivatedRoute,
    private _activityService: ActivityService,
    private _translate: TranslateService,
    private _router: Router
  ) {}

  /**
   * Initialize component by setting up activity observable
   */
  ngOnInit(): void {
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'sr';
    this.activity$ = combineLatest([
      this._route.paramMap.pipe(map((params) => params.get('id'))),
      this._translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
    ]).pipe(
      switchMap(([id, lang]) => {
        this.lang = lang;
        if (!id) return of(undefined);
        return this._activityService.getActivityById(id);
      })
    );
  }

  /**
   * Navigate back to activities list with category filter
   */
  goBack(): void {
    const category = this._route.snapshot.queryParamMap.get('category');
    this._router
      .navigate(['/activities'], {
        queryParams: { category: category || null },
      })
      .then((): void => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }
}
