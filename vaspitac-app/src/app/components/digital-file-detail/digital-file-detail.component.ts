import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { DigitalFile } from '../../models/digital-file.model';
import { DigitalFileService } from '../../services/digital-file.service';
import { AuthService } from '../../services/auth.service';
import { UserAccessService } from '../../services/user-access.service';
import { formatFileSize } from '../../models/marketplace.utils';

/**
 * Digital File detail component for displaying individual file information
 */
@Component({
  selector: 'app-digital-file-detail',
  templateUrl: './digital-file-detail.component.html',
  styleUrls: ['./digital-file-detail.component.scss'],
})
export class DigitalFileDetailComponent implements OnInit {
  file$!: Observable<DigitalFile | null>;
  isLoggedIn = false;
  currentUserEmail = '';
  currentUserId: string | null = null;
  hasAccess = false;
  isLoadingAccess = false;

  // Purchase modal
  showPurchaseModal = false;
  selectedFile: DigitalFile | null = null;
  
  // Payment instructions modal
  showPaymentModal = false;
  
  // Login required modal
  showLoginModal = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _translate: TranslateService,
    private _digitalFileService: DigitalFileService,
    private _auth: AuthService,
    private _userAccessService: UserAccessService
  ) {}

  ngOnInit(): void {
    // Load file data
    this.file$ = this._route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          return of(null);
        }
        return this._digitalFileService.getFile(id);
      }),
      catchError(error => {
        console.error('Error loading digital file:', error);
        return of(null);
      })
    );

    // Check authentication status
    this._auth.user$.subscribe(user => {
      if (!user) {
        this.isLoggedIn = false;
        this.currentUserEmail = '';
        this.currentUserId = null;
        this.hasAccess = false;
      } else {
        this.isLoggedIn = true;
        this.currentUserEmail = user.email || '';
        this.currentUserId = user.uid;
        this.loadUserAccess();
      }
    });
  }

  /**
   * Loads user access for the current file
   */
  private loadUserAccess(): void {
    if (!this.currentUserId) return;

    this.file$.subscribe(file => {
      if (file) {
        this.isLoadingAccess = true;
        this._userAccessService.hasAccess(this.currentUserId!, file.id)
          .subscribe({
            next: (hasAccess) => {
              this.hasAccess = hasAccess;
              this.isLoadingAccess = false;
            },
            error: (error) => {
              console.error('Error checking user access:', error);
              this.hasAccess = false;
              this.isLoadingAccess = false;
            }
          });
      }
    });
  }

  /**
   * Navigate back to shop page
   */
  goBack(): void {
    this._router.navigate(['/shop']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Opens purchase modal for the file
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
    // You can implement actual login navigation here
    this.goBack();
  }

  /**
   * Downloads a file (for users who have access)
   */
  downloadFile(file: DigitalFile): void {
    if (!this.hasAccess) {
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
      }
    });
  }

  /**
   * Initiates purchase process for a file
   */
  initiatePurchase(file: DigitalFile): void {
    this.selectedFile = file;
    this.openPaymentModal();
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
    return currentLang === 'en' ? 'EUR' : 'RSD';
  }

  /**
   * Gets price for current language
   */
  getPrice(file: DigitalFile): number {
    const currentLang = this._translate.currentLang || 'sr';
    return currentLang === 'en' ? file.priceEUR : file.priceRSD;
  }


  /**
   * Gets file extension from MIME type or filename
   */
  getFileExtension(fileType: string): string {
    if (!fileType) return '';
    
    if (fileType.includes('/')) {
      const extension = fileType.split('/')[1];
      return extension.toUpperCase();
    }
    
    if (fileType.includes('.')) {
      const extension = fileType.split('.').pop();
      return extension ? extension.toUpperCase() : fileType.toUpperCase();
    }
    
    return fileType.toUpperCase();
  }

  /**
   * Gets current user email
   */
  getUserEmail(): string {
    return this.currentUserEmail || 'user@example.com';
  }

  /**
   * Gets the appropriate action button for the file
   */
  getActionButton(file: DigitalFile): 'purchase' | 'download' | 'login' {
    if (!this.isLoggedIn) return 'login';
    if (this.hasAccess) return 'download';
    return 'purchase';
  }
}


