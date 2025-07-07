import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

import { ShopComponent } from './shop.component';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let router: Router;
  let _translate: TranslateService;

  beforeEach(async (): Promise<void> => {
    const navigateSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve());
    await TestBed.configureTestingModule({
      declarations: [ShopComponent, MockTranslatePipe],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: Router, useValue: { navigate: navigateSpy } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    _translate = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should render the shop title and description', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    const desc = compiled.querySelector('p.text-base.md\\:text-lg');
    expect(title).toBeTruthy();
    expect(desc).toBeTruthy();
    expect(title && title.textContent).toContain('SHOP.TITLE');
    expect(desc && desc.textContent).toContain('SHOP.DESCRIPTION');
  });

  it('should navigate back to home on back button click', (): void => {
    const backBtn = fixture.debugElement.query(By.css('button'));
    backBtn.triggerEventHandler('click', null);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should copy PayPal email and show feedback', fakeAsync((): void => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.copyPayPalEmail();
    tick();
    expect(component.copiedPayPal).toBeTrue();
    tick(2000);
    expect(component.copiedPayPal).toBeFalse();
  }));

  it('should render PayPal email', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ana.petrovic.vaspitac@g'); // partial check for obfuscated email
    expect(compiled.textContent).toContain('SHOP.PAYPAL_EMAIL_LABEL');
  });

  it('should use fallback copy method if navigator.clipboard is not available', fakeAsync((): void => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const textarea = document.createElement('textarea');
    spyOn(document, 'createElement').and.returnValue(textarea);
    spyOn(document.body, 'appendChild').and.callThrough();
    spyOn(document.body, 'removeChild').and.callThrough();
    spyOn(textarea, 'select').and.callThrough();
    spyOn(document, 'execCommand').and.returnValue(true);
    component.copyPayPalEmail();
    tick(2000); // flush all timers
    expect(document.createElement).toHaveBeenCalledWith('textarea');
    expect(document.body.appendChild).toHaveBeenCalledWith(textarea);
    expect(textarea.select).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    expect(document.body.removeChild).toHaveBeenCalledWith(textarea);
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
  }));

  it('should handle error in copyPayPalEmail gracefully', fakeAsync((): void => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject('fail'));
    component.copyPayPalEmail();
    tick();
    expect(component.copiedPayPal).toBeFalse();
  }));

  it('should show feedback UI when copiedPayPal is true', (): void => {
    component.copiedPayPal = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('SHOP.COPIED');
  });
});
