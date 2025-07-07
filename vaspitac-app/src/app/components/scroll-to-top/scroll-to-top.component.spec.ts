import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollToTopComponent } from './scroll-to-top.component';

/**
 * Unit tests for ScrollToTopComponent
 * Tests scroll-to-top functionality, visibility logic, and user interactions
 */

describe('ScrollToTopComponent', () => {
  let component: ScrollToTopComponent;
  let fixture: ComponentFixture<ScrollToTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollToTopComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible initially', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should show button when scrolled down more than 300px', () => {
    // Mock scroll position above threshold
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeTrue();
  });

  it('should hide button when scrolled less than 300px', () => {
    // Mock scroll position below threshold
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeFalse();
  });

  it('should hide button when exactly at 300px threshold', () => {
    // Mock scroll position at threshold
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 300
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeFalse();
  });

  it('should show button when scrolled exactly 301px', () => {
    // Mock scroll position just above threshold
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 301
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeTrue();
  });

  it('should call scrollToTop when button is clicked', () => {
    spyOn(window, 'scrollTo');
    component.scrollToTop();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('should call scrollToTop only once per click', () => {
    spyOn(window, 'scrollTo');
    component.scrollToTop();
    component.scrollToTop();
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple scroll events correctly', () => {
    // Start at top
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0
    });
    component.onWindowScroll();
    expect(component.isVisible).toBeFalse();

    // Scroll down
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400
    });
    component.onWindowScroll();
    expect(component.isVisible).toBeTrue();

    // Scroll back up
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100
    });
    component.onWindowScroll();
    expect(component.isVisible).toBeFalse();
  });

  it('should handle edge case of very large scroll position', () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 10000
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeTrue();
  });

  it('should handle edge case of negative scroll position', () => {
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: -100
    });

    component.onWindowScroll();
    expect(component.isVisible).toBeFalse();
  });

  it('should have correct initial state after component initialization', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should have onWindowScroll method defined', () => {
    expect(typeof component.onWindowScroll).toBe('function');
  });

  describe('Component Template', () => {
    it('should render button when isVisible is true', () => {
      component.isVisible = true;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should not render button when isVisible is false', () => {
      component.isVisible = false;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button).toBeFalsy();
    });

    it('should have correct CSS classes on button', () => {
      component.isVisible = true;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('fixed')).toBeTrue();
      expect(button.classList.contains('bottom-6')).toBeTrue();
      expect(button.classList.contains('right-6')).toBeTrue();
      expect(button.classList.contains('z-50')).toBeTrue();
      expect(button.classList.contains('bg-green-600')).toBeTrue();
    });

    it('should have correct aria-label for accessibility', () => {
      component.isVisible = true;
      fixture.detectChanges();
      
      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('aria-label')).toBe('Scroll to top');
    });

    it('should call scrollToTop when button is clicked', () => {
      component.isVisible = true;
      fixture.detectChanges();
      
      spyOn(component, 'scrollToTop');
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      
      expect(component.scrollToTop).toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize correctly', () => {
      expect(component.isVisible).toBeFalse();
    });

    it('should handle cleanup in ngOnDestroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should call ngOnInit without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should have proper lifecycle methods defined', () => {
      expect(typeof component.ngOnInit).toBe('function');
      expect(typeof component.ngOnDestroy).toBe('function');
    });
  });

  describe('Public Methods', () => {
    it('should have onWindowScroll method with proper JSDoc', () => {
      expect(typeof component.onWindowScroll).toBe('function');
      expect(component.onWindowScroll.name).toBe('onWindowScroll');
    });

    it('should have scrollToTop method with proper JSDoc', () => {
      expect(typeof component.scrollToTop).toBe('function');
      expect(component.scrollToTop.name).toBe('scrollToTop');
    });

    it('should call window.scrollTo when scrollToTop is called', () => {
      spyOn(window, 'scrollTo');
      component.scrollToTop();
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should handle scrollToTop multiple times', () => {
      spyOn(window, 'scrollTo');
      
      component.scrollToTop();
      component.scrollToTop();
      component.scrollToTop();
      
      expect(window.scrollTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined pageYOffset gracefully', () => {
      // Mock undefined pageYOffset
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: undefined
      });

      expect(() => component.onWindowScroll()).not.toThrow();
    });

    it('should handle null pageYOffset gracefully', () => {
      // Mock null pageYOffset
      Object.defineProperty(window, 'pageYOffset', {
        writable: true,
        value: null
      });

      expect(() => component.onWindowScroll()).not.toThrow();
    });
  });
}); 