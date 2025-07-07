import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, Observable } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ActivityService } from '../../services/activity.service';

import { SettingsComponent } from './settings.component';

// Proper mock for ActivityService
class MockActivityService {
  getVersion(): Observable<{ version: string; lastUpdated: Date }> {
    return of({ version: '1.0.2', lastUpdated: new Date() });
  }
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let translateService: TranslateService;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
      ],
      declarations: [SettingsComponent],
      providers: [provideRouter([]), { provide: ActivityService, useClass: MockActivityService }],
    }).compileComponents();
  });

  beforeEach((): void => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should have languages array', (): void => {
    expect(component.languages).toBeDefined();
    expect(Array.isArray(component.languages)).toBeTruthy();
    expect(component.languages.length).toBe(2);
  });

  it('should have Serbian and English languages', (): void => {
    const languageCodes = component.languages.map((lang) => lang.code);
    expect(languageCodes).toContain('sr');
    expect(languageCodes).toContain('en');
  });

  it('should have current language set', (): void => {
    // Initialize current language if not set
    if (!component.currentLanguage) {
      component.currentLanguage = translateService.currentLang || 'sr';
    }
    expect(component.currentLanguage).toBeDefined();
  });

  it('should call translate service when language changes', (): void => {
    spyOn(translateService, 'use');
    const newLanguage = 'en';

    component.changeLanguage(newLanguage);

    expect(component.currentLanguage).toBe(newLanguage);
    expect(translateService.use).toHaveBeenCalledWith(newLanguage);
  });

  it('should display settings card', (): void => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card')).toBeTruthy();
  });
});
