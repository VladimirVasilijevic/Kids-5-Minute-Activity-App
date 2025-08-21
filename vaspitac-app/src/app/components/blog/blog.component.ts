import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { BlogPost } from '../../models/blog-post.model';
import { BlogService } from '../../services/blog.service';

/**
 * BlogComponent displays a list of blog posts with navigation and i18n support.
 */
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
  blogPosts$!: Observable<BlogPost[]>;
  lang!: string;

  /**
   * Initializes the blog component with required services
   * @param _router - Angular router for navigation
   * @param _blogService - Service for blog post data
   * @param _translate - Service for internationalization
   */
  constructor(
    private _router: Router,
    private _blogService: BlogService,
    private _translate: TranslateService
  ) {}

  /**
   * Loads blog posts on init with language-aware filtering
   */
  ngOnInit(): void {
    this.lang = this._translate.currentLang || this._translate.getDefaultLang() || 'en';

    // Load blog posts with language parameter for secure filtering
    this.blogPosts$ = this._translate.onLangChange.pipe(
      map((e) => e.lang as string),
      startWith(this.lang)
    ).pipe(
      switchMap((lang: string) => {
        this.lang = lang;
        return this._blogService.getBlogPosts(lang);
      })
    );
  }

  /**
   * Navigates back to the home page and scrolls to top
   */
  goBack(): void {
    this._router.navigate(['/']).then(() => {
      if (typeof window !== 'undefined' && window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * Navigates to subscription page for premium content
   */
  goToSubscription(): void {
    this._router.navigate(['/subscription']);
  }

  /**
   * Navigates to the blog detail page for a specific blog post
   * @param blogId - The ID of the blog post to view
   */
  viewBlogDetail(blogId: number): void {
    this._router.navigate(['/blog', blogId]).then(() => {
      if (typeof window !== 'undefined' && window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * Handles image loading errors by setting a default image
   * @param event - The error event from the image element
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-blog-image.svg';
  }
}
