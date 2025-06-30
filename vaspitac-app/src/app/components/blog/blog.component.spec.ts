import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BlogComponent } from './blog.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('BlogComponent', () => {
  let component: BlogComponent
  let fixture: ComponentFixture<BlogComponent>
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlogComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(BlogComponent)
    component = fixture.componentInstance
    translate = TestBed.inject(TranslateService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render the blog title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement
    const title = compiled.querySelector('h2')
    const subtitle = compiled.querySelector('p.text-lg')
    expect(title).toBeTruthy()
    expect(subtitle).toBeTruthy()
    expect(title && title.textContent).toContain('BLOG.TITLE')
    expect(subtitle && subtitle.textContent).toContain('BLOG.SUBTITLE')
  })

  it('should render all blog posts', () => {
    const cards = fixture.debugElement.queryAll(By.css('.overflow-hidden.bg-white'))
    expect(cards.length).toBe(component.blogPosts.length)
    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].nativeElement.textContent).toContain(translate.instant(component.blogPosts[i].title))
    }
  })
}) 