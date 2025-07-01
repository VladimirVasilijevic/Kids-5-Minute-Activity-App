import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../models/activity.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
  activity$!: Observable<Activity | undefined>;
  lang!: string;

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.lang = this.translate.currentLang || this.translate.getDefaultLang() || 'sr';
    this.activity$ = combineLatest([
      this.route.paramMap.pipe(map(params => params.get('id'))),
      this.translate.onLangChange.pipe(
        map(e => e.lang as string),
        startWith(this.lang)
      )
    ]).pipe(
      switchMap(([id, lang]) => {
        this.lang = lang;
        if (!id) return of(undefined);
        return this.activityService.getActivityById(id);
      })
    );
  }

  goBack() {
    this.router.navigate(['/activities']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
} 