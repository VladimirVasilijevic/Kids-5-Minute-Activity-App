import { TestBed } from '@angular/core/testing';

import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language as sr', () => {
    expect(service.getCurrentLanguage()).toBe('sr');
  });

  it('should set and get language', () => {
    service.setLanguage('en');
    expect(service.getCurrentLanguage()).toBe('en');
    service.setLanguage('sr');
    expect(service.getCurrentLanguage()).toBe('sr');
  });

  it('should emit language changes via observable', (done) => {
    const values: string[] = [];
    const sub = service.getLanguage().subscribe((lang) => {
      values.push(lang);
      if (values.length === 2) {
        expect(values).toEqual(['sr', 'en']);
        sub.unsubscribe();
        done();
      }
    });
    service.setLanguage('en');
  });
});
