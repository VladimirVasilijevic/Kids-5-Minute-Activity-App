import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BlogDetailComponent } from './blog-detail.component';
import { BlogService } from '../../services/blog.service';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';
import { TranslateModule } from '@ngx-translate/core';

describe('BlogDetailComponent', () => {
  let component: BlogDetailComponent;
  let fixture: ComponentFixture<BlogDetailComponent>;
  let mockBlogService: jasmine.SpyObj<BlogService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let _mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const blogServiceSpy = jasmine.createSpyObj('BlogService', ['getBlogPostById']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: mockBlogPosts[0].id.toString() })
    });

    await TestBed.configureTestingModule({
      declarations: [ BlogDetailComponent ],
      imports: [ TranslateModule.forRoot() ],
      providers: [
        { provide: BlogService, useValue: blogServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    mockBlogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    _mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    mockBlogService.getBlogPostById.and.returnValue(of(mockBlogPosts[0]));
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    fixture = TestBed.createComponent(BlogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load blog post on init', () => {
    expect(mockBlogService.getBlogPostById).toHaveBeenCalledWith(mockBlogPosts[0].id);
    expect(component.blogPost$).toBeDefined();
  });

  it('should render fullContent in the template', async () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Wait for async pipe
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.textContent).toContain(mockBlogPosts[0].fullContent.split('\n')[0]);
  });

  it('should navigate back to blog list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog']);
  });

  it('should handle error if blog post not found', () => {
    mockBlogService.getBlogPostById.and.returnValue(throwError(() => new Error('Not found')));
    fixture = TestBed.createComponent(BlogDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // You can add error UI handling here if implemented
    expect(component).toBeTruthy();
  });
}); 