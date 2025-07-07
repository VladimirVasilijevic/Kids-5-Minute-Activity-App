import { Injectable } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { HttpClient } from '@angular/common/http'
import { Observable, of, catchError, switchMap } from 'rxjs'
import { Activity } from '../models/activity.model'
import { LanguageService } from './language.service'

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(
    private firestore: AngularFirestore,
    private http: HttpClient,
    private languageService: LanguageService
  ) {}

  /**
   * Get activities from Firestore with JSON fallback
   */
  getActivities(): Observable<Activity[]> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => {
        // Try Firestore first
        return this.firestore
          .collection<Activity>(`activities_${lang}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              // Fallback to JSON if Firestore fails
              console.log(`Falling back to JSON for activities_${lang}`)
              return this.http.get<Activity[]>(`assets/activities_${lang}.json`)
            })
          )
      })
    )
  }

  /**
   * Get activity by ID from Firestore with JSON fallback
   */
  getActivityById(id: string): Observable<Activity | undefined> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => {
        // Try Firestore first
        return this.firestore
          .doc<Activity>(`activities_${lang}/${id}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              // Fallback to JSON if Firestore fails
              console.log(`Falling back to JSON for activity ${id}`)
              return this.http
                .get<Activity[]>(`assets/activities_${lang}.json`)
                .pipe(
                  switchMap(activities => 
                    of(activities.find(activity => activity.id === id))
                  )
                )
            })
          )
      })
    )
  }

  /**
   * Get categories from Firestore with JSON fallback
   */
  getCategories(): Observable<any[]> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => {
        return this.firestore
          .collection(`categories_${lang}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              console.log(`Falling back to JSON for categories_${lang}`)
              return this.http.get<any[]>(`assets/categories_${lang}.json`)
            })
          )
      })
    )
  }

  /**
   * Get blog posts from Firestore with JSON fallback
   */
  getBlogPosts(): Observable<any[]> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => {
        return this.firestore
          .collection(`blog_${lang}`)
          .valueChanges()
          .pipe(
            catchError((error) => {
              console.log(`Falling back to JSON for blog_${lang}`, error)
              return this.http.get<any[]>(`assets/blog-posts_${lang}.json`)
            })
          )
      })
    )
  }

  /**
   * Get tips from Firestore with JSON fallback
   */
  getTips(): Observable<any[]> {
    return this.languageService.getLanguage().pipe(
      switchMap(lang => {
        return this.firestore
          .collection(`tips_${lang}`)
          .valueChanges()
          .pipe(
            catchError(() => {
              console.log(`Falling back to JSON for tips_${lang}`)
              return this.http.get<any[]>(`assets/tips_${lang}.json`)
            })
          )
      })
    )
  }

  /**
   * Get version metadata from Firestore
   */
  getVersion(): Observable<any> {
    return this.firestore
      .doc('metadata/version')
      .valueChanges()
      .pipe(
        catchError(() => {
          console.log('Falling back to default version')
          return of({ version: '1.0.0', lastUpdated: new Date() })
        })
      )
  }
} 