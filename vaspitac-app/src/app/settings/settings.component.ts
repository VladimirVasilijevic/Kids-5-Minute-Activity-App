import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  currentLanguage = 'sr';
  languages = [
    { code: 'sr', name: 'Српски' },
    { code: 'en', name: 'English' }
  ];

  constructor(private translate: TranslateService) {
    this.currentLanguage = this.translate.currentLang;
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }
} 