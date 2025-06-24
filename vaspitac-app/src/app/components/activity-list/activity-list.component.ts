import { Component, OnInit } from '@angular/core'
import { ActivityService } from '../../services/activity.service'
import { Activity } from '../../models/activity.model'
import { TranslateService } from '@ngx-translate/core'
import { Observable, combineLatest } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  activities$!: Observable<Activity[]>
  lang!: string

  constructor(
    private activityService: ActivityService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.lang = this.translate.currentLang || this.translate.getDefaultLang() || 'sr'
    this.activities$ = combineLatest([
      this.activityService.getActivities(),
      this.translate.onLangChange.pipe(
        map(e => e.lang as string),
        startWith(this.lang)
      )
    ]).pipe(
      map(([activities, lang]) => {
        this.lang = lang
        return activities
      })
    )
  }
} 