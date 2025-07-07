import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Shop component for displaying donation and support information
 */
@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent {
  copiedPayPal = false;
  paypalEmail = 'ana.petrovic.vaspitac@gmail.com';

  /**
   * Constructor for ShopComponent
   * @param _router - Router service (unused)
   */
  constructor(private _router: Router) {}

  /**
   * Navigate back to home page and scroll to top
   */
  goBack(): void {
    this._router.navigate(['/']).then((): void => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Copy PayPal email to clipboard with fallback support
   */
  async copyPayPalEmail(): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.paypalEmail);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = this.paypalEmail;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      this.copiedPayPal = true;
      setTimeout(() => (this.copiedPayPal = false), 2000);
    } catch {
      this.copiedPayPal = false;
    }
  }
}
