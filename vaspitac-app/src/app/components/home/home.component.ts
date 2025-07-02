import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';
import { CATEGORY_KEYS } from '../../models/category-keys';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories$!: Observable<Category[]>;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.categories$ = this.http.get<Category[]>('assets/categories.json');
  }

  goToCategory(categoryId: string): void {
    switch (categoryId) {
      case CATEGORY_KEYS.ABOUT:
        this.router.navigate(['/about']).then(() => this.scrollToTop());
        break;
      case CATEGORY_KEYS.SHOP:
        this.router.navigate(['/shop']).then(() => this.scrollToTop());
        break;
      case CATEGORY_KEYS.BLOG:
        this.router.navigate(['/blog']).then(() => this.scrollToTop());
        break;
      case CATEGORY_KEYS.TIPS:
        this.router.navigate(['/tips']).then(() => this.scrollToTop());
        break;
      case CATEGORY_KEYS.PHYSICAL:
      case CATEGORY_KEYS.CREATIVE:
      case CATEGORY_KEYS.EDUCATIONAL:
      case CATEGORY_KEYS.MUSICAL:
      case CATEGORY_KEYS.NATURE:
        this.router.navigate(['/activities'], { queryParams: { category: categoryId } }).then(() => this.scrollToTop());
        break;
      default:
        this.router.navigate(['/activities']).then(() => this.scrollToTop());
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
} 