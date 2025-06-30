import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';

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
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        RouterModule,
        // Angular Material modules
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ AppComponent ],
      providers: [
        provideHttpClientTesting(),
        provideRouter([])
      ]
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

  it('should set default language to Serbian', () => {
    expect(translateService.getDefaultLang()).toBe('sr');
  });

  it('should use Serbian as current language', () => {
    expect(translateService.currentLang).toBe('sr');
  });

  it('should render the app title and tagline using translation keys', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    const tagline = compiled.querySelector('p.text-xs');
    expect(title.textContent).toContain('APP.TITLE');
    expect(tagline.textContent).toContain('APP.TAGLINE');
  });

  it('should have navigation links for all main sections', () => {
    const compiled = fixture.nativeElement;
    const navLinks = compiled.querySelectorAll('nav a');
    const expectedRoutes = ['/activities', '/blog', '/tips', '/games', '/resources'];
    expect(navLinks.length).toBe(expectedRoutes.length);
    expectedRoutes.forEach((route, i) => {
      expect(navLinks[i].getAttribute('ng-reflect-router-link')).toBe(route);
    });
  });

  it('should have a language switcher button', () => {
    const compiled = fixture.nativeElement;
    const langBtn = compiled.querySelector('button');
    expect(langBtn).toBeTruthy();
    expect(langBtn.textContent).toMatch(/🇷🇸|🇺🇸/);
  });

  it('should have a router outlet for main content', () => {
    const compiled = fixture.nativeElement;
    const routerOutlet = compiled.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
}); 