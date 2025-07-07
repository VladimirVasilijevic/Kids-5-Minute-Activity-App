import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { FirestoreService } from './firestore.service'

@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private firestoreService: FirestoreService) {}

  getBlogPosts(): Observable<any[]> {
    return this.firestoreService.getBlogPosts()
  }
} 