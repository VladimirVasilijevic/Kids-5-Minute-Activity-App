import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AboutService } from './about.service';
import { FirestoreService } from './firestore.service';
import { LoadingService } from './loading.service';
import { AboutContent } from '../models/about-content.model';
import { mockAboutContent } from '../../test-utils/mock-about-content';

describe('AboutService', () => {
  let service: AboutService;
  let firestoreService: jasmine.SpyObj<FirestoreService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const firestoreSpy = jasmine.createSpyObj('FirestoreService', ['getAboutContent', 'updateAboutContent']);
    const loadingSpy = jasmine.createSpyObj('LoadingService', ['showWithMessage', 'hide']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      providers: [
        AboutService,
        { provide: FirestoreService, useValue: firestoreSpy },
        { provide: LoadingService, useValue: loadingSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(AboutService);
    firestoreService = TestBed.inject(FirestoreService) as jasmine.SpyObj<FirestoreService>;
    loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    // Setup default translations
    translateService.instant.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'ABOUT.LOADING': 'Loading about content...',
        'COMMON.SAVING': 'Saving...',
      };
      return translations[key] || key;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAboutContent', () => {
    it('should retrieve about content with loading indicator', (done) => {
      // Arrange
      firestoreService.getAboutContent.and.returnValue(of(mockAboutContent));

      // Act
      service.getAboutContent().subscribe({
        next: (content) => {
          // Assert
          expect(content).toEqual(mockAboutContent);
          expect(loadingService.showWithMessage).toHaveBeenCalledWith('Loading about content...');
          expect(loadingService.hide).toHaveBeenCalled();
          expect(firestoreService.getAboutContent).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });
    });

    it('should handle error when retrieving about content', (done) => {
      // Arrange
      const error = new Error('Failed to load about content');
      firestoreService.getAboutContent.and.returnValue(throwError(() => error));

      // Act
      service.getAboutContent().subscribe({
        next: () => done.fail('Should not emit value'),
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(loadingService.showWithMessage).toHaveBeenCalledWith('Loading about content...');
          expect(loadingService.hide).not.toHaveBeenCalled(); // hide() is not called on error in current implementation
          expect(firestoreService.getAboutContent).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should use correct translation key for loading message', (done) => {
      // Arrange
      firestoreService.getAboutContent.and.returnValue(of(mockAboutContent));

      // Act
      service.getAboutContent().subscribe({
        next: () => {
          // Assert
          expect(translateService.instant).toHaveBeenCalledWith('ABOUT.LOADING');
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('updateAboutContent', () => {
    it('should update about content with loading indicator', async () => {
      // Arrange
      const updatedContent: AboutContent = {
        ...mockAboutContent,
        name: 'Updated Name',
        role: 'Updated Role',
      };
      firestoreService.updateAboutContent.and.resolveTo();

      // Act
      await service.updateAboutContent(updatedContent);

      // Assert
      expect(loadingService.showWithMessage).toHaveBeenCalledWith('Saving...');
      expect(loadingService.hide).toHaveBeenCalled();
      expect(firestoreService.updateAboutContent).toHaveBeenCalledWith(updatedContent);
    });

    it('should handle error when updating about content', async () => {
      // Arrange
      const updatedContent: AboutContent = {
        ...mockAboutContent,
        name: 'Updated Name',
      };
      const error = new Error('Failed to update about content');
      firestoreService.updateAboutContent.and.rejectWith(error);

      // Act & Assert
      try {
        await service.updateAboutContent(updatedContent);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBe(error);
        expect(loadingService.showWithMessage).toHaveBeenCalledWith('Saving...');
        expect(loadingService.hide).toHaveBeenCalled();
        expect(firestoreService.updateAboutContent).toHaveBeenCalledWith(updatedContent);
      }
    });

    it('should hide loading indicator even when update fails', async () => {
      // Arrange
      const updatedContent: AboutContent = {
        ...mockAboutContent,
        name: 'Updated Name',
      };
      const error = new Error('Failed to update about content');
      firestoreService.updateAboutContent.and.rejectWith(error);

      // Act & Assert
      try {
        await service.updateAboutContent(updatedContent);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBe(error);
        expect(loadingService.hide).toHaveBeenCalled();
      }
    });

    it('should use correct translation key for saving message', async () => {
      // Arrange
      const updatedContent: AboutContent = {
        ...mockAboutContent,
        name: 'Updated Name',
      };
      firestoreService.updateAboutContent.and.resolveTo();

      // Act
      await service.updateAboutContent(updatedContent);

      // Assert
      expect(translateService.instant).toHaveBeenCalledWith('COMMON.SAVING');
    });

    it('should pass the correct content to firestore service', async () => {
      // Arrange
      const updatedContent: AboutContent = {
        ...mockAboutContent,
        name: 'Updated Name',
        role: 'Updated Role',
        bioParagraphs: ['Updated bio paragraph'],
        experiences: [
          { title: 'Updated Experience', description: 'Updated description', dateRange: '2021-2024' },
        ],
        email: 'updated@example.com',
        phone: '+9876543210',
        location: 'Updated Location',
        profileImageUrl: 'http://example.com/updated-profile.jpg',
        lastUpdated: new Date().toISOString(),
      };
      firestoreService.updateAboutContent.and.resolveTo();

      // Act
      await service.updateAboutContent(updatedContent);

      // Assert
      expect(firestoreService.updateAboutContent).toHaveBeenCalledWith(updatedContent);
    });
  });

  describe('Service Integration', () => {
    it('should properly integrate with all dependencies', () => {
      // Arrange
      firestoreService.getAboutContent.and.returnValue(of(mockAboutContent));

      // Act
      service.getAboutContent().subscribe();

      // Assert
      expect(firestoreService.getAboutContent).toHaveBeenCalled();
      expect(loadingService.showWithMessage).toHaveBeenCalled();
      expect(translateService.instant).toHaveBeenCalled();
    });

    it('should handle multiple concurrent getAboutContent calls', (done) => {
      // Arrange
      firestoreService.getAboutContent.and.returnValue(of(mockAboutContent));

      // Act
      const subscription1 = service.getAboutContent().subscribe();
      const subscription2 = service.getAboutContent().subscribe();

      // Assert
      setTimeout(() => {
        expect(firestoreService.getAboutContent).toHaveBeenCalledTimes(2);
        expect(loadingService.showWithMessage).toHaveBeenCalledTimes(2);
        expect(loadingService.hide).toHaveBeenCalledTimes(2);
        subscription1.unsubscribe();
        subscription2.unsubscribe();
        done();
      }, 100);
    });

    it('should handle multiple concurrent updateAboutContent calls', async () => {
      // Arrange
      const content1: AboutContent = { ...mockAboutContent, name: 'Content 1' };
      const content2: AboutContent = { ...mockAboutContent, name: 'Content 2' };
      firestoreService.updateAboutContent.and.resolveTo();

      // Act
      const promise1 = service.updateAboutContent(content1);
      const promise2 = service.updateAboutContent(content2);

      await Promise.all([promise1, promise2]);

      // Assert
      expect(firestoreService.updateAboutContent).toHaveBeenCalledTimes(2);
      expect(firestoreService.updateAboutContent).toHaveBeenCalledWith(content1);
      expect(firestoreService.updateAboutContent).toHaveBeenCalledWith(content2);
      expect(loadingService.showWithMessage).toHaveBeenCalledTimes(2);
      expect(loadingService.hide).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle firestore service throwing error in getAboutContent', (done) => {
      // Arrange
      const error = new Error('Firestore connection failed');
      firestoreService.getAboutContent.and.returnValue(throwError(() => error));

      // Act
      service.getAboutContent().subscribe({
        next: () => done.fail('Should not emit value'),
        error: (err) => {
          // Assert
          expect(err).toBe(error);
          expect(loadingService.hide).not.toHaveBeenCalled(); // hide() is not called on error in current implementation
          done();
        },
      });
    });

    it('should handle firestore service rejecting in updateAboutContent', async () => {
      // Arrange
      const error = new Error('Firestore update failed');
      firestoreService.updateAboutContent.and.rejectWith(error);

      // Act & Assert
      try {
        await service.updateAboutContent(mockAboutContent);
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toBe(error);
        expect(loadingService.hide).toHaveBeenCalled();
      }
    });

    it('should handle translation service returning undefined', (done) => {
      // Arrange
      translateService.instant.and.returnValue(undefined as any);
      firestoreService.getAboutContent.and.returnValue(of(mockAboutContent));

      // Act
      service.getAboutContent().subscribe({
        next: () => {
          // Assert
          expect(loadingService.showWithMessage).toHaveBeenCalledWith(undefined as any);
          done();
        },
        error: done.fail,
      });
    });
  });
}); 