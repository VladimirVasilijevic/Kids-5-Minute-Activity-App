import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ResetPasswordModalComponent } from './reset-password-modal.component';

describe('ResetPasswordModalComponent', () => {
  let component: ResetPasswordModalComponent;
  let fixture: ComponentFixture<ResetPasswordModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordModalComponent],
      imports: [
        FormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: class MockLoader { getTranslation(): any { return of({}); } } }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isOpen).toBe(false);
    expect(component.email).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBeNull();
    expect(component.success).toBe(false);
    expect(component.localEmail).toBe('');
  });

  it('should update localEmail when email input changes', () => {
    component.email = 'test@example.com';
    component.ngOnChanges();
    expect(component.localEmail).toBe('test@example.com');
  });

  it('should keep localEmail empty when email input is empty', () => {
    component.email = '';
    component.ngOnChanges();
    expect(component.localEmail).toBe('');
  });

  it('should emit send event with email when onSend is called with valid email', () => {
    spyOn(component.send, 'emit');
    component.localEmail = 'test@example.com';
    
    component.onSend();
    
    expect(component.send.emit).toHaveBeenCalledWith('test@example.com');
  });

  it('should not emit send event when onSend is called with empty email', () => {
    spyOn(component.send, 'emit');
    component.localEmail = '';
    
    component.onSend();
    
    expect(component.send.emit).not.toHaveBeenCalled();
  });

  it('should not emit send event when onSend is called with whitespace email', () => {
    spyOn(component.send, 'emit');
    component.localEmail = '   ';
    
    component.onSend();
    
    expect(component.send.emit).not.toHaveBeenCalled();
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.close, 'emit');
    
    component.onClose();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should handle isOpen input property', () => {
    component.isOpen = true;
    expect(component.isOpen).toBe(true);
    
    component.isOpen = false;
    expect(component.isOpen).toBe(false);
  });

  it('should handle isLoading input property', () => {
    component.isLoading = true;
    expect(component.isLoading).toBe(true);
    
    component.isLoading = false;
    expect(component.isLoading).toBe(false);
  });

  it('should handle errorMessage input property', () => {
    component.errorMessage = 'Test error message';
    expect(component.errorMessage).toBe('Test error message');
    
    component.errorMessage = null;
    expect(component.errorMessage).toBeNull();
  });

  it('should handle success input property', () => {
    component.success = true;
    expect(component.success).toBe(true);
    
    component.success = false;
    expect(component.success).toBe(false);
  });

  it('should handle email input property', () => {
    component.email = 'new@example.com';
    expect(component.email).toBe('new@example.com');
  });

  it('should update localEmail when ngOnChanges is called multiple times', () => {
    component.email = 'first@example.com';
    component.ngOnChanges();
    expect(component.localEmail).toBe('first@example.com');
    
    component.email = 'second@example.com';
    component.ngOnChanges();
    expect(component.localEmail).toBe('second@example.com');
  });

  it('should maintain localEmail when ngOnChanges is called with same email', () => {
    component.email = 'test@example.com';
    component.ngOnChanges();
    expect(component.localEmail).toBe('test@example.com');
    
    // Change localEmail manually
    component.localEmail = 'modified@example.com';
    
    // Call ngOnChanges again with same email
    component.ngOnChanges();
    expect(component.localEmail).toBe('test@example.com');
  });

  it('should handle email with special characters', () => {
    component.email = 'test+tag@example.com';
    component.ngOnChanges();
    expect(component.localEmail).toBe('test+tag@example.com');
  });

  it('should handle very long email addresses', () => {
    const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
    component.email = longEmail;
    component.ngOnChanges();
    expect(component.localEmail).toBe(longEmail);
  });

  it('should emit events in correct order', () => {
    spyOn(component.send, 'emit');
    spyOn(component.close, 'emit');
    
    component.localEmail = 'test@example.com';
    component.onSend();
    component.onClose();
    
    expect(component.send.emit).toHaveBeenCalledBefore(component.close.emit);
  });

  it('should handle component lifecycle properly', () => {
    // Test that component can be destroyed and recreated
    fixture.destroy();
    
    fixture = TestBed.createComponent(ResetPasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
    expect(component.localEmail).toBe('');
  });
}); 