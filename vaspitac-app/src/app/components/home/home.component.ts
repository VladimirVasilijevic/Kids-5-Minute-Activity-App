import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from '../../models/category.model';
import { CATEGORY_KEYS } from '../../models/category-keys';
import { CategoryService } from '../../services/category.service';

/**
 *
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  categories$!: Observable<Category[]>;

  /**
   *
   * @param router
   * @param http
   * @param categoryService
   */
  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _categoryService: CategoryService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.categories$ = this._categoryService.getCategories();
  }

  /**
   *
   * @param categoryId
   */
  goToCategory(categoryId: string): void {
    switch (categoryId) {
      case CATEGORY_KEYS.ABOUT:
        this._router.navigate(['/about']).then((): void => this.scrollToTop());
        break;
      case CATEGORY_KEYS.SHOP:
        this._router.navigate(['/shop']).then((): void => this.scrollToTop());
        break;
      case CATEGORY_KEYS.BLOG:
        this._router.navigate(['/blog']).then((): void => this.scrollToTop());
        break;
      case CATEGORY_KEYS.TIPS:
        this._router.navigate(['/tips']).then((): void => this.scrollToTop());
        break;
      case CATEGORY_KEYS.PHYSICAL:
      case CATEGORY_KEYS.CREATIVE:
      case CATEGORY_KEYS.EDUCATIONAL:
      case CATEGORY_KEYS.MUSICAL:
      case CATEGORY_KEYS.NATURE:
        this._router
          .navigate(['/activities'], { queryParams: { category: categoryId } })
          .then((): void => this.scrollToTop());
        break;
      default:
        this._router.navigate(['/activities']).then((): void => this.scrollToTop());
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
