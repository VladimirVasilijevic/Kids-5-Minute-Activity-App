import { Component, OnInit } from '@angular/core'
import { ActivityService } from '../../services/activity.service'
import { Activity } from '../../models/activity.model'
import { TranslateService } from '@ngx-translate/core'
import { Observable, combineLatest, BehaviorSubject } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Router } from '@angular/router'

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss']
})
export class ActivityListComponent implements OnInit {
  activities$!: Observable<Activity[]>
  allActivities: Activity[] = []
  categories: string[] = []
  selectedCategory: string = ''
  lang!: string

  private categoryFilter$ = new BehaviorSubject<string>('')

  constructor(
    private activityService: ActivityService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.lang = this.translate.currentLang || this.translate.getDefaultLang() || 'sr'
    this.activityService.getActivities().subscribe(activities => {
      this.allActivities = activities
      this.categories = Array.from(new Set(activities.map(a => a.category)))
    })
    this.activities$ = combineLatest([
      this.activityService.getActivities(),
      this.translate.onLangChange.pipe(
        map(e => e.lang as string),
        startWith(this.lang)
      ),
      this.categoryFilter$
    ]).pipe(
      map(([activities, lang, category]) => {
        this.lang = lang
        return category ? activities.filter(a => a.category === category) : activities
      })
    )
  }

  selectCategory(category: string) {
    this.selectedCategory = category
    this.categoryFilter$.next(category)
  }

  goToActivity(id: string | number) {
    this.router.navigate(['/activity', id])
  }

  goBack() {
    this.router.navigate(['/'])
  }
} 