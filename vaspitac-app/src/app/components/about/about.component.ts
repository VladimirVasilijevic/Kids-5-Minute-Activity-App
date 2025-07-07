import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 *
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  /**
   *
   * @param router
   */
  constructor(private router: Router) {}

  /**
   *
   */
  goBack() {
    this.router.navigate(['/']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
