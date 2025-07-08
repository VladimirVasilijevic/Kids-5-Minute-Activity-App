import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

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

  /**
   * Initializes the blog detail component with required services
   * @param _route - Activated route for getting route parameters
   * @param _router - Angular router for navigation
   * @param _blogService - Service for blog post data
   */
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _blogService: BlogService
  ) {}

  /**
   * Loads the specific blog post based on the route parameter
   */
  ngOnInit(): void {
    this.blogPost$ = this._route.params.pipe(
      switchMap(params => this._blogService.getBlogPostById(+params['id']))
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