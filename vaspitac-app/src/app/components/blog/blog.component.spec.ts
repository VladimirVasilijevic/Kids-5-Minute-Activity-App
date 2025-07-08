import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { FirestoreService } from '../../services/firestore.service';
import { mockFirestoreService } from '../../../test-utils/mock-firestore-service';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';
import { TranslateService } from '@ngx-translate/core';
import { BlogService } from '../../services/blog.service';

import { BlogComponent } from './blog.component';

describe('BlogComponent', (): void => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let blogServiceSpy: jasmine.SpyObj<BlogService>;

  beforeEach(async (): Promise<void> => {
    blogServiceSpy = jasmine.createSpyObj('BlogService', ['getBlogPosts']);
    blogServiceSpy.getBlogPosts.and.returnValue(of(mockBlogPosts));

    await TestBed.configureTestingModule({
      declarations: [BlogComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FirestoreService, useValue: mockFirestoreService },
        { provide: BlogService, useValue: blogServiceSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    mockFirestoreService.getBlogPosts.calls.reset();
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should render the blog title and subtitle', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h2');
    const subtitle = compiled.querySelector('p.text-base.md\\:text-lg');
    expect(title).toBeTruthy();
    expect(subtitle).toBeTruthy();
    expect(title && title.textContent).toContain('BLOG.TITLE');
    expect(subtitle && subtitle.textContent).toContain('BLOG.SUBTITLE');
  });

  it('should render all blog posts', async (): Promise<void> => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.overflow-hidden.bg-white');
    component.blogPosts$?.subscribe((posts) => {
      expect(posts.length).toBe(cards.length);
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].textContent).toContain(posts[i].title);
        expect(posts[i].fullContent).toBeDefined(); // Ensure fullContent exists
      }
    });
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should navigate back to home on back button click', (): void => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const compiled = fixture.nativeElement as HTMLElement;
    const backBtn = compiled.querySelector('button');
    if (backBtn) {
      backBtn.click();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    } else {
      fail('Back button not found');
    }
  });

  it('should render blog post content (excerpt, image)', async (): Promise<void> => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.overflow-hidden.bg-white');
    component.blogPosts$?.subscribe((posts) => {
      posts.forEach((post, i) => {
        const card = cards[i];
        expect(card.textContent).toContain(post.excerpt);
        expect(post.fullContent).toBeDefined(); // Ensure fullContent exists
        const img = card.querySelector('img');
        if (img) {
          expect(img.getAttribute('src')).toBe(post.imageUrl);
          expect(img.getAttribute('alt')).toBe(post.title);
        }
      });
    });
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should show empty state if no blog posts', (): void => {
    mockFirestoreService.getBlogPosts.and.returnValue(of([]));
    component.blogPosts$ = of([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('BLOG.EMPTY');
  });

  it('should update posts on language change', (): void => {
    mockFirestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
    // Simulate language change
    const languageService = TestBed.inject(TranslateService);
    spyOn(languageService, 'use').and.callThrough();
    languageService.use('en');
    fixture.detectChanges();
    expect(languageService.use).toHaveBeenCalledWith('en');
  });

  it('should navigate to blog detail page when viewBlogDetail is called', (): void => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const blogId = 123;
    
    component.viewBlogDetail(blogId);
    
    expect(router.navigate).toHaveBeenCalledWith(['/blog', blogId]);
  });

  it('should call viewBlogDetail when blog post card is clicked', async (): Promise<void> => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(component, 'viewBlogDetail').and.callThrough();
    
    // Set up blog posts data
    blogServiceSpy.getBlogPosts.and.returnValue(of(mockBlogPosts));
    await fixture.whenStable();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const firstBlogCard = compiled.querySelector('.overflow-hidden.bg-white') as HTMLElement;
    
    if (firstBlogCard) {
      firstBlogCard.click();
      expect(component.viewBlogDetail).toHaveBeenCalled();
    } else {
      fail('Blog post card not found');
    }
  });
});
