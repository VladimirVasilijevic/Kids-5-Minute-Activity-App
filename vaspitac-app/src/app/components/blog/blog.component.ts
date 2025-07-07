import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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

  /**
   * Initializes the blog component with required services
   * @param _router - Angular router for navigation
   * @param _blogService - Service for blog post data
   */
  constructor(
    private _router: Router,
    private _blogService: BlogService
  ) {}

  /**
   * Loads blog posts on init
   */
  ngOnInit(): void {
    this.blogPosts$ = this._blogService.getBlogPosts();
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
}
