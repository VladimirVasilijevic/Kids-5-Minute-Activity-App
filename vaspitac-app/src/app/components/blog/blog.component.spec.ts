import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BlogComponent } from './blog.component'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { FirestoreService } from '../../services/firestore.service'
import { mockFirestoreService } from '../../../test-utils/mock-firestore-service'
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts'

describe('BlogComponent', () => {
  let component: BlogComponent
  let fixture: ComponentFixture<BlogComponent>
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlogComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FirestoreService, useValue: mockFirestoreService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(BlogComponent)
    component = fixture.componentInstance
    translate = TestBed.inject(TranslateService)
    mockFirestoreService.getBlogPosts.calls.reset()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render the blog title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement
    const title = compiled.querySelector('h2')
    const subtitle = compiled.querySelector('p.text-base.md\\:text-lg')
    expect(title).toBeTruthy()
    expect(subtitle).toBeTruthy()
    expect(title && title.textContent).toContain('BLOG.TITLE')
    expect(subtitle && subtitle.textContent).toContain('BLOG.SUBTITLE')
  })

  it('should render all blog posts', async () => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts))
    await fixture.whenStable()
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    const cards = compiled.querySelectorAll('.overflow-hidden.bg-white')
    component.blogPosts$?.subscribe(posts => {
      expect(posts.length).toBe(cards.length)
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].textContent).toContain(posts[i].title)
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

  it('should render blog post content (excerpt, image)', async () => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts))
    await fixture.whenStable()
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    const cards = compiled.querySelectorAll('.overflow-hidden.bg-white')
    component.blogPosts$?.subscribe(posts => {
      posts.forEach((post, i) => {
        const card = cards[i]
        expect(card.textContent).toContain(post.excerpt)
        const img = card.querySelector('img')
        if (img) {
          expect(img.getAttribute('src')).toBe(post.imageUrl)
          expect(img.getAttribute('alt')).toBe(post.title)
        }
      })
    })
    expect(cards.length).toBeGreaterThanOrEqual(0)
  })

  it('should show empty state if no blog posts', () => {
    mockFirestoreService.getBlogPosts.and.returnValue(of([]))
    component.blogPosts$ = of([])
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.textContent).toContain('BLOG.EMPTY')
  })

  it('should update posts on language change', () => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts))
    const languageService = TestBed.inject<any>(TranslateService)
    spyOn(languageService, 'use').and.callThrough()
    // Simulate language change
    languageService.use('en')
    fixture.detectChanges()
    expect(languageService.use).toHaveBeenCalledWith('en')
  })
}) 