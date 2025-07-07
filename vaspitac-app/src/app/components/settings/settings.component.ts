import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ActivityService } from '../../services/activity.service';

/**
 * Settings component for managing app preferences
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  currentLanguage = 'sr';
  languages = [
    { code: 'sr', name: 'Српски', flag: 'rs' },
    { code: 'en', name: 'English', flag: 'gb' },
  ];

  /**
   * Constructor for SettingsComponent
   * @param _translate - Translation service
   * @param _activityService - Activity service (unused)
   */
  constructor(
    private _translate: TranslateService,
    private _activityService: ActivityService
  ) {
    this.currentLanguage = this._translate.currentLang;
  }

  /**
   * Change the current language
   * @param lang - Language code to switch to
   */
  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    this._translate.use(lang);
  }
}
