import { TestBed } from '@angular/core/testing';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { mockActivities } from '../../test-utils/mock-activities';
import { mockCategories } from '../../test-utils/mock-categories';
import { mockBlogPosts } from '../../test-utils/mock-blog-posts';


import { LanguageService } from './language.service';
import { FirestoreService } from './firestore.service';
import { Category } from '../models/category.model';
import { BlogPost } from '../models/blog-post.model';
import { Tip } from '../models/tip.model';

describe('FirestoreService', () => {
  let service: FirestoreService;
  let afsSpy: jasmine.SpyObj<AngularFirestore>;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let langSpy: jasmine.SpyObj<LanguageService>;

  beforeEach(() => {
    afsSpy = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc']);
    httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    langSpy = jasmine.createSpyObj('LanguageService', ['getLanguage']);
    TestBed.configureTestingModule({
      providers: [
        FirestoreService,
        { provide: AngularFirestore, useValue: afsSpy },
        { provide: HttpClient, useValue: httpSpy },
        { provide: LanguageService, useValue: langSpy },
      ],
    });
    service = TestBed.inject(FirestoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get categories from Firestore', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([mockCategories[0]]));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<Category>);
    service.getCategories().subscribe((categories) => {
      expect(categories).toEqual([mockCategories[0] as Category]);
      done();
    });
  });

  it('should fallback to JSON for categories if Firestore fails', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error('fail')));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<Category>);
    httpSpy.get.and.returnValue(of([mockCategories[1]]));
    service.getCategories().subscribe((categories) => {
      expect(categories).toEqual([mockCategories[1] as Category]);
      done();
    });
  });

  it('should get blog posts from Firestore', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([mockBlogPosts[0]]));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<BlogPost>);
    service.getBlogPosts().subscribe((posts) => {
      expect(posts).toEqual([mockBlogPosts[0] as BlogPost]);
      done();
    });
  });

  it('should fallback to JSON for blog posts if Firestore fails', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error('fail')));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<BlogPost>);
    httpSpy.get.and.returnValue(of([mockBlogPosts[1]]));
    service.getBlogPosts().subscribe((posts) => {
      expect(posts).toEqual([mockBlogPosts[1] as BlogPost]);
      done();
    });
  });





  it('should get activities from Firestore', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([mockActivities[0]]));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<any>);
    service.getActivities().subscribe((acts) => {
      expect(acts).toEqual([mockActivities[0]]);
      done();
    });
  });

  it('should fallback to JSON for activities if Firestore fails', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error('fail')));
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreCollection<any>);
    httpSpy.get.and.returnValue(of([mockActivities[1]]));
    service.getActivities().subscribe((acts) => {
      expect(acts).toEqual([mockActivities[1]]);
      done();
    });
  });

  it('should get activity by id from Firestore', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of(mockActivities[0]));
    afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);
    service.getActivityById('001').subscribe((act) => {
      expect(act).toEqual(mockActivities[0]);
      done();
    });
  });

  it('should fallback to JSON for activity by id if Firestore fails', (done) => {
    langSpy.getLanguage.and.returnValue(of('en'));
    const valueChangesSpy = jasmine
      .createSpy()
      .and.returnValue(throwError(() => new Error('fail')));
    afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);
    httpSpy.get.and.returnValue(of([mockActivities[1]]));
    service.getActivityById('002').subscribe((act) => {
      expect(act).toEqual(mockActivities[1]);
      done();
    });
  });

  describe('getVersion', () => {
    it('should get version from Firestore successfully', (done) => {
      const mockVersionData = {
        version: '2.1.0',
        lastUpdated: new Date('2024-01-15T10:30:00Z')
      };
      const valueChangesSpy = jasmine.createSpy().and.returnValue(of(mockVersionData));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData).toEqual(mockVersionData);
        expect(afsSpy.doc).toHaveBeenCalledWith('metadata/version' as any);
        done();
      });
    });

    it('should return default version when Firestore returns null', (done) => {
      const valueChangesSpy = jasmine.createSpy().and.returnValue(of(null));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.0.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        expect(afsSpy.doc).toHaveBeenCalledWith('metadata/version' as any);
        done();
      });
    });

    it('should return default version when Firestore returns undefined', (done) => {
      const valueChangesSpy = jasmine.createSpy().and.returnValue(of(undefined));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.0.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        expect(afsSpy.doc).toHaveBeenCalledWith('metadata/version' as any);
        done();
      });
    });

    it('should fallback to default version when Firestore fails', (done) => {
      const valueChangesSpy = jasmine
        .createSpy()
        .and.returnValue(throwError(() => new Error('Firestore connection failed')));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.0.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        expect(afsSpy.doc).toHaveBeenCalledWith('metadata/version' as any);
        done();
      });
    });

    it('should handle network errors and return default version', (done) => {
      const valueChangesSpy = jasmine
        .createSpy()
        .and.returnValue(throwError(() => new Error('Network error')));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.0.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        done();
      });
    });

    it('should handle permission errors and return default version', (done) => {
      const valueChangesSpy = jasmine
        .createSpy()
        .and.returnValue(throwError(() => new Error('Permission denied')));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.0.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        done();
      });
    });

    it('should return version with partial data when some fields are missing', (done) => {
      const mockPartialData = {
        version: '1.5.0'
        // lastUpdated is missing
      };
      const valueChangesSpy = jasmine.createSpy().and.returnValue(of(mockPartialData));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      service.getVersion().subscribe((versionData) => {
        expect(versionData.version).toBe('1.5.0');
        expect(versionData.lastUpdated).toBeInstanceOf(Date);
        done();
      });
    });

    it('should handle multiple consecutive calls correctly', (done) => {
      const mockVersionData = {
        version: '3.0.0',
        lastUpdated: new Date('2024-02-01T12:00:00Z')
      };
      const valueChangesSpy = jasmine.createSpy().and.returnValue(of(mockVersionData));
      afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as unknown as AngularFirestoreDocument<any>);

      let callCount = 0;
      service.getVersion().subscribe((versionData) => {
        callCount++;
        expect(versionData).toEqual(mockVersionData);
        
        if (callCount === 1) {
          // Make a second call
          service.getVersion().subscribe((versionData2) => {
            expect(versionData2).toEqual(mockVersionData);
            expect(callCount).toBe(1); // First subscription
            done();
          });
        }
      });
    });
  });
});
