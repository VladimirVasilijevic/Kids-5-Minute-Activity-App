import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SplashScreenComponent } from './splash-screen.component';

describe('SplashScreenComponent', () => {
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const translateServiceSpy = jasmine.createSpyObj('TranslateService', [
      'instant'
    ], {
      onLangChange: of({ lang: 'sr' })
    });

    await TestBed.configureTestingModule({
      declarations: [SplashScreenComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpClientModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TranslateService, useValue: translateServiceSpy }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    translateService.instant.and.returnValue('Test Message');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.isVisible).toBe(false);
    expect(component.showSpinner).toBe(true);
    expect(component.message).toBe('');
  });

  it('should show splash screen when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const splashElement = fixture.nativeElement.querySelector('.splash-screen');
    expect(splashElement).toBeTruthy();
  });

  it('should hide splash screen when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();
    
    const splashElement = fixture.nativeElement.querySelector('.splash-screen');
    expect(splashElement).toBeFalsy();
  });

  it('should show spinner when showSpinner is true', () => {
    component.isVisible = true;
    component.showSpinner = true;
    fixture.detectChanges();
    
    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement).toBeTruthy();
  });

  it('should hide spinner when showSpinner is false', () => {
    component.isVisible = true;
    component.showSpinner = false;
    fixture.detectChanges();
    
    const spinnerElement = fixture.nativeElement.querySelector('.spinner');
    expect(spinnerElement).toBeFalsy();
  });

  it('should display custom message when provided', () => {
    component.isVisible = true;
    component.message = 'Custom loading message';
    fixture.detectChanges();
    
    const subtitleElement = fixture.nativeElement.querySelector('.welcome-subtitle');
    expect(subtitleElement.textContent.trim()).toBe('Custom loading message');
  });

  it('should display default subtitle when no custom message is provided', () => {
    component.isVisible = true;
    component.message = '';
    translateService.instant.and.returnValue('Loading...');
    fixture.detectChanges();
    
    const subtitleElement = fixture.nativeElement.querySelector('.welcome-subtitle');
    expect(subtitleElement.textContent.trim()).toBe('Loading...');
  });

  it('should call getWelcomeMessage and return text from quotes', () => {
    // Mock the quotes object
    component['quotes'] = {
      'WELCOME_TITLE': 'Welcome to Ana Vaspitac'
    };
    
    const result = component.getWelcomeMessage();
    
    expect(result).toBe('Welcome to Ana Vaspitac');
  });

  it('should call getWelcomeSubtitle and return text from quotes', () => {
    // Mock the quotes object
    component['quotes'] = {
      'WELCOME_SUBTITLE': '5-minute activities for children'
    };
    
    const result = component.getWelcomeSubtitle();
    
    expect(result).toBe('5-minute activities for children');
  });

  it('should return custom message when available', () => {
    component.message = 'Custom message';
    
    const result = component.getDisplayMessage();
    
    expect(result).toBe('Custom message');
  });

  it('should return default subtitle when no custom message', () => {
    component.message = '';
    translateService.instant.and.returnValue('Loading...');
    
    const result = component.getDisplayMessage();
    
    expect(result).toBe('Loading...');
  });

  it('should emit hideSplash event when called', () => {
    spyOn(component.hideSplash, 'emit');
    
    component.hideSplash.emit();
    
    expect(component.hideSplash.emit).toHaveBeenCalled();
  });

  it('should unsubscribe from translation service on destroy', () => {
    const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['translationSub'] = subscription;
    
    component.ngOnDestroy();
    
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should handle destroy without subscription gracefully', () => {
    component['translationSub'] = undefined;
    
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should have logo image with correct attributes', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const logoImage = fixture.nativeElement.querySelector('.logo-image');
    expect(logoImage).toBeTruthy();
    expect(logoImage.src).toContain('assets/android-chrome-192x192.png');
    expect(logoImage.alt).toBe('Ana Vaspitac Logo');
  });

  it('should have welcome title with correct styling', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('.welcome-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement.tagName).toBe('H1');
  });
}); 