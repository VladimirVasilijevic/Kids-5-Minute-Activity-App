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
import { Capacitor } from '@capacitor/core';

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

  // DEBUG: Remove after debugging - Debug panel properties
  debugLogs: string[] = [];
  debugPlatform = '';
  debugCapacitorAvailable = false;
  debugLastDownloadAttempt: any = null;
  debugLastError: any = null;
  showDebugPanel = true; // Set to false to hide debug panel

  
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
    // DEBUG: Initialize debug information
    this.initializeDebugInfo();
    
    // Load files immediately - everyone can browse shop
    this.loadFiles();
    this.setupLanguageDetection();
    
    // Check authentication status for download functionality only
    this._auth.user$.subscribe(user => {
      if (!user) {
        this.isLoggedIn = false;
        this.showLoginModal = false; // Don't show modal - shop is accessible to all
        this.currentUserEmail = '';
        this.currentUserId = null;
        this.userAccessMap = {};
      } else {
        this.isLoggedIn = true;
        this.showLoginModal = false;
        this.currentUserEmail = user.email || '';
        this.currentUserId = user.uid;
        this.loadUserProfile();
        this.loadUserAccess();
      }
    });
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
        
        // Load user access if user is logged in
        if (this.isLoggedIn && this.currentUserId) {
          this.loadUserAccess();
        }
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
    // DEBUG: Log download attempt
    this.addDebugLog(`🚀 Starting download for: ${file.title}`);
    this.addDebugLog(`📱 Platform: ${this.debugPlatform}`);
    this.addDebugLog(`🔧 Capacitor available: ${this.debugCapacitorAvailable}`);
    this.addDebugLog(`👤 User logged in: ${this.isLoggedIn}`);
    this.addDebugLog(`🔑 User ID: ${this.currentUserId}`);
    this.addDebugLog(`📁 File ID: ${file.id}`);
    this.addDebugLog(`🌐 File URL: ${file.fileUrl}`);
    this.addDebugLog(`📄 File Type: ${file.fileType}`);
    this.addDebugLog(`📊 File Size: ${file.fileSize} bytes`);
    
    this.debugLastDownloadAttempt = {
      fileId: file.id,
      fileName: file.title,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileSize: file.fileSize,
      timestamp: new Date().toISOString(),
      platform: this.debugPlatform,
      capacitorAvailable: this.debugCapacitorAvailable,
      userLoggedIn: this.isLoggedIn,
      userId: this.currentUserId
    };

    if (!this.hasAccess(file.id)) {
      const errorMsg = 'User does not have access to this file';
      console.error(errorMsg);
      this.addDebugLog(`❌ ${errorMsg}`);
      this.debugLastError = { message: errorMsg, timestamp: new Date().toISOString() };
      return;
    }

    this.addDebugLog(`✅ User has access to file: ${file.id}`);

    this._digitalFileService.downloadFile(file).subscribe({
      next: (success: boolean) => {
        if (success) {
          const successMsg = `File download successful: ${file.title}`;
          console.log('✅', successMsg);
          this.addDebugLog(`✅ ${successMsg}`);
          alert(`File "${file.title}" downloaded successfully! Check your Downloads folder.`);
        } else {
          const failMsg = `File download failed: ${file.title}`;
          console.error('❌', failMsg);
          this.addDebugLog(`❌ ${failMsg}`);
          this.debugLastError = { message: failMsg, timestamp: new Date().toISOString() };
          alert(`Failed to download "${file.title}". Please try again.`);
        }
      },
      error: (error) => {
        const errorMsg = `Error downloading file: ${error.message || 'Unknown error'}`;
        console.error('❌', errorMsg);
        this.addDebugLog(`❌ ${errorMsg}`);
        this.debugLastError = { 
          message: errorMsg, 
          error: error,
          timestamp: new Date().toISOString() 
        };
        alert(`Error downloading "${file.title}": ${error.message || 'Unknown error'}`);
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
    const paypalLink = this.selectedFile?.paypalLink || 'https://paypal.me/anavaspitac?country.x=RS&locale.x=en_US';
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
    const bankAccount = this.selectedFile?.bankAccountNumber || this._translate.instant('SHOP.BANK_ACCOUNT');
    const recipient = this.selectedFile?.author || this._translate.instant('SHOP.BANK_RECIPIENT');
    const phoneNumber = this.selectedFile?.phoneNumber || '+381 61 634 9493';
    
    const bankDetails = `Broj računa: ${bankAccount}
Primalac: ${recipient}
Telefon (Viber): ${phoneNumber}`;
    
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
    // Set the selected file for the payment modal
    this.selectedFile = file;

    // Open payment modal to show instructions directly
    this.openPaymentModal();
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
    if (!this.isLoggedIn) {
      return this.files.length > 0; // Show files even if not logged in
    }
    return this.files.length > 0 && Object.keys(this.userAccessMap).length > 0;
  }

  /**
   * Navigate to file detail page
   */
  goToFileDetail(file: DigitalFile): void {
    this._router.navigate(['/shop/file', file.id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Check if a product is digital (has a file) or physical (no file)
   */
  isDigitalProduct(file: DigitalFile): boolean {
    return !!(file.fileUrl && file.fileUrl.trim());
  }

  /**
   * Check if a digital product has complete file information
   */
  hasCompleteFileInfo(file: DigitalFile): boolean {
    return !!(file.fileType && file.fileSize && file.fileUrl);
  }

  /**
   * Check if a product is physical (will be shipped)
   */
  isPhysicalProduct(file: DigitalFile): boolean {
    return !this.isDigitalProduct(file);
  }

  // DEBUG: Remove after debugging - Debug methods
  /**
   * Initialize debug information
   */
  private initializeDebugInfo(): void {
    this.debugPlatform = Capacitor.getPlatform();
    this.debugCapacitorAvailable = typeof Capacitor !== 'undefined';
    this.addDebugLog(`🔧 Debug panel initialized`);
    this.addDebugLog(`📱 Platform: ${this.debugPlatform}`);
    this.addDebugLog(`🔧 Capacitor available: ${this.debugCapacitorAvailable}`);
    this.addDebugLog(`🌐 User Agent: ${navigator.userAgent}`);
    this.addDebugLog(`⏰ Current time: ${new Date().toISOString()}`);
  }

  /**
   * Add a debug log entry
   */
  private addDebugLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.debugLogs.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 50 logs to prevent memory issues
    if (this.debugLogs.length > 50) {
      this.debugLogs = this.debugLogs.slice(0, 50);
    }
    
    console.log(`[DEBUG] ${message}`);
  }

  /**
   * Clear debug logs
   */
  clearDebugLogs(): void {
    this.debugLogs = [];
    this.debugLastError = null;
    this.debugLastDownloadAttempt = null;
    this.addDebugLog('🧹 Debug logs cleared');
  }

  /**
   * Toggle debug panel visibility
   */
  toggleDebugPanel(): void {
    this.showDebugPanel = !this.showDebugPanel;
    this.addDebugLog(`🔧 Debug panel ${this.showDebugPanel ? 'shown' : 'hidden'}`);
  }

  /**
   * Get debug info as JSON string
   */
  getDebugInfoAsJson(): string {
    return JSON.stringify({
      platform: this.debugPlatform,
      capacitorAvailable: this.debugCapacitorAvailable,
      userAgent: navigator.userAgent,
      currentTime: new Date().toISOString(),
      lastDownloadAttempt: this.debugLastDownloadAttempt,
      lastError: this.debugLastError,
      logs: this.debugLogs.slice(0, 10) // Last 10 logs
    }, null, 2);
  }
}
