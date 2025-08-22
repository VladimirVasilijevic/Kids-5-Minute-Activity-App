import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, from, of, throwError, combineLatest } from 'rxjs';
import { map, switchMap, catchError, tap, filter, take } from 'rxjs/operators';
import { DigitalFile, DigitalFileFormData } from '../models/digital-file.model';
import { generateId } from '../models/marketplace.utils';

/**
 * Service for managing digital files in the marketplace
 * Handles CRUD operations, file uploads, and Firebase integration
 */
@Injectable({
  providedIn: 'root'
})
export class DigitalFileService {
  private readonly COLLECTION_NAME = 'digital-files';
  private readonly STORAGE_PATH = 'digital-files';

  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  /**
   * Gets all digital files
   * @returns Observable of all digital files
   */
  getFiles(): Observable<DigitalFile[]> {
    return this.firestore
      .collection<DigitalFile>(this.COLLECTION_NAME)
      .valueChanges({ idField: 'id' })
      .pipe(
        map(files => files.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
        catchError(error => {
          console.error('Error fetching files:', error);
          return of([]);
        })
      );
  }

  /**
   * Gets a specific digital file by ID
   * @param id - The file ID
   * @returns Observable of the digital file or null
   */
  getFile(id: string): Observable<DigitalFile | null> {
    return this.firestore
      .doc<DigitalFile>(`${this.COLLECTION_NAME}/${id}`)
      .valueChanges()
      .pipe(
        map(file => file ? { ...file, id } : null),
        catchError(error => {
          console.error('Error fetching file:', error);
          return of(null);
        })
      );
  }

  /**
   * Creates a new digital file
   * @param fileData - The file form data
   * @param file - The actual file to upload
   * @returns Observable of the created digital file
   */
  createFile(fileData: DigitalFileFormData, file: File): Observable<DigitalFile> {
    const fileId = generateId();
    const fileName = `${fileId}_${file.name}`;
    const filePath = `${this.STORAGE_PATH}/${fileName}`;

    // Upload file to Firebase Storage
    const uploadTask = this.storage.upload(filePath, file);
    
    return uploadTask.snapshotChanges().pipe(
      // Wait for upload to complete successfully
      filter(snapshot => snapshot?.state === 'success'),
      take(1),
      switchMap(() => this.storage.ref(filePath).getDownloadURL()),
      switchMap(downloadURL => {
        const newFile: DigitalFile = {
          id: fileId,
          title: fileData.title,
          description: fileData.description,
          priceRSD: fileData.priceRSD,
          priceEUR: fileData.priceEUR,
          accessLevel: fileData.accessLevel,
          language: fileData.language,
          tags: fileData.tags || [],
          fileUrl: downloadURL,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin' // TODO: Get from auth service
        };

        // Save to Firestore
        return from(
          this.firestore.doc(`${this.COLLECTION_NAME}/${fileId}`).set(newFile)
        ).pipe(
          map(() => newFile),
          catchError(error => {
            console.error('Error saving file to Firestore:', error);
            // Clean up uploaded file if Firestore save fails
            this.storage.ref(filePath).delete();
            return throwError(() => new Error('Failed to save file metadata'));
          })
        );
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => new Error('Failed to upload file'));
      })
    );
  }

  /**
   * Updates an existing digital file
   * @param id - The file ID
   * @param updates - The updates to apply
   * @returns Observable of the updated digital file
   */
  updateFile(id: string, updates: Partial<DigitalFile>): Observable<DigitalFile> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return from(
      this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).update(updateData)
    ).pipe(
      switchMap(() => this.getFile(id)),
      map(file => {
        if (!file) {
          throw new Error('File not found after update');
        }
        return file;
      }),
      catchError(error => {
        console.error('Error updating file:', error);
        return throwError(() => new Error('Failed to update file'));
      })
    );
  }

  /**
   * Deletes a digital file
   * @param id - The file ID
   * @returns Observable that completes when deletion is done
   */
  deleteFile(id: string): Observable<void> {
    return this.getFile(id).pipe(
      switchMap(file => {
        if (!file) {
          // Try to delete from Firestore even if file object not found
          return from(this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).delete()).pipe(
            map(() => void 0),
            catchError(error => {
              console.error('Error deleting from Firestore:', error);
              return throwError(() => new Error('Failed to delete file from database'));
            })
          );
        }

        // Delete from Firebase Storage if file exists
        const deleteStorage = file.fileUrl ? 
          this.storage.refFromURL(file.fileUrl).delete() : 
          Promise.resolve();

        // Delete from Firestore
        const deleteFirestore = this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).delete();

        return combineLatest([deleteStorage, deleteFirestore]).pipe(
          map(() => void 0),
          catchError(error => {
            console.error('Error deleting file:', error);
            return throwError(() => new Error('Failed to delete file'));
          })
        );
      })
    );
  }

  /**
   * Toggles file active status
   * @param id - The file ID
   * @param isActive - New active status
   * @returns Observable of the updated digital file
   */
  toggleFileStatus(id: string, isActive: boolean): Observable<DigitalFile> {
    return this.updateFile(id, { isActive });
  }

  /**
   * Searches files by title or description
   * @param query - Search query
   * @returns Observable of matching files
   */
  searchFiles(query: string): Observable<DigitalFile[]> {
    if (!query.trim()) {
      return this.getFiles();
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.getFiles().pipe(
      map(files => files.filter(file => 
        file.title.toLowerCase().includes(searchTerm) ||
        file.description.toLowerCase().includes(searchTerm) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      ))
    );
  }

  /**
   * Gets files by language
   * @param language - Language filter
   * @returns Observable of filtered files
   */
  getFilesByLanguage(language: string): Observable<DigitalFile[]> {
    if (!language || language === 'all') {
      return this.getFiles();
    }

    return this.getFiles().pipe(
      map(files => files.filter(file => file.language === language))
    );
  }

  /**
   * Gets files by access level
   * @param accessLevel - Access level filter
   * @returns Observable of filtered files
   */
  getFilesByAccessLevel(accessLevel: string): Observable<DigitalFile[]> {
    if (!accessLevel || accessLevel === 'all') {
      return this.getFiles();
    }

    return this.getFiles().pipe(
      map(files => files.filter(file => file.accessLevel === accessLevel))
    );
  }

  /**
   * Gets active files only
   * @returns Observable of active files
   */
  getActiveFiles(): Observable<DigitalFile[]> {
    return this.getFiles().pipe(
      map(files => files.filter(file => file.isActive))
    );
  }


}
