import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { BlogPost } from '../../models/blog-post.model';
import { BlogService } from '../../services/blog.service';

/**
 * BlogDetailComponent displays the full content of a specific blog post.
 */
@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit {
  blogPost$!: Observable<BlogPost>;
  lang!: string;

  /**
   * Initializes the blog detail component with required services
   * @param _route - Activated route for getting route parameters
   * @param _router - Angular router for navigation
   * @param _blogService - Service for blog post data
   * @param _translate - Service for internationalization
   */
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _blogService: BlogService,
    private _translate: TranslateService
  ) {}

  /**
   * Loads the specific blog post based on the route parameter
   */
  ngOnInit(): void {
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'en';
    
    this.blogPost$ = combineLatest([
      this._route.params.pipe(map(params => +params['id'])),
      this._translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
    ]).pipe(
      switchMap(([id, lang]) => {
        this.lang = lang;
        // Get all blog posts for the current language and find the specific one
        return this._blogService.getBlogPosts(lang).pipe(
          map(blogPosts => {
            const post = blogPosts.find(p => p.id === id);
            if (!post) {
              throw new Error(`Blog post with ID ${id} not found`);
            }
            return post;
          })
        );
      })
    );
  }

  /**
   * Navigates back to the blog list page
   */
  goBack(): void {
    this._router.navigate(['/blog']).then(() => {
      if (typeof window !== 'undefined' && window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
} 