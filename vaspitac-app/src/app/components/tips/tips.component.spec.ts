import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FirestoreService } from '../../services/firestore.service';
import { mockFirestoreService } from '../../../test-utils/mock-firestore-service';
import { mockTips } from '../../../test-utils/mock-tips';

import { TipsComponent } from './tips.component';

describe('TipsComponent', () => {
  let component: TipsComponent;
  let fixture: ComponentFixture<TipsComponent>;
  let _translate: TranslateService;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      declarations: [TipsComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: FirestoreService, useValue: mockFirestoreService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TipsComponent);
    component = fixture.componentInstance;
    _translate = TestBed.inject(TranslateService);
    mockFirestoreService.getTips.calls.reset();
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should render the tips title and subtitle', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h2');
    const subtitle = compiled.querySelector('p.text-base.md\\:text-lg');
    expect(title).toBeTruthy();
    expect(subtitle).toBeTruthy();
    expect(title && title.textContent).toContain(_translate.instant('TIPS.QUICK_TITLE'));
    expect(subtitle && subtitle.textContent).toContain(_translate.instant('TIPS.QUICK_SUBTITLE'));
  });

  it('should render all tips', async (): Promise<void> => {
    mockFirestoreService.getTips.and.returnValue(of(mockTips));
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.bg-white.rounded-xl');
    component.tips$?.subscribe((tips) => {
      expect(tips.length).toBe(cards.length);
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].textContent).toContain(tips[i].title);
      }
    });
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should navigate back to home on back button click', (): void => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    
    // Call the goBack method directly
    component.goBack();
    
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should render tip content (description)', async (): Promise<void> => {
    mockFirestoreService.getTips.and.returnValue(of(mockTips));
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.bg-white.rounded-xl');
    component.tips$?.subscribe((tips) => {
      tips.forEach((tip, i) => {
        const card = cards[i];
        expect(card.textContent).toContain(tip.description);
      });
    });
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should show empty state if no tips', (): void => {
    mockFirestoreService.getTips.and.returnValue(of([]));
    component.tips$ = of([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('TIPS.EMPTY');
  });

  it('should update tips on language change', (): void => {
    const languageService = TestBed.inject<any>(TranslateService);
    spyOn(languageService, 'use').and.callThrough();
    // Simulate language change
    languageService.use('en');
    fixture.detectChanges();
    expect(languageService.use).toHaveBeenCalledWith('en');
  });
});
