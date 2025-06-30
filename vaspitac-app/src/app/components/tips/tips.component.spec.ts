import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TipsComponent } from './tips.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('TipsComponent', () => {
  let component: TipsComponent
  let fixture: ComponentFixture<TipsComponent>
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipsComponent],
      imports: [TranslateModule.forRoot()],
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
    const subtitle = compiled.querySelector('p.text-lg')
    expect(title).toBeTruthy()
    expect(subtitle).toBeTruthy()
    expect(title && title.textContent).toContain('TIPS.TITLE')
    expect(subtitle && subtitle.textContent).toContain('TIPS.SUBTITLE')
  })

  it('should render all tips', () => {
    const cards = fixture.debugElement.queryAll(By.css('.bg-white.rounded-xl'))
    expect(cards.length).toBe(component.tips.length)
    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].nativeElement.textContent).toContain(translate.instant(component.tips[i].title))
    }
  })
}) 