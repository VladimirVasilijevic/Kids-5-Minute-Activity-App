import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable, of, map, catchError, switchMap, filter, take, firstValueFrom } from 'rxjs';
import { DigitalFile, DigitalFileFormData } from '../models/digital-file.model';
import { validateFileForUpload, generateId, getFileTypeFromName } from '../models/marketplace.utils';

@Injectable({
  providedIn: 'root'
})
export class DigitalFileService {
  private readonly COLLECTION = 'digital-files';
  private readonly STORAGE_PATH = 'digital-files';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private functions: AngularFireFunctions
  ) {}

  /**
   * Get all digital files with enhanced security
   */
  getFiles(): Observable<DigitalFile[]> {
    return this.firestore
      .collection(this.COLLECTION, ref => ref.orderBy('createdAt', 'desc'))
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile[]>;
  }

  /**
   * Get a specific digital file by ID
   */
  getFile(id: string): Observable<DigitalFile | null> {
    if (!id) {
      return of(null);
    }

    return this.firestore
      .collection(this.COLLECTION)
      .doc(id)
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile | null>;
  }

  /**
   * Create a new digital file with enhanced security
   */
  async createFile(fileData: DigitalFileFormData, file: File): Promise<string> {
    // Enhanced validation
    if (!fileData.title || !fileData.description || !file) {
      throw new Error('Missing required file information');
    }

    if (!validateFileForUpload(file)) {
      throw new Error('Invalid file type or size');
    }

    try {
      // Generate unique file name
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const uniqueFileName = `${generateId()}_${fileData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}_${Date.now()}_${fileExtension}`;
      
      // Upload file to Firebase Storage
      const filePath = `${this.STORAGE_PATH}/${uniqueFileName}`;
      const uploadTask = this.storage.upload(filePath, file);
      
      // Wait for upload to complete and get download URL
      const snapshot = await firstValueFrom(uploadTask.snapshotChanges().pipe(
        filter(snapshot => snapshot?.state === 'success'),
        take(1)
      ));
      
      if (!snapshot) {
        throw new Error('File upload failed');
      }

      const downloadURL = await firstValueFrom(uploadTask.snapshotChanges().pipe(
        filter(snapshot => snapshot?.state === 'success'),
        take(1),
        switchMap(() => this.storage.ref(filePath).getDownloadURL())
      ));

      // Create file document in Firestore
      const digitalFile: Omit<DigitalFile, 'id'> = {
        ...fileData,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: downloadURL,
        isActive: true,
        createdBy: 'admin', // TODO: Get from auth service
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await this.firestore.collection(this.COLLECTION).add(digitalFile);
      return docRef.id;

    } catch (error) {
      console.error('Error creating digital file:', error);
      throw new Error('Failed to create digital file');
    }
  }

  /**
   * Update an existing digital file
   */
  async updateFile(id: string, fileData: Partial<DigitalFileFormData>): Promise<void> {
    if (!id) {
      throw new Error('Missing file ID');
    }

    try {
      const updateData = {
        ...fileData,
        updatedAt: new Date().toISOString()
      };

      await this.firestore
        .collection(this.COLLECTION)
        .doc(id)
        .update(updateData);
    } catch (error) {
      console.error('Error updating digital file:', error);
      throw new Error('Failed to update digital file');
    }
  }

  /**
   * Delete a digital file with enhanced security
   */
  async deleteFile(id: string): Promise<void> {
    if (!id) {
      throw new Error('Missing file ID');
    }

    try {
      // Get file details first
      const file = await firstValueFrom(this.getFile(id));
      
      // Delete from Firestore
      await this.firestore.collection(this.COLLECTION).doc(id).delete();
      
      // Delete from Storage if file exists
      if (file?.fileUrl) {
        try {
          const fileRef = this.storage.refFromURL(file.fileUrl);
          await firstValueFrom(fileRef.delete());
        } catch (storageError) {
          console.warn('Could not delete file from storage:', storageError);
          // Continue even if storage deletion fails
        }
      }
    } catch (error) {
      console.error('Error deleting digital file:', error);
      throw new Error('Failed to delete digital file');
    }
  }

  /**
   * Toggle file active status
   */
  async toggleFileStatus(id: string): Promise<void> {
    if (!id) {
      throw new Error('Missing file ID');
    }

    try {
      const file = await firstValueFrom(this.getFile(id));
      if (!file) {
        throw new Error('File not found');
      }

      await this.firestore
        .collection(this.COLLECTION)
        .doc(id)
        .update({
          isActive: !file.isActive,
          updatedAt: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error toggling file status:', error);
      throw new Error('Failed to toggle file status');
    }
  }

  /**
   * Search files with enhanced security
   */
  searchFiles(query: string): Observable<DigitalFile[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('isActive', '==', true)
           .orderBy('title')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
                 map(files => (files as DigitalFile[]).filter(file => 
           file.title.toLowerCase().includes(searchTerm) ||
           file.description.toLowerCase().includes(searchTerm) ||
           (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
         )),
        catchError(error => {
          console.error('Error searching files:', error);
          return of([]);
        })
      );
  }

  /**
   * Get files by language
   */
  getFilesByLanguage(language: string): Observable<DigitalFile[]> {
    if (!language) {
      return of([]);
    }

    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('language', '==', language)
           .where('isActive', '==', true)
           .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile[]>;
  }

  /**
   * Get files by access level
   */
  getFilesByAccessLevel(accessLevel: string): Observable<DigitalFile[]> {
    if (!accessLevel) {
      return of([]);
    }

    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('accessLevel', '==', accessLevel)
           .where('isActive', '==', true)
           .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile[]>;
  }

  /**
   * Get only active files
   */
  getActiveFiles(): Observable<DigitalFile[]> {
    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('isActive', '==', true)
           .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile[]>;
  }

  /**
   * Download file with enhanced security
   * This method now uses server-side validation
   */
  downloadFile(file: DigitalFile): Observable<Blob> {
    if (!file?.fileUrl) {
      throw new Error('File URL not available');
    }

    // Use Firebase Function for server-side access validation
    const getSecureDownload = this.functions.httpsCallable('getSecureFileDownload');
    
    return new Observable(observer => {
      getSecureDownload({ fileId: file.id }).subscribe({
        next: (result: any) => {
          if (result.data.hasAccess) {
            // Create a secure download link
            this.createSecureDownloadLink(result.data.downloadUrl)
              .then(blob => {
                observer.next(blob);
                observer.complete();
              })
              .catch(error => {
                console.error('Error creating secure download:', error);
                observer.error(error);
              });
          } else {
            observer.error(new Error('Access denied'));
          }
        },
        error: (error: any) => {
          console.error('Error getting secure download:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Download file by ID with enhanced security
   */
  downloadFileById(fileId: string): Observable<Blob> {
    if (!fileId) {
      throw new Error('Missing file ID');
    }

    return this.getFile(fileId).pipe(
      switchMap(file => {
        if (!file) {
          throw new Error('File not found');
        }
        return this.downloadFile(file);
      })
    );
  }

  /**
   * Get secure download URL with enhanced security
   */
  getFileDownloadUrl(file: DigitalFile): Observable<string> {
    if (!file?.id) {
      throw new Error('File ID not available');
    }

    // Use Firebase Function for server-side access validation
    const getSecureDownload = this.functions.httpsCallable('getSecureFileDownload');
    
    return new Observable(observer => {
      getSecureDownload({ fileId: file.id }).subscribe({
        next: (result: any) => {
          if (result.data.hasAccess) {
            observer.next(result.data.downloadUrl);
            observer.complete();
          } else {
            observer.error(new Error('Access denied'));
          }
        },
        error: (error: any) => {
          console.error('Error getting secure download URL:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Create a secure download link
   * This method handles the actual file download securely
   */
  private async createSecureDownloadLink(downloadUrl: string): Promise<Blob> {
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error creating secure download link:', error);
      throw new Error('Failed to create secure download link');
    }
  }
}
