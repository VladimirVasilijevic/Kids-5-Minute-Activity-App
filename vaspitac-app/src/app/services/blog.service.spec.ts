import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

import { BlogService } from './blog.service';
import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { mockBlogPosts } from '../../test-utils/mock-blog-posts';

describe('BlogService', () => {
  let service: BlogService;
  let firestoreService: jasmine.SpyObj<FirestoreService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let authService: jasmine.SpyObj<AuthService>;
  let functions: jasmine.SpyObj<AngularFireFunctions>;

  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('FirestoreService', ['getBlogPosts', 'createBlogPost', 'updateBlogPost', 'deleteBlogPost']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const authSpy = jasmine.createSpyObj('AuthService', [], { user$: of(null) });
    const functionsSpy = jasmine.createSpyObj('AngularFireFunctions', ['httpsCallable']);

    TestBed.configureTestingModule({
      providers: [
        BlogService, 
        { provide: FirestoreService, useValue: firestoreSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: TranslateService, useValue: translateSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: AngularFireFunctions, useValue: functionsSpy },
      ],
    });

    service = TestBed.inject(BlogService);
    firestoreService = TestBed.inject(FirestoreService) as jasmine.SpyObj<FirestoreService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    functions = TestBed.inject(AngularFireFunctions) as jasmine.SpyObj<AngularFireFunctions>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBlogPosts', () => {
    it('should call getPublicBlogPosts when user is not authenticated', () => {
      const publicFunctionSpy = jasmine.createSpy('publicFunction').and.returnValue(Promise.resolve({ content: mockBlogPosts }));
      functions.httpsCallable.and.returnValue(publicFunctionSpy);
      service.getBlogPosts().subscribe();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getPublicContent');
      expect(publicFunctionSpy).toHaveBeenCalled();
    });

    it('should call getFilteredBlogPosts when user is authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));
      const filteredFunctionSpy = jasmine.createSpy('filteredFunction').and.returnValue(Promise.resolve({ blogPosts: mockBlogPosts }));
      functions.httpsCallable.and.returnValue(filteredFunctionSpy);
      service.getBlogPosts().subscribe();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getFilteredBlogPosts');
      expect(filteredFunctionSpy).toHaveBeenCalled();
    });

    it('should fall back to public content if filtered blog posts call fails', () => {
      (Object.getOwnPropertyDescriptor(authService, 'user$')?.get as jasmine.Spy).and.returnValue(of({ uid: 'test-uid' }));

      const filteredFunctionSpy = jasmine.createSpy('filteredFunction').and.returnValue(throwError(() => new Error('fail')));
      const publicFunctionSpy = jasmine.createSpy('publicFunction').and.returnValue(of(mockBlogPosts));

      functions.httpsCallable.and.callFake(name => {
        if (name === 'getFilteredBlogPosts') {
          return () => filteredFunctionSpy();
        }
        if (name === 'getPublicContent') {
          return () => publicFunctionSpy();
        }
        return () => of({});
      });

      service.getBlogPosts().subscribe();

      expect(functions.httpsCallable).toHaveBeenCalledWith('getFilteredBlogPosts');
      expect(filteredFunctionSpy).toHaveBeenCalled();
      expect(functions.httpsCallable).toHaveBeenCalledWith('getPublicContent');
      expect(publicFunctionSpy).toHaveBeenCalled();
      });
    });

  it('should get blog post by ID', () => {
    firestoreService.getBlogPosts.and.returnValue(of(mockBlogPosts));
      service.getBlogPostById(1).subscribe(post => {
        expect(post).toEqual(mockBlogPosts[0]);
    });
    expect(firestoreService.getBlogPosts).toHaveBeenCalled();
  });

  it('should create a blog post', async () => {
    firestoreService.createBlogPost.and.resolveTo();
    await service.createBlogPost(mockBlogPosts[0]);
    expect(firestoreService.createBlogPost).toHaveBeenCalledWith(mockBlogPosts[0]);
  });

  it('should update a blog post', async () => {
    firestoreService.updateBlogPost.and.resolveTo();
    await service.updateBlogPost(mockBlogPosts[0]);
    expect(firestoreService.updateBlogPost).toHaveBeenCalledWith(mockBlogPosts[0]);
  });

  it('should delete a blog post', async () => {
    firestoreService.deleteBlogPost.and.resolveTo();
    await service.deleteBlogPost(1);
    expect(firestoreService.deleteBlogPost).toHaveBeenCalledWith(1);
  });
});
