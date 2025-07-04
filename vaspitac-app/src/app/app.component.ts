import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentLang = 'sr'
  activeRoute = ''

  constructor(
    private translate: TranslateService,
    private router: Router,
    private languageService: LanguageService
  ) {
    // Set default language
    translate.setDefaultLang('sr')
    translate.use('sr')
    this.currentLang = 'sr'

    // Listen for route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeRoute = event.urlAfterRedirects
      }
    })
  }

  switchLanguage() {
    this.currentLang = this.currentLang === 'sr' ? 'en' : 'sr'
    this.translate.use(this.currentLang)
    this.languageService.setLanguage(this.currentLang)
  }

  isActive(route: string): boolean {
    return this.activeRoute === route
  }
} 