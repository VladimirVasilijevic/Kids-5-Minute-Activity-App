import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { FirestoreService } from './firestore.service'

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private firestoreService: FirestoreService) {}

  getCategories(): Observable<any[]> {
    return this.firestoreService.getCategories()
  }
} 