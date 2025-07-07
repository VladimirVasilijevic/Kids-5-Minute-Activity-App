import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing application language settings
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private lang$ = new BehaviorSubject<string>('sr');

  /**
   * Sets the current application language
   * @param lang - The language code to set (e.g., 'sr', 'en')
   * @returns {void}
   */
  setLanguage(lang: string): void {
    this.lang$.next(lang);
  }

  /**
   * Gets the current language as an observable
   * @returns {Observable<string>} Observable of current language
   */
  getLanguage(): Observable<string> {
    return this.lang$.asObservable();
  }

  /**
   * Gets the current language value synchronously
   * @returns {string} Current language code
   */
  getCurrentLanguage(): string {
    return this.lang$.getValue();
  }
}
