import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

/**
 * SplashScreen component that displays a loading screen with logo and spinner
 * Used during network calls and app initialization
 */
@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition('void <=> *', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('quoteFade', [
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('fading', style({
        opacity: 0,
        transform: 'translateY(-20px)'
      })),
      transition('visible => fading', [
        animate('400ms ease-in')
      ]),
      transition('fading => visible', [
        animate('800ms ease-out')
      ])
    ])
  ]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  /** Whether the splash screen is currently visible */
  @Input() isVisible = false;
  
  /** Whether to show the loading spinner */
  @Input() showSpinner = true;
  
  /** Custom message to display */
  @Input() message = '';
  
  /** Event emitted when the splash screen should be hidden */
  @Output() hideSplash = new EventEmitter<void>();
  
  /** Current quote index */
  currentQuoteIndex = 0;
  
  /** Animation state for quotes */
  quoteAnimationState = 'visible';
  
  /** Translation subscription */
  private translationSub?: Subscription;
  
  /** Quote rotation subscription */
  private quoteSub?: Subscription;
  
  /** Quotes data */
  private quotes: { [key: string]: string } = {};
  
  /** Current language for quotes */
  private currentLang = 'sr';

  /**
   * Constructor for SplashScreenComponent
   * @param _translateService - Angular translate service for internationalization
   * @param _http - HTTP client for loading quote files
   */
  constructor(
    private _translateService: TranslateService,
    private _http: HttpClient
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.currentLang = this._translateService.currentLang || 'sr';
    
    // Load initial quotes
    this.loadQuotes();
    
    // Subscribe to language changes
    this.translationSub = this._translateService.onLangChange.subscribe(
      (event: { lang: string }) => {
        this.currentLang = event.lang;
        this.currentQuoteIndex = 0;
        this.loadQuotes();
      }
    );
    
    // Start quote rotation
    this.startQuoteRotation();
  }

  /**
   * Cleanup subscriptions on component destroy
   */
  ngOnDestroy(): void {
    if (this.translationSub) {
      this.translationSub.unsubscribe();
    }
    if (this.quoteSub) {
      this.quoteSub.unsubscribe();
    }
  }

  /**
   * Load quotes from the appropriate language file
   */
  private loadQuotes(): void {
    const quoteFile = `assets/i18n/splash-quotes_${this.currentLang}.json`;
    
    this._http.get<{ [key: string]: string }>(quoteFile)
      .pipe(
        catchError(() => {
          // Fallback to Serbian if file not found
          return this._http.get<{ [key: string]: string }>('assets/i18n/splash-quotes_sr.json');
        })
      )
      .subscribe((quotes: { [key: string]: string }) => {
        this.quotes = quotes;
      });
  }

  /**
   * Start quote rotation
   */
  private startQuoteRotation(): void {
    this.quoteSub = interval(8000).subscribe(() => {
      this.quoteAnimationState = 'fading';
      
      // Wait for fade out, then change quote and fade in
      setTimeout(() => {
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % 10; // 10 quotes total
        this.quoteAnimationState = 'visible';
      }, 400);
    });
  }

  /**
   * Get the welcome message based on current language
   * @returns Translated welcome message
   */
  getWelcomeMessage(): string {
    return this.quotes['WELCOME_TITLE'] || 'Welcome to Ana Vaspitac';
  }

  /**
   * Get the welcome subtitle based on current language
   * @returns Translated welcome subtitle
   */
  getWelcomeSubtitle(): string {
    return this.quotes['WELCOME_SUBTITLE'] || '5-minute activities for children';
  }

  /**
   * Get the display message (custom message or default)
   * @returns Message to display
   */
  getDisplayMessage(): string {
    return this.message || this.getCurrentQuote();
  }

  /**
   * Get the current inspirational quote
   * @returns Current quote
   */
  getCurrentQuote(): string {
    const quoteKey = `QUOTE_${this.currentQuoteIndex + 1}`;
    return this.quotes[quoteKey] || 'Loading...';
  }
} 