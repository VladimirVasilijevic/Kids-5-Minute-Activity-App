import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ShopComponent } from './shop.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { DigitalFileService } from '../../services/digital-file.service';
import { UserAccessService } from '../../services/user-access.service';
import { PurchaseService } from '../../services/purchase.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { mockFreeUser } from '../../../test-utils/mock-user-profiles';
import { mockDigitalFiles, mockDigitalFile, mockEnglishDigitalFile } from '../../../test-utils/mock-digital-files';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let digitalFileService: jasmine.SpyObj<DigitalFileService>;
  let userAccessService: jasmine.SpyObj<UserAccessService>;
  let purchaseService: jasmine.SpyObj<PurchaseService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let fireFunctions: jasmine.SpyObj<AngularFireFunctions>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: 'user123', email: 'test@example.com' })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const digitalFileSpy = jasmine.createSpyObj('DigitalFileService', ['getActiveFiles', 'downloadFile']);
    const userAccessSpy = jasmine.createSpyObj('UserAccessService', ['hasMultipleAccess']);
    const purchaseSpy = jasmine.createSpyObj('PurchaseService', ['createPurchase']);
    const translateSpy = jasmine.createSpyObj('TranslateService', [], {
      currentLang: 'sr'
    });
    const fireFunctionsSpy = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);

    // Setup default return values
    userSpy.getUserProfile.and.returnValue(of(mockFreeUser));
    digitalFileSpy.getActiveFiles.and.returnValue(of(mockDigitalFiles));
    digitalFileSpy.downloadFile.and.returnValue(of(true));
    userAccessSpy.hasMultipleAccess.and.returnValue(of({ 'file1': true, 'file2': false, 'file3': true }));
    purchaseSpy.createPurchase.and.returnValue(Promise.resolve('purchase123'));

    await TestBed.configureTestingModule({
      declarations: [ShopComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: DigitalFileService, useValue: digitalFileSpy },
        { provide: UserAccessService, useValue: userAccessSpy },
        { provide: PurchaseService, useValue: purchaseSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: AngularFireFunctions, useValue: fireFunctionsSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    digitalFileService = TestBed.inject(DigitalFileService) as jasmine.SpyObj<DigitalFileService>;
    userAccessService = TestBed.inject(UserAccessService) as jasmine.SpyObj<UserAccessService>;
    purchaseService = TestBed.inject(PurchaseService) as jasmine.SpyObj<PurchaseService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    fireFunctions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openPurchaseModal', () => {
    it('should open purchase modal if user is logged in', () => {
      component.isLoggedIn = true;
      
      component.openPurchaseModal(mockDigitalFile);
      
      expect(component.selectedFile).toBe(mockDigitalFile);
      expect(component.showPurchaseModal).toBeTrue();
    });
  });

  describe('closePurchaseModal', () => {
    it('should close purchase modal and clear selected file', () => {
      component.showPurchaseModal = true;
      component.selectedFile = mockDigitalFile;
      
      component.closePurchaseModal();
      
      expect(component.showPurchaseModal).toBeFalse();
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('openPaymentModal', () => {
    it('should open payment modal and close purchase modal', () => {
      component.showPurchaseModal = true;
      component.showPaymentModal = false;
      
      component.openPaymentModal();
      
      expect(component.showPaymentModal).toBeTrue();
      expect(component.showPurchaseModal).toBeFalse();
    });
  });

  describe('closePaymentModal', () => {
    it('should close payment modal and clear selected file', () => {
      component.showPaymentModal = true;
      component.selectedFile = mockDigitalFile;
      
      component.closePaymentModal();
      
      expect(component.showPaymentModal).toBeFalse();
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('refreshUserAccess', () => {
    it('should return early if already refreshing', () => {
      component['isRefreshingAccess'] = true;
      spyOn(component as any, 'loadUserAccess');
      
      component.refreshUserAccess();
      
      expect((component as any).loadUserAccess).not.toHaveBeenCalled();
    });

    it('should return early if no user ID or files', () => {
      component['currentUserId'] = null;
      component['files'] = [];
      spyOn(component as any, 'loadUserAccess');
      
      component.refreshUserAccess();
      
      expect((component as any).loadUserAccess).not.toHaveBeenCalled();
    });

    it('should refresh user access if conditions are met', () => {
      component['currentUserId'] = 'user123';
      component['files'] = mockDigitalFiles;
      component['isRefreshingAccess'] = false;
      spyOn(component as any, 'loadUserAccess');
      
      component.refreshUserAccess();
      
      expect(component['isRefreshingAccess']).toBeTrue();
      expect((component as any).loadUserAccess).toHaveBeenCalled();
    });
  });

  describe('hasAccess', () => {
    it('should return false if user is not logged in', () => {
      component.isLoggedIn = false;
      
      const result = component.hasAccess('file1');
      
      expect(result).toBeFalse();
    });

    it('should return false if no user ID', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = null;
      
      const result = component.hasAccess('file1');
      
      expect(result).toBeFalse();
    });

    it('should return false if access map is empty', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = 'user123';
      component['userAccessMap'] = {};
      
      const result = component.hasAccess('file1');
      
      expect(result).toBeFalse();
    });

    it('should return access status from map', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = 'user123';
      component['userAccessMap'] = { 'file1': true, 'file2': false };
      
      const result1 = component.hasAccess('file1');
      const result2 = component.hasAccess('file2');
      
      expect(result1).toBeTrue();
      expect(result2).toBeFalse();
    });
  });

  describe('getActionButton', () => {
    it('should return login if user is not logged in', () => {
      component.isLoggedIn = false;
      
      const result = component.getActionButton(mockDigitalFile);
      
      expect(result).toBe('login');
    });

    it('should return purchase if user is logged in but has no access', () => {
      component.isLoggedIn = true;
      component['userAccessMap'] = { 'file1': false };
      
      const result = component.getActionButton(mockDigitalFile);
      
      expect(result).toBe('purchase');
    });
  });

  describe('downloadFile', () => {
    it('should not download if user has no access', () => {
      component['userAccessMap'] = { 'file1': false };
      spyOn(console, 'error');
      
      component.downloadFile(mockDigitalFile);
      
      expect(console.error).toHaveBeenCalledWith('User does not have access to this file');
      expect(digitalFileService.downloadFile).not.toHaveBeenCalled();
    });
  });

  describe('showLoginRequiredModal', () => {
    it('should show login modal', () => {
      component.showLoginModal = false;
      
      component.showLoginRequiredModal();
      
      expect(component.showLoginModal).toBeTrue();
    });
  });

  describe('closeLoginModal', () => {
    it('should close login modal', () => {
      component.showLoginModal = true;
      
      component.closeLoginModal();
      
      expect(component.showLoginModal).toBeFalse();
    });
  });

  describe('goToLogin', () => {
    it('should close login modal and go back', () => {
      component.showLoginModal = true;
      spyOn(component, 'goBack');
      
      component.goToLogin();
      
      expect(component.showLoginModal).toBeFalse();
      expect(component.goBack).toHaveBeenCalled();
    });
  });

  describe('clearFilters', () => {
    it('should clear search term and selected language', () => {
      component.searchTerm = 'test';
      component.selectedLanguage = 'en';
      spyOn(component, 'filterFiles');
      
      component.clearFilters();
      
      expect(component.searchTerm).toBe('');
      expect(component.selectedLanguage).toBe('');
      expect(component.filterFiles).toHaveBeenCalled();
    });
  });

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      const result = component.formatFileSize(1024);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return RSD for Serbian language', () => {
      translateService.currentLang = 'sr';
      
      const result = component.getCurrencySymbol();
      
      expect(result).toBe('RSD');
    });
  });

  describe('getPrice', () => {
    it('should return RSD price for Serbian language', () => {
      translateService.currentLang = 'sr';
      
      const result = component.getPrice(mockDigitalFile);
      
      expect(result).toBe(1000);
    });
  });

  describe('goBack', () => {
    it('should navigate to home page', () => {
      router.navigate.and.returnValue(Promise.resolve(true));
      spyOn(window, 'scrollTo');
      
      component.goBack();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('copyPayPalLink', () => {
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

    it('should copy PayPal link to clipboard', fakeAsync(() => {
      component.copyPayPalLink();
      tick();
      
      expect(clipboardSpy).toHaveBeenCalledWith('https://paypal.me/anavaspitac?country.x=RS&locale.x=en_US');
    }));

    it('should handle clipboard error gracefully', fakeAsync(() => {
      clipboardSpy.and.returnValue(Promise.reject('Clipboard error'));
      spyOn(console, 'error');
      
      component.copyPayPalLink();
      tick();
      
      expect(console.error).toHaveBeenCalledWith('Failed to copy PayPal link:', 'Clipboard error');
    }));
  });

  describe('getFileExtension', () => {
    it('should return empty string for empty file type', () => {
      const result = component.getFileExtension('');
      
      expect(result).toBe('');
    });

    it('should extract extension from MIME type', () => {
      const result = component.getFileExtension('application/pdf');
      
      expect(result).toBe('PDF');
    });

    it('should extract extension from filename with dot', () => {
      const result = component.getFileExtension('document.pdf');
      
      expect(result).toBe('PDF');
    });

    it('should return uppercase file type if no extension pattern', () => {
      const result = component.getFileExtension('PDF');
      
      expect(result).toBe('PDF');
    });
  });

  describe('getUserEmail', () => {
    it('should return current user email if available', () => {
      component.currentUserEmail = 'user@example.com';
      
      const result = component.getUserEmail();
      
      expect(result).toBe('user@example.com');
    });

    it('should return fallback email if current email is empty', () => {
      component.currentUserEmail = '';
      
      const result = component.getUserEmail();
      
      expect(result).toBe('user@example.com');
    });
  });

  describe('filterFiles', () => {
    beforeEach(() => {
      component.files = mockDigitalFiles;
    });

    it('should filter files by search term', () => {
      component.searchTerm = 'English';
      
      component.filterFiles();
      
      expect(component.displayedFiles.length).toBe(1);
      expect(component.displayedFiles[0].title).toContain('English');
    });

    it('should filter files by language', () => {
      component.selectedLanguage = 'en';
      
      component.filterFiles();
      
      expect(component.displayedFiles.length).toBe(1);
      expect(component.displayedFiles[0].language).toBe('en');
    });

    it('should filter files by both search term and language', () => {
      component.searchTerm = 'Test';
      component.selectedLanguage = 'sr';
      
      component.filterFiles();
      
      expect(component.displayedFiles.length).toBe(2);
      expect(component.displayedFiles.every(file => file.language === 'sr')).toBeTrue();
      expect(component.displayedFiles.every(file => file.title.includes('Test'))).toBeTrue();
    });

    it('should search in title, description, and tags', () => {
      component.searchTerm = 'education';
      
      component.filterFiles();
      
      expect(component.displayedFiles.length).toBe(2);
    });

    it('should show all files when no filters applied', () => {
      component.searchTerm = '';
      component.selectedLanguage = '';
      
      component.filterFiles();
      
      expect(component.displayedFiles.length).toBe(3);
    });
  });

  describe('goToFileDetail', () => {
    it('should navigate to file detail page', () => {
      component.goToFileDetail(mockDigitalFile);
      
      expect(router.navigate).toHaveBeenCalledWith(['/shop/file', mockDigitalFile.id]);
    });
  });

  describe('getters', () => {
    it('should return correct access map size', () => {
      component['userAccessMap'] = { 'file1': true, 'file2': false };
      
      const result = component.accessMapSize;
      
      expect(result).toBe(2);
    });

    it('should return true for isAccessReady when all conditions are met', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = 'user123';
      component['files'] = mockDigitalFiles;
      component['userAccessMap'] = { 'file1': true, 'file2': false };
      
      const result = component.isAccessReady;
      
      expect(result).toBeTrue();
    });

    it('should return false for isAccessReady when no files', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = 'user123';
      component['files'] = [];
      component['userAccessMap'] = { 'file1': true };
      
      const result = component.isAccessReady;
      
      expect(result).toBeFalse();
    });

    it('should return false for isAccessReady when access map is empty', () => {
      component.isLoggedIn = true;
      component['currentUserId'] = 'user123';
      component['files'] = mockDigitalFiles;
      component['userAccessMap'] = {};
      
      const result = component.isAccessReady;
      
      expect(result).toBeFalse();
    });
  });
});
