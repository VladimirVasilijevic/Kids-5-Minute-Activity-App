import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  isVisible = false;

  /**
   * Host listener for window scroll events
   * Triggers visibility toggle when user scrolls
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.toggleVisibility();
  }

  /**
   * Lifecycle hook that is called after data-bound properties are initialized
   */
  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Lifecycle hook that is called before the component is destroyed
   * Performs cleanup operations if needed
   */
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private toggleVisibility(): void {
    if (window.pageYOffset > 300) {
      this.isVisible = true;
    } else {
      this.isVisible = false;
    }
  }

  /**
   * Scrolls the page to the top with smooth animation
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
} 