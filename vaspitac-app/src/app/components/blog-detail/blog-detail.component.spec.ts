import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BlogDetailComponent } from './blog-detail.component';
import { BlogService } from '../../services/blog.service';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';

describe('BlogDetailComponent', () => {
  let component: BlogDetailComponent;
  let fixture: ComponentFixture<BlogDetailComponent>;
  let blogService: jasmine.SpyObj<BlogService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async () => {
    const blogServiceSpy = jasmine.createSpyObj('BlogService', ['getBlogPostById']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      paramMap: of({ get: (key: string) => '1' }),
    };

    await TestBed.configureTestingModule({
      declarations: [BlogDetailComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: BlogService, useValue: blogServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetailComponent);
    component = fixture.componentInstance;
    blogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the correct blog post on initialization', (done) => {
    blogService.getBlogPostById.and.returnValue(of(mockBlogPosts[0]));
    fixture.detectChanges();
    component.blogPost$?.subscribe(post => {
      expect(post).toEqual(mockBlogPosts[0]);
      done();
    });
  });

  it('should handle blog post not found', (done) => {
    activatedRoute.paramMap = of({ get: (key: string) => '999' });
    blogService.getBlogPostById.and.returnValue(of(undefined as any));
    fixture.detectChanges();
    component.blogPost$?.subscribe(post => {
      expect(post).toBeUndefined();
      done();
    });
  });

  it('should navigate back to the blog list', () => {
    router.navigate.and.resolveTo(true);
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/blog']);
  });
}); 