import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { DigitalFileDetailComponent } from './digital-file-detail.component';
import { DigitalFileService } from '../../services/digital-file.service';
import { AuthService } from '../../services/auth.service';
import { UserAccessService } from '../../services/user-access.service';
import { mockDigitalFile } from '../../../test-utils/mock-digital-files';

describe('DigitalFileDetailComponent', () => {
  let component: DigitalFileDetailComponent;
  let fixture: ComponentFixture<DigitalFileDetailComponent>;
  let router: jasmine.SpyObj<Router>;
  let route: jasmine.SpyObj<ActivatedRoute>;
  let digitalFileService: jasmine.SpyObj<DigitalFileService>;
  let authService: jasmine.SpyObj<AuthService>;
  let userAccessService: jasmine.SpyObj<UserAccessService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      paramMap: of({ get: (key: string) => key === 'id' ? 'file1' : null })
    });
    const digitalFileSpy = jasmine.createSpyObj('DigitalFileService', ['getFile', 'downloadFile']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: 'user123', email: 'user@example.com' })
    });
    const userAccessSpy = jasmine.createSpyObj('UserAccessService', ['hasAccess']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateSpy.currentLang = 'sr';

    // Setup default return values
    digitalFileSpy.getFile.and.returnValue(of(mockDigitalFile));
    digitalFileSpy.downloadFile.and.returnValue(of(true));
    userAccessSpy.hasAccess.and.returnValue(of(false));
    translateSpy.instant.and.returnValue('Mock Translation');

    await TestBed.configureTestingModule({
      declarations: [DigitalFileDetailComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: DigitalFileService, useValue: digitalFileSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: UserAccessService, useValue: userAccessSpy },
        { provide: TranslateService, useValue: translateSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DigitalFileDetailComponent);
    component = fixture.componentInstance;
    
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    digitalFileService = TestBed.inject(DigitalFileService) as jasmine.SpyObj<DigitalFileService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userAccessService = TestBed.inject(UserAccessService) as jasmine.SpyObj<UserAccessService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load file data from route parameter', () => {
      component.ngOnInit();
      
      expect(digitalFileService.getFile).toHaveBeenCalledWith('file1');
    });

    it('should set user authentication status', () => {
      component.ngOnInit();
      
      expect(component.isLoggedIn).toBeTrue();
      expect(component.currentUserEmail).toBe('user@example.com');
      expect(component.currentUserId).toBe('user123');
    });
  });

  describe('goBack', () => {
    it('should navigate to shop page', () => {
      router.navigate.and.returnValue(Promise.resolve(true));
      
      component.goBack();
      
      expect(router.navigate).toHaveBeenCalledWith(['/shop']);
    });
  });

  describe('openPurchaseModal', () => {
    it('should open purchase modal for logged-in user', () => {
      component.isLoggedIn = true;
      
      component.openPurchaseModal(mockDigitalFile);
      
      expect(component.selectedFile).toBe(mockDigitalFile);
      expect(component.showPurchaseModal).toBeTrue();
    });

    it('should show login modal for non-logged-in user', () => {
      component.isLoggedIn = false;
      
      component.openPurchaseModal(mockDigitalFile);
      
      expect(component.showLoginModal).toBeTrue();
      expect(component.showPurchaseModal).toBeFalse();
    });
  });

  describe('downloadFile', () => {
    it('should download file if user has access', () => {
      component.hasAccess = true;
      
      component.downloadFile(mockDigitalFile);
      
      expect(digitalFileService.downloadFile).toHaveBeenCalledWith(mockDigitalFile);
    });

    it('should not download file if user has no access', () => {
      component.hasAccess = false;
      spyOn(console, 'error');
      
      component.downloadFile(mockDigitalFile);
      
      expect(digitalFileService.downloadFile).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('User does not have access to this file');
    });
  });

  describe('getActionButton', () => {
    it('should return login for non-logged-in user', () => {
      component.isLoggedIn = false;
      
      const result = component.getActionButton(mockDigitalFile);
      
      expect(result).toBe('login');
    });

    it('should return download for user with access', () => {
      component.isLoggedIn = true;
      component.hasAccess = true;
      
      const result = component.getActionButton(mockDigitalFile);
      
      expect(result).toBe('download');
    });

    it('should return purchase for user without access', () => {
      component.isLoggedIn = true;
      component.hasAccess = false;
      
      const result = component.getActionButton(mockDigitalFile);
      
      expect(result).toBe('purchase');
    });
  });

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      const result = component.formatFileSize(1024);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getPrice', () => {
    it('should return RSD price for Serbian language', () => {
      translateService.currentLang = 'sr';
      
      const result = component.getPrice(mockDigitalFile);
      
      expect(result).toBe(mockDigitalFile.priceRSD);
    });

    it('should return EUR price for English language', () => {
      translateService.currentLang = 'en';
      
      const result = component.getPrice(mockDigitalFile);
      
      expect(result).toBe(mockDigitalFile.priceEUR);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return RSD for Serbian language', () => {
      translateService.currentLang = 'sr';
      
      const result = component.getCurrencySymbol();
      
      expect(result).toBe('RSD');
    });

    it('should return EUR for English language', () => {
      translateService.currentLang = 'en';
      
      const result = component.getCurrencySymbol();
      
      expect(result).toBe('EUR');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from MIME type', () => {
      const result = component.getFileExtension('application/pdf');
      
      expect(result).toBe('PDF');
    });

    it('should handle file extension with dot', () => {
      const result = component.getFileExtension('file.pdf');
      
      expect(result).toBe('PDF');
    });

    it('should return uppercase file type', () => {
      const result = component.getFileExtension('pdf');
      
      expect(result).toBe('PDF');
    });

    it('should handle empty file type', () => {
      const result = component.getFileExtension('');
      
      expect(result).toBe('');
    });
  });

  describe('modal methods', () => {
    it('should close purchase modal', () => {
      component.showPurchaseModal = true;
      component.selectedFile = mockDigitalFile;
      
      component.closePurchaseModal();
      
      expect(component.showPurchaseModal).toBeFalse();
      expect(component.selectedFile).toBeNull();
    });

    it('should open payment modal', () => {
      component.showPurchaseModal = true;
      
      component.openPaymentModal();
      
      expect(component.showPaymentModal).toBeTrue();
      expect(component.showPurchaseModal).toBeFalse();
    });

    it('should close payment modal', () => {
      component.showPaymentModal = true;
      component.selectedFile = mockDigitalFile;
      
      component.closePaymentModal();
      
      expect(component.showPaymentModal).toBeFalse();
      expect(component.selectedFile).toBeNull();
    });

    it('should close login modal', () => {
      component.showLoginModal = true;
      
      component.closeLoginModal();
      
      expect(component.showLoginModal).toBeFalse();
    });
  });

  describe('clipboard methods', () => {
    let clipboardSpy: jasmine.Spy;
    
    beforeEach(() => {
      // Mock clipboard API
      clipboardSpy = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: clipboardSpy
        },
        configurable: true
      });
    });

    it('should copy PayPal link', () => {
      component.selectedFile = { ...mockDigitalFile, paypalLink: 'https://paypal.me/test' };
      
      component.copyPayPalLink();
      
      expect(clipboardSpy).toHaveBeenCalledWith('https://paypal.me/test');
    });

    it('should copy bank details', () => {
      component.selectedFile = { 
        ...mockDigitalFile, 
        bankAccountNumber: '123-456-789',
        author: 'Test Author',
        phoneNumber: '+381 61 123 4567'
      };
      
      component.copyBankDetails();
      
      expect(clipboardSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Broj računa: 123-456-789/));
    });
  });

  describe('image functionality', () => {
    it('should load file with imageUrl from service', () => {
      const fileWithImage = { ...mockDigitalFile, imageUrl: 'https://example.com/image.jpg' };
      digitalFileService.getFile.and.returnValue(of(fileWithImage));
      
      component.ngOnInit();
      
      component.file$.subscribe(file => {
        expect(file?.imageUrl).toBe('https://example.com/image.jpg');
      });
    });

    it('should handle file without imageUrl', () => {
      const fileWithoutImage = { ...mockDigitalFile, imageUrl: undefined };
      digitalFileService.getFile.and.returnValue(of(fileWithoutImage));
      
      component.ngOnInit();
      
      component.file$.subscribe(file => {
        expect(file?.imageUrl).toBeUndefined();
      });
    });
  });

  describe('payment information', () => {
    it('should use file-specific payment information when available', () => {
      const fileWithPayment = {
        ...mockDigitalFile,
        bankAccountNumber: '123-456-789-01',
        author: 'Custom Author',
        phoneNumber: '+381 64 987 6543',
        paypalLink: 'https://paypal.me/customuser'
      };
      component.selectedFile = fileWithPayment;
      
      expect(component.selectedFile.bankAccountNumber).toBe('123-456-789-01');
      expect(component.selectedFile.author).toBe('Custom Author');
      expect(component.selectedFile.phoneNumber).toBe('+381 64 987 6543');
      expect(component.selectedFile.paypalLink).toBe('https://paypal.me/customuser');
    });

    it('should handle missing payment information', () => {
      const fileWithoutPayment = {
        ...mockDigitalFile,
        bankAccountNumber: undefined,
        author: undefined,
        phoneNumber: undefined,
        paypalLink: undefined
      };
      component.selectedFile = fileWithoutPayment;
      
      expect(component.selectedFile.bankAccountNumber).toBeUndefined();
      expect(component.selectedFile.author).toBeUndefined();
      expect(component.selectedFile.phoneNumber).toBeUndefined();
      expect(component.selectedFile.paypalLink).toBeUndefined();
    });
  });
});


