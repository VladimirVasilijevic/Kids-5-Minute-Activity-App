import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { AboutService } from '../../services/about.service';
import { AboutContent, AboutContentData } from '../../models/about-content.model';

/**
 * About component for displaying information about the app and developer
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  aboutContent$!: Observable<AboutContent | null>;
  currentLanguage = 'sr';

  /**
   * Constructor for AboutComponent
   * @param _router - Router service for navigation
   * @param _aboutService - Service for about content management
   * @param _translate - Translation service for internationalization
   * @param _http - HTTP client for JSON fallback
   */
  constructor(
    private _router: Router,
    private _aboutService: AboutService,
    private _translate: TranslateService,
    private _http: HttpClient
  ) {}

  /**
   * Initialize component by loading about content
   */
  ngOnInit(): void {
    this.currentLanguage = this._translate.currentLang || this._translate.getDefaultLang() || 'sr';
    this.loadAboutContent();
  }

  /**
   * Load about content from service with fallback to JSON files
   */
  private loadAboutContent(): void {
    this.aboutContent$ = this._aboutService.getAboutContent().pipe(
      // Fallback to JSON file if service fails
      catchError(() => {
        // Fallback to JSON file
        console.log(`Falling back to JSON for about_${this.currentLanguage}`);
        return this._http.get<AboutContentData>(`assets/about_${this.currentLanguage}.json`).pipe(
          map((response: AboutContentData) => response.data)
        );
      })
    );
  }

  /**
   * Navigate back to home page and scroll to top
   */
  goBack(): void {
    this._router.navigate(['/']).then((): void => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
