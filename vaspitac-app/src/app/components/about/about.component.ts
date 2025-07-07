import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * About component for displaying information about the app and developer
 */
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  /**
   * Constructor for AboutComponent
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
}
