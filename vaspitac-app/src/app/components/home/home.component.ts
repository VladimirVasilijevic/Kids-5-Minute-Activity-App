import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { Category } from '../../models/category.model';
import { CATEGORY_KEYS } from '../../models/category-keys';
import { CategoryService } from '../../services/category.service';
import { map } from 'rxjs/operators';
import { AboutService } from '../../services/about.service';
import { AboutContent } from '../../models/about-content.model';

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
  userProfile$: Observable<UserProfile | null> = of(null);
  showAuthModal = false;
  aboutContent$!: Observable<AboutContent | null>;

  /**
   *
   * @param router
   * @param http
   * @param categoryService
   */
  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _categoryService: CategoryService,
    private _auth: AuthService,
    private _userService: UserService,
    private _aboutService: AboutService
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.categories$ = this._categoryService.getCategories().pipe(
      map(categories => {
        const sortedCategories = categories.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return sortedCategories;
      })
    );
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => user ? this._userService.getUserProfile(user.uid) : of(null))
    );
    this.aboutContent$ = this._aboutService.getAboutContent();
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
      case CATEGORY_KEYS.SUBSCRIBE:
        this._router.navigate(['/subscribe']).then((): void => this.scrollToTop());
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

  /** Open the auth modal */
  openAuthModal(): void {
    this.showAuthModal = true;
  }

  /** Close the auth modal */
  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  /** Handle profile card click */
  onProfileClick(): void {
    this._router.navigate(['/profile']);
  }

  /** Handle logout */
  onLogout(): void {
    this._auth.signOut();
  }

  /**
   * Navigate to admin dashboard
   */
  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
  }

  /**
   * Check if user is admin
   * @param userProfile - User profile to check
   * @returns True if user is admin
   */
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === UserRole.ADMIN;
  }
}
