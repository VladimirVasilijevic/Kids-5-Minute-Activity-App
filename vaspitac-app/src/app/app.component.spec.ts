import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material imports for testing
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        // Angular Material modules
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ AppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should have as title 'Vaspitac App'`, () => {
    expect(component.title).toEqual('Vaspitac App');
  });

  it('should set default language to Serbian', () => {
    expect(translateService.getDefaultLang()).toBe('sr');
  });

  it('should use Serbian as current language', () => {
    expect(translateService.currentLang).toBe('sr');
  });

  it('should have toolbar with app title', () => {
    const compiled = fixture.nativeElement;
    const toolbar = compiled.querySelector('mat-toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should have settings button in toolbar', () => {
    const compiled = fixture.nativeElement;
    const settingsButton = compiled.querySelector('button[ng-reflect-router-link="/settings"]');
    expect(settingsButton).toBeTruthy();
  });

  it('should have bottom navigation', () => {
    const compiled = fixture.nativeElement;
    const bottomNav = compiled.querySelector('.bottom-nav');
    expect(bottomNav).toBeTruthy();
  });

  it('should have home and activities navigation buttons', () => {
    const compiled = fixture.nativeElement;
    const homeButton = compiled.querySelector('button[ng-reflect-router-link="/"]');
    const activitiesButton = compiled.querySelector('button[ng-reflect-router-link="/activities"]');
    
    expect(homeButton).toBeTruthy();
    expect(activitiesButton).toBeTruthy();
  });

  it('should have router outlet for main content', () => {
    const compiled = fixture.nativeElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
}); 