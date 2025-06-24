import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivityService } from '../../services/activity.service';
import { Observable } from 'rxjs';

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
  version$!: Observable<string>;

  constructor(private translate: TranslateService, private activityService: ActivityService) {
    this.currentLanguage = this.translate.currentLang;
    this.version$ = this.activityService.getVersion();
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
  }
} 