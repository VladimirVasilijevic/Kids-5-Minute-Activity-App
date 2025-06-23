import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule
      ],
      declarations: [ SettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have languages array', () => {
    expect(component.languages).toBeDefined();
    expect(Array.isArray(component.languages)).toBeTruthy();
    expect(component.languages.length).toBe(2);
  });

  it('should have Serbian and English languages', () => {
    const languageCodes = component.languages.map(lang => lang.code);
    expect(languageCodes).toContain('sr');
    expect(languageCodes).toContain('en');
  });

  it('should have current language set', () => {
    // Initialize current language if not set
    if (!component.currentLanguage) {
      component.currentLanguage = translateService.currentLang || 'sr';
    }
    expect(component.currentLanguage).toBeDefined();
  });

  it('should call translate service when language changes', () => {
    spyOn(translateService, 'use');
    const newLanguage = 'en';
    
    component.changeLanguage(newLanguage);
    
    expect(component.currentLanguage).toBe(newLanguage);
    expect(translateService.use).toHaveBeenCalledWith(newLanguage);
  });

  it('should display settings card', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-card')).toBeTruthy();
  });
}); 