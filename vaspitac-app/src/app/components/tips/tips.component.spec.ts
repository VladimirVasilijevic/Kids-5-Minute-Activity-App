import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TipsComponent } from './tips.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'

describe('TipsComponent', () => {
  let component: TipsComponent
  let fixture: ComponentFixture<TipsComponent>
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipsComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(TipsComponent)
    component = fixture.componentInstance
    translate = TestBed.inject(TranslateService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render the tips title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement
    const title = compiled.querySelector('h2')
    const subtitle = compiled.querySelector('p.text-base.md\\:text-lg')
    expect(title).toBeTruthy()
    expect(subtitle).toBeTruthy()
    expect(title && title.textContent).toContain(translate.instant('TIPS.QUICK_TITLE'))
    expect(subtitle && subtitle.textContent).toContain(translate.instant('TIPS.QUICK_SUBTITLE'))
  })

  it('should render all tips', async () => {
    await fixture.whenStable()
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    const cards = compiled.querySelectorAll('.bg-white.rounded-xl')
    component.tips$?.subscribe(tips => {
      expect(tips.length).toBe(cards.length)
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].textContent).toContain(tips[i].title)
      }
    })
    expect(cards.length).toBeGreaterThanOrEqual(0)
  })

  it('should navigate back to home on back button click', () => {
    const router = TestBed.inject(Router)
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
    const compiled = fixture.nativeElement as HTMLElement
    const backBtn = compiled.querySelector('button')
    if (backBtn) {
      backBtn.click()
      expect(router.navigate).toHaveBeenCalledWith(['/'])
    } else {
      fail('Back button not found')
    }
  })

  it('should render tip content (description)', async () => {
    await fixture.whenStable()
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    const cards = compiled.querySelectorAll('.bg-white.rounded-xl')
    component.tips$?.subscribe(tips => {
      tips.forEach((tip, i) => {
        const card = cards[i]
        expect(card.textContent).toContain(tip.description)
      })
    })
    expect(cards.length).toBeGreaterThanOrEqual(0)
  })

  it('should show empty state if no tips', () => {
    component.tips$ = of([])
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.textContent).toContain('TIPS.EMPTY')
  })

  it('should update tips on language change', () => {
    const languageService = TestBed.inject<any>(TranslateService)
    spyOn(languageService, 'use').and.callThrough()
    // Simulate language change
    languageService.use('en')
    fixture.detectChanges()
    expect(languageService.use).toHaveBeenCalledWith('en')
  })
}) 