import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { DigitalFile } from '../../models/digital-file.model';
import { DigitalFileService } from '../../services/digital-file.service';
import { UserAccessService } from '../../services/user-access.service';
import { PurchaseService } from '../../services/purchase.service';
import { PurchaseFormData } from '../../models/purchase.model';

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
  

  
  // Purchase modal
  showPurchaseModal = false;
  selectedFile: DigitalFile | null = null;
  
  // Payment instructions modal
  showPaymentModal = false;
  
  // Login required modal
  showLoginModal = false;
  
  // Current user email for payment purposes
  currentUserEmail = '';
  
  // User access tracking
  userAccessMap: Record<string, boolean> = {};
  currentUserId: string | null = null;
  isRefreshingAccess = false; // Add flag to prevent multiple simultaneous refreshes

  
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _digitalFileService: DigitalFileService,
    private _userAccessService: UserAccessService,
    private _purchaseService: PurchaseService,
    private _translate: TranslateService,
    private _functions: AngularFireFunctions
  ) {
    // Initialize arrays to prevent undefined issues
    this.files = [];
    this.displayedFiles = [];
    

  }

  ngOnInit(): void {
    // First load user profile and check authentication
    this.loadUserProfile();
    
    // Check authentication status immediately
    this._auth.user$.subscribe(user => {
      if (!user) {
        this.isLoggedIn = false;
        this.showLoginModal = true;
        this.currentUserEmail = '';
        this.currentUserId = null;
        this.userAccessMap = {};
      } else {
        this.isLoggedIn = true;
        this.showLoginModal = false;
        this.currentUserEmail = user.email || '';
        this.currentUserId = user.uid;
        
        // Only load files after user is authenticated
        this.loadFiles();
        // Note: loadUserAccess will be called after files are loaded
      }
    });
    
    this.setupLanguageDetection();
  }

  /**
   * Manually trigger access loading (for user control)
   */
  loadAccessNow(): void {
    if (this.isAccessReady) {
      return;
    }
    
    if (this.currentUserId && this.files.length > 0) {
      this.loadUserAccess();
    }
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
      catchError(error => {
        console.error('Error loading user profile:', error);
        this.isLoggedIn = false;
        this.showLoginModal = true;
        return of(null);
      })
    );
  }

  /**
   * Loads user access for all displayed files
   */
  private loadUserAccess(): void {
    if (!this.currentUserId || this.files.length === 0) {
      this.isRefreshingAccess = false; // Reset flag
      return;
    }

    const fileIds = this.files.map(file => file.id);
    
    // First try the Firebase function approach
    this._userAccessService.hasMultipleAccess(this.currentUserId, fileIds)
      .subscribe({
        next: (accessMap) => {
          this.userAccessMap = accessMap;
          this.isRefreshingAccess = false; // Reset flag
          // User access map loaded successfully via Firebase function
          
        },
        error: (error) => {
          console.error('Error loading user access via Firebase function, trying direct Firestore query:', error);
          // Fallback: try direct Firestore query
          this.loadUserAccessDirectly(fileIds);
        }
      });
  }

  /**
   * Fallback method to load user access directly from Firestore
   */
  private loadUserAccessDirectly(fileIds: string[]): void {
    // Use the injected AngularFirestore service
    const firestore = (this as any)._afs || (this as any)._firestore;
    
    if (!firestore) {
      console.error('Firestore service not available for direct query');
      // Final fallback: initialize with all false
      this.userAccessMap = {};
      fileIds.forEach(fileId => {
        this.userAccessMap[fileId] = false;
      });
      this.isRefreshingAccess = false; // Reset flag
      return;
    }
    
    // Query the user_access collection directly
    const accessQuery = firestore
      .collection('user_access', (ref: any) => 
        ref.where('userId', '==', this.currentUserId)
           .where('isActive', '==', true)
      )
      .valueChanges({ idField: 'id' });
    
    accessQuery.subscribe({
      next: (accessRecords: any[]) => {
        // Create access map
        const accessMap: Record<string, boolean> = {};
        fileIds.forEach(fileId => {
          accessMap[fileId] = accessRecords.some(record => record.fileId === fileId);
        });
        
        this.userAccessMap = accessMap;
        this.isRefreshingAccess = false; // Reset flag
      },
      error: (error: any) => {
        console.error('Error with direct Firestore query:', error);
        // Final fallback: initialize with all false
        this.userAccessMap = {};
        fileIds.forEach(fileId => {
          this.userAccessMap[fileId] = false;
        });
        this.isRefreshingAccess = false; // Reset flag
      }
    });
  }

  /**
   * Loads digital files from the service
   */
  private loadFiles(): void {
    this.isLoading = true;
    this._digitalFileService.getActiveFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.displayedFiles = files;
        this.isLoading = false;
        
        // Always try to load user access after files are loaded
        // The loadUserAccess method will handle the case where user is not authenticated
        this.loadUserAccess();
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
   * Sets up language detection for translations
   */
  private setupLanguageDetection(): void {
    // This will be handled by the translate service
    // We can add custom logic here if needed
  }

  /**
   * Filters files based on search term and selected filters
   */
  filterFiles(): void {
    let filtered = [...this.files];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(file =>
        file.title.toLowerCase().includes(searchLower) ||
        file.description.toLowerCase().includes(searchLower) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Filter by language
    if (this.selectedLanguage) {
      filtered = filtered.filter(file => file.language === this.selectedLanguage);
    }



    this.displayedFiles = filtered;
  }



  /**
   * Opens purchase modal for a specific file
   */
  openPurchaseModal(file: DigitalFile): void {
    if (!this.isLoggedIn) {
      this.showLoginRequiredModal();
      return;
    }
    
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
   * Refreshes the user access map
   */
  refreshUserAccess(): void {
    if (this.isRefreshingAccess) {
      return;
    }
    
    if (!this.currentUserId || this.files.length === 0) {
      return;
    }
    
    this.isRefreshingAccess = true;

    
    this.loadUserAccess();
  }



  /**
   * Checks if user has access to a file
   */
  hasAccess(fileId: string): boolean {
    if (!this.isLoggedIn || !this.currentUserId) {
      return false;
    }
    
    // If the access map is empty, just return false - don't trigger refresh here
    if (Object.keys(this.userAccessMap).length === 0) {
      return false;
    }
    
    const hasAccess = this.userAccessMap[fileId] || false;
    

    
    return hasAccess;
  }

  /**
   * Gets the appropriate action button for a file
   */
  getActionButton(file: DigitalFile): 'purchase' | 'download' | 'login' {
    if (!this.isLoggedIn) return 'login';
    if (this.hasAccess(file.id)) return 'download';
    return 'purchase';
  }

  /**
   * Downloads a file (for users who have access)
   */
  downloadFile(file: DigitalFile): void {
    if (!this.hasAccess(file.id)) {
      console.error('User does not have access to this file');
      return;
    }

    this._digitalFileService.downloadFile(file).subscribe({
      next: (success: boolean) => {
        if (success) {
          // File download successful
        } else {
          console.error('File download failed:', file.title);
        }
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        // You can add an error notification here
      }
    });
  }

  /**
   * Shows login required modal
   */
  showLoginRequiredModal(): void {
    this.showLoginModal = true;
  }

  /**
   * Closes login modal
   */
  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  /**
   * Navigates to login page
   */
  goToLogin(): void {
    this.closeLoginModal();
    this.goBack(); // For now, just go back. You can implement actual login navigation
  }

  /**
   * Clears all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLanguage = '';
    this.filterFiles();
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
  getCurrencySymbol(): 'RSD' | 'EUR' {
    const currentLang = this._translate.currentLang || 'sr';
    return currentLang === 'sr' ? 'RSD' : 'EUR';
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
      // PayPal link copied successfully
    }).catch(err => {
      console.error('Failed to copy PayPal link:', err);
    });
  }

  /**
   * Copies bank details to clipboard
   */
  copyBankDetails(): void {
    const bankDetails = `Account Number: ${this._translate.instant('SHOP.BANK_ACCOUNT')}
Recipient: ${this._translate.instant('SHOP.BANK_RECIPIENT')}`;
    
    navigator.clipboard.writeText(bankDetails).then(() => {
      // Bank details copied successfully
    }).catch(err => {
      console.error('Failed to copy bank details:', err);
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

  /**
   * Initiates purchase process for a file
   */
  initiatePurchase(file: DigitalFile): void {
    if (!this.isLoggedIn || !this.currentUserId) {
      this.showLoginRequiredModal();
      return;
    }

    // Set the selected file for the payment modal
    this.selectedFile = file;

    // Create purchase record
    const purchaseData: PurchaseFormData = {
      userId: this.currentUserId,
      fileId: file.id,
      amount: this.getPrice(file),
      currency: this.getCurrencySymbol()
    };

    this._purchaseService.createPurchase(purchaseData).then(purchaseId => {
      // Open payment modal to show instructions
      this.openPaymentModal();
    }).catch(error => {
      console.error('Error creating purchase:', error);
    });
  }



  /**
   * Getter for access map size (for template use)
   */
  get accessMapSize(): number {
    return Object.keys(this.userAccessMap).length;
  }

  /**
   * Check if access checking is ready (for template use)
   */
  get isAccessReady(): boolean {
    return this.isLoggedIn && !!this.currentUserId && this.files.length > 0 && Object.keys(this.userAccessMap).length > 0;
  }
}
