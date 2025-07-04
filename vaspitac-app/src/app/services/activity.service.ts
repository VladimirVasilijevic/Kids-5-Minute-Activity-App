import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, switchMap, map } from 'rxjs'
import { Activity } from '../models/activity.model'
import { LanguageService } from './language.service'

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private http: HttpClient, private languageService: LanguageService) {}

  getActivities(): Observable<Activity[]> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => this.http.get<Activity[]>(`assets/activities_${lang}.json`))
    )
  }

  getActivityById(id: string): Observable<Activity | undefined> {
    return this.getActivities().pipe(map(acts => acts.find(a => a.id === id)))
  }
} 