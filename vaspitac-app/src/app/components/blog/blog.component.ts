import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

import { BlogPost } from '../../models/blog-post.model';
import { LanguageService } from '../../services/language.service';
import { BlogService } from '../../services/blog.service';

/**
 *
 */
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
  blogPosts$!: Observable<BlogPost[]>;

  /**
   *
   * @param router
   * @param http
   * @param languageService
   * @param blogService
   */
  constructor(
    private router: Router,
    private http: HttpClient,
    private languageService: LanguageService,
    private blogService: BlogService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.blogPosts$ = this.blogService.getBlogPosts();
  }

  /**
   *
   */
  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
