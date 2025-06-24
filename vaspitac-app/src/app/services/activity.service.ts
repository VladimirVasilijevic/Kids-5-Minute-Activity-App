import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { Activity, ActivitiesData } from '../models/activity.model'

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private data$ = this.http.get<ActivitiesData>('assets/activities.json').pipe(shareReplay(1))
  private lang$ = new BehaviorSubject<string>('sr')

  constructor(private http: HttpClient) {}

  setLanguage(lang: string) {
    this.lang$.next(lang)
  }

  getLanguage(): Observable<string> {
    return this.lang$.asObservable()
  }

  getVersion(): Observable<string> {
    return this.data$.pipe(map(data => data.version))
  }

  getActivities(): Observable<Activity[]> {
    return this.data$.pipe(map(data => data.activities))
  }

  getActivityById(id: string): Observable<Activity | undefined> {
    return this.getActivities().pipe(map(acts => acts.find(a => a.id === id)))
  }
} 