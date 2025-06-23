import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Vaspitac App';

  constructor(private translate: TranslateService) {
    // Set default language
    translate.setDefaultLang('sr');
    translate.use('sr');
  }
} 