import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Activity } from '../models/activity.model'
import { FirestoreService } from './firestore.service'

@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(private firestoreService: FirestoreService) {}

  getActivities(): Observable<Activity[]> {
    return this.firestoreService.getActivities()
  }

  getActivityById(id: string): Observable<Activity | undefined> {
    return this.firestoreService.getActivityById(id)
  }
} 