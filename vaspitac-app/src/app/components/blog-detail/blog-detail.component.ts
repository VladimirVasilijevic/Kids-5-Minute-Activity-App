import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { BlogPost } from '../../models/blog-post.model';
import { BlogService } from '../../services/blog.service';

/**
 * Component to display the details of a single blog post
 */
@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit {
  blogPost$!: Observable<BlogPost | undefined>;
  lang!: string;

  /**
   * Initializes services
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
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'sr';
    this.blogPost$ = combineLatest([
      this._route.paramMap.pipe(map((params) => params.get('id'))),
      this._translate.onLangChange.pipe(
        map((e) => e.lang as string),
        startWith(this.lang)
      ),
    ]).pipe(
      switchMap(([id, lang]) => {
        this.lang = lang;
        if (!id) return of(undefined);
        return this._blogService.getBlogPostById(Number(id));
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