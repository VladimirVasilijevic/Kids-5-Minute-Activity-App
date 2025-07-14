import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

/**
 * Service for handling image uploads to Firebase Storage
 */
@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  /**
   * Initializes the image upload service
   * @param storage - Firebase storage service
   * @param auth - Firebase auth service
   */
  constructor(
    private _storage: AngularFireStorage,
    private _auth: AngularFireAuth
  ) {}

  /**
   * Uploads an image file to Firebase Storage
   * @param file - The file to upload
   * @param path - The storage path (e.g., 'blog-images/', 'activity-images/')
   * @returns Observable of the download URL
   */
  uploadImage(file: globalThis.File, path: string): Observable<string> {
    return from(this._auth.currentUser).pipe(
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User not authenticated'));
        }
        
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `${path}${fileName}`;
        const fileRef = this._storage.ref(filePath);
        
        return from(this._storage.upload(filePath, file)).pipe(
          switchMap(() => fileRef.getDownloadURL()),
          catchError(error => {
            console.error('Upload error:', error);
            if (error.code === 'storage/unauthorized') {
              // Check if this is an admin upload path
              if (path.startsWith('admin-uploads/')) {
                return throwError(() => new Error('You do not have admin permissions to upload images. Please ensure you are logged in as an admin user.'));
              } else {
                return throwError(() => new Error('You do not have permission to upload images. Please ensure you are logged in.'));
              }
            } else if (error.code === 'storage/retry-limit-exceeded') {
              return throwError(() => new Error('Upload failed due to network issues. Please check your connection and try again.'));
            } else {
              return throwError(() => new Error('Upload failed. Please try again.'));
            }
          })
        );
      })
    );
  }

  /**
   * Uploads an image from a URL (downloads and re-uploads)
   * @param imageUrl - The URL of the image to upload
   * @param path - The storage path
   * @returns Observable of the download URL
   */
  uploadImageFromUrl(imageUrl: string, path: string): Observable<string> {
    return from(globalThis.fetch(imageUrl)).pipe(
      switchMap(response => response.blob()),
      switchMap(blob => {
        const file = new globalThis.File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });
        return this.uploadImage(file, path);
      })
    );
  }

  /**
   * Deletes an image from Firebase Storage
   * @param imageUrl - The URL of the image to delete
   * @returns Observable that completes when deletion is done
   */
  deleteImage(imageUrl: string): Observable<void> {
    const fileRef = this._storage.refFromURL(imageUrl);
    return from(fileRef.delete());
  }

  /**
   * Validates if a file is an image
   * @param file - The file to validate
   * @returns True if the file is a valid image
   */
  isValidImage(file: globalThis.File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Gets the file size in a human-readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 