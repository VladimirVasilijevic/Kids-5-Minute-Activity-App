import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Activity } from './models/activity.model';
import { BlogPost } from './models/blog-post.model';
import { Observable, of } from 'rxjs';
import { ActivityService } from './services/activity.service';
import { BlogService } from './services/blog.service';
import { LanguageService } from './services/language.service';

// Angular Material imports for testing
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from './app.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { SearchOverlayComponent } from './components/search-overlay/search-overlay.component';

class MockActivityService {
  getActivities = (): Observable<Activity[]> => of([]);
}
class MockBlogService {
  getBlogPosts = (): Observable<BlogPost[]> => of([]);
}
class MockLanguageService {
  setLanguage = (): void => {};
}

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
        MatIconModule,
      ],
      declarations: [AppComponent, ScrollToTopComponent, SearchOverlayComponent],
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivityService, useClass: MockActivityService },
        { provide: BlogService, useClass: MockBlogService },
        { provide: LanguageService, useClass: MockLanguageService },
      ],
    }).compileComponents();
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
    const tagline = compiled.querySelector('div.text-xs.md\\:text-sm');
    expect(title).toBeTruthy();
    expect(tagline).toBeTruthy();
    expect(title.textContent).toContain(translateService.instant('APP.TITLE'));
    expect(tagline.textContent).toContain(translateService.instant('APP.TAGLINE'));
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

  it('should switch language when language button is clicked', () => {
    spyOn(component, 'switchLanguage').and.callThrough();
    const compiled = fixture.nativeElement;
    const langBtn = compiled.querySelector('button');
    langBtn.click();
    fixture.detectChanges();
    expect(component.switchLanguage).toHaveBeenCalled();
    expect(['en', 'sr']).toContain(component.currentLang);
  });

  it('isActive should return true for matching route', () => {
    component.activeRoute = '/blog';
    expect(component.isActive('/blog')).toBeTrue();
  });

  it('isActive should return false for non-matching route', () => {
    component.activeRoute = '/blog';
    expect(component.isActive('/shop')).toBeFalse();
  });
});
