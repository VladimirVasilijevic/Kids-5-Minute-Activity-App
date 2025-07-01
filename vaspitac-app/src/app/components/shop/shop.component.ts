import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent {
  copiedPayPal = false
  paypalEmail = 'ana.petrovic.vaspitac@gmail.com'

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  async copyPayPalEmail () {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.paypalEmail)
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea')
        textarea.value = this.paypalEmail
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      this.copiedPayPal = true
      setTimeout(() => (this.copiedPayPal = false), 2000)
    } catch (err) {
      this.copiedPayPal = false
    }
  }
} 