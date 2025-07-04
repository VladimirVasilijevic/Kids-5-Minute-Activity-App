import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  currentLanguage = 'sr';
  languages = [
    { code: 'sr', name: 'Српски', flag: 'rs' },
    { code: 'en', name: 'English', flag: 'gb' }
  ];

  constructor(private translate: TranslateService, private activityService: ActivityService) {
    this.currentLanguage = this.translate.currentLang;
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }
} 