import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang$ = new BehaviorSubject<string>('sr')

  setLanguage(lang: string) {
    this.lang$.next(lang)
  }

  getLanguage(): Observable<string> {
    return this.lang$.asObservable()
  }

  getCurrentLanguage(): string {
    return this.lang$.getValue()
  }
} 