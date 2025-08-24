import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { DigitalFile } from '../../models/digital-file.model';
import { DigitalFileService } from '../../services/digital-file.service';

import { formatFileSize } from '../../models/marketplace.utils';

/**
 * Digital Marketplace component for browsing and purchasing digital files
 */
@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
  // User authentication
  userProfile$: Observable<UserProfile | null> = of(null);
  isLoggedIn = false;
  
  // Files data
  files: DigitalFile[] = [];
  displayedFiles: DigitalFile[] = [];
  isLoading = true;
  
  // Search and filters
  searchTerm = '';
  selectedLanguage = '';
  selectedAccessLevel = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  hasMoreItems = true;
  
  // Purchase modal
  showPurchaseModal = false;
  selectedFile: DigitalFile | null = null;
  
  // Payment instructions modal
  showPaymentModal = false;
  
  // Login required modal
  showLoginModal = false;
  
  // Current user email for payment purposes
  currentUserEmail = '';
  
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _digitalFileService: DigitalFileService,
    private _translate: TranslateService
  ) {
    // Initialize arrays to prevent undefined issues
    this.files = [];
    this.displayedFiles = [];
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadFiles();
    this.setupLanguageDetection();
    
    // Check authentication status immediately
    this._auth.user$.subscribe(user => {
      if (!user) {
        this.isLoggedIn = false;
        this.showLoginModal = true;
        this.currentUserEmail = '';
        console.log('User not authenticated, showing login modal');
      } else {
        this.isLoggedIn = true;
        this.showLoginModal = false;
        this.currentUserEmail = user.email || '';
        console.log('User authenticated:', user.uid, 'Email:', user.email);
      }
    });
  }

  /**
   * Loads the current user profile
   */
  private loadUserProfile(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => {
        if (user) {
          this.isLoggedIn = true;
          this.showLoginModal = false; // Hide modal if user is logged in
          return this._userService.getUserProfile(user.uid);
        } else {
          this.isLoggedIn = false;
          this.showLoginModal = true; // Show modal if user is not logged in
          return of(null);
        }
      }),
      catchError(() => {
        this.isLoggedIn = false;
        this.showLoginModal = true; // Show modal on error
        return of(null);
      })
    );
  }

  /**
   * Loads all active digital files
   */
  private loadFiles(): void {
    this.isLoading = true;
    
    this._digitalFileService.getActiveFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.filterFiles();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading files:', error);
        this.files = [];
        this.displayedFiles = [];
        this.isLoading = false;
      }
    });
  }

  /**
   * Sets up language detection for currency display
   */
  private setupLanguageDetection(): void {
    // Language detection is handled in the template via _translate.currentLang
    // No need for additional subscription
  }
  
  /**
   * Shows login required modal
   */
  showLoginRequiredModal(): void {
    this.showLoginModal = true;
  }
  
  /**
   * Closes login required modal
   */
  closeLoginModal(): void {
    this.showLoginModal = false;
  }
  
  /**
   * Navigates to login page
   */
  goToLogin(): void {
    this.closeLoginModal();
    this.goBack();
  }

  /**
   * Clears all filters and resets to show all files
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLanguage = '';
    this.selectedAccessLevel = '';
    this.filterFiles();
  }

  /**
   * Filters files based on search term and selected filters
   */
  filterFiles(): void {
    let filtered = this.files || [];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(file =>
        file.title.toLowerCase().includes(search) ||
        file.description.toLowerCase().includes(search) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }

    // Language filter
    if (this.selectedLanguage && this.selectedLanguage !== 'all') {
      filtered = filtered.filter(file => file.language === this.selectedLanguage);
    }

    // Access level filter
    if (this.selectedAccessLevel && this.selectedAccessLevel !== 'all') {
      filtered = filtered.filter(file => file.accessLevel === this.selectedAccessLevel);
    }

    this.displayedFiles = filtered;
    this.currentPage = 1;
    this.hasMoreItems = this.displayedFiles.length > this.itemsPerPage;
    console.log('Filtered:', filtered.length, 'files from', this.files.length, 'total');
  }

  /**
   * Loads more files for pagination
   */
  loadMore(): void {
    if (this.hasMoreItems) {
      this.currentPage++;
      this.hasMoreItems = this.displayedFiles.length > this.currentPage * this.itemsPerPage;
    }
  }

  /**
   * Gets files for current page
   */
  getCurrentPageFiles(): DigitalFile[] {
    if (!this.displayedFiles || this.displayedFiles.length === 0) {
      return [];
    }
    const startIndex = 0;
    const endIndex = this.currentPage * this.itemsPerPage;
    return this.displayedFiles.slice(startIndex, endIndex);
  }

  /**
   * Opens purchase modal for a file
   */
  openPurchaseModal(file: DigitalFile): void {
    this.selectedFile = file;
    this.showPurchaseModal = true;
  }

  /**
   * Closes purchase modal
   */
  closePurchaseModal(): void {
    this.showPurchaseModal = false;
    this.selectedFile = null;
  }

  /**
   * Opens payment instructions modal
   */
  openPaymentModal(): void {
    this.showPaymentModal = true;
    this.showPurchaseModal = false;
  }

  /**
   * Closes payment instructions modal
   */
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedFile = null;
  }

  /**
   * Checks if user has access to a file
   */
  hasAccess(fileId: string): boolean {
    // TODO: Implement access check from UserAccess service
    // For now, always return false to show buy buttons
    return false;
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  /**
   * Gets currency symbol based on current language
   */
  getCurrencySymbol(): string {
    const currentLang = this._translate.currentLang || 'sr';
    return currentLang === 'sr' ? 'RSD' : '€';
  }

  /**
   * Gets price for current language
   */
  getPrice(file: DigitalFile): number {
    const currentLang = this._translate.currentLang || 'sr';
    return currentLang === 'sr' ? file.priceRSD : file.priceEUR;
  }

  /**
   * Navigate back to home page
   */
  goBack(): void {
    this._router.navigate(['/']).then((): void => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Copies PayPal link to clipboard
   */
  copyPayPalLink(): void {
    const paypalLink = 'paypal.me/anavaspitac';
    navigator.clipboard.writeText(paypalLink).then(() => {
      // You can add a toast notification here if you want
      console.log('PayPal link copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy PayPal link:', err);
    });
  }

  /**
   * Gets file extension from MIME type or filename
   */
  getFileExtension(fileType: string): string {
    if (!fileType) return '';
    
    // If it's a MIME type like "application/pdf", extract the extension
    if (fileType.includes('/')) {
      const extension = fileType.split('/')[1];
      return extension.toUpperCase();
    }
    
    // If it's already just an extension, return it uppercase
    if (fileType.includes('.')) {
      const extension = fileType.split('.').pop();
      return extension ? extension.toUpperCase() : fileType.toUpperCase();
    }
    
    // Otherwise, return the fileType as is, uppercase
    return fileType.toUpperCase();
  }

  /**
   * Gets current user email
   */
  getUserEmail(): string {
    return this.currentUserEmail || 'user@example.com';
  }


}
