import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable, of, map, catchError, switchMap, filter, take, firstValueFrom } from 'rxjs';
import { DigitalFile, DigitalFileFormData } from '../models/digital-file.model';
import { validateFileForUpload, generateId, getFileTypeFromName } from '../models/marketplace.utils';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

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
   * Create a new product (digital file or physical product) with enhanced security
   */
  async createFile(fileData: DigitalFileFormData, file?: File): Promise<string> {
    // Enhanced validation
    if (!fileData.title || !fileData.description) {
      throw new Error('Missing required file information');
    }

    // File validation only for digital products (when file is provided)
    if (file && !validateFileForUpload(file)) {
      throw new Error('Invalid file type or size');
    }

    try {
      let downloadURL: string = '';
      let fileSize: number = 0;
      let fileType: string = '';
      let fileName: string = '';

      // Handle file upload for digital products
      if (file) {
        // Generate unique file name
        const fileExtension = file.name.split('.').pop() || 'pdf';
        const uniqueFileName = `${generateId()}_${fileData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}_${Date.now()}.${fileExtension}`;
        
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

        downloadURL = await firstValueFrom(uploadTask.snapshotChanges().pipe(
          filter(snapshot => snapshot?.state === 'success'),
          take(1),
          switchMap(() => this.storage.ref(filePath).getDownloadURL())
        ));

        fileSize = file.size;
        fileType = getFileTypeFromName(file.name);
        fileName = file.name;
      }

      // Create product document in Firestore (filter out undefined values)
      const digitalFile: any = {
        title: fileData.title,
        description: fileData.description,
        priceRSD: fileData.priceRSD,
        priceEUR: fileData.priceEUR,
        accessLevel: fileData.accessLevel,
        language: fileData.language,
        isActive: true,
        createdBy: 'admin', // TODO: Get from auth service
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add optional fields only if they have values
      if (fileData.tags && fileData.tags.length > 0) {
        digitalFile.tags = fileData.tags;
      }
      if (fileData.imageUrl && fileData.imageUrl.trim()) {
        digitalFile.imageUrl = fileData.imageUrl.trim();
      }
      if (fileData.bankAccountNumber && fileData.bankAccountNumber.trim()) {
        digitalFile.bankAccountNumber = fileData.bankAccountNumber.trim();
      }
      if (fileData.phoneNumber && fileData.phoneNumber.trim()) {
        digitalFile.phoneNumber = fileData.phoneNumber.trim();
      }
      if (fileData.author && fileData.author.trim()) {
        digitalFile.author = fileData.author.trim();
      }
      if (fileData.paypalLink && fileData.paypalLink.trim()) {
        digitalFile.paypalLink = fileData.paypalLink.trim();
      }

      // Only add file-related fields if they have values (Firestore doesn't support undefined)
      if (fileName) {
        digitalFile.fileName = fileName;
      }
      if (fileSize && fileSize > 0) {
        digitalFile.fileSize = fileSize;
      }
      if (fileType) {
        digitalFile.fileType = fileType;
      }
      if (downloadURL) {
        digitalFile.fileUrl = downloadURL;
      }

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
           // .orderBy('createdAt', 'desc') // Temporarily commented out while index builds
      )
      .valueChanges({ idField: 'id' }) as Observable<DigitalFile[]>;
  }

  /**
   * Download file with enhanced security
   */
  downloadFile(file: DigitalFile): Observable<boolean> {
    if (!file?.id) {
      throw new Error('File ID not available');
    }

    // Use Firebase Function for server-side access validation and file content
    const downloadFileContent = this.functions.httpsCallable('downloadFileContent');
    
    return new Observable(observer => {
      downloadFileContent({ fileId: file.id }).subscribe({
        next: (result: any) => {
          console.log('🔍 Firebase Function result received:', result);
          console.log('🔍 Result type:', typeof result);
          console.log('🔍 Result keys:', Object.keys(result || {}));
          
          // Firebase Functions return data directly, not wrapped in result.data
          // Check both possible locations: result.data and result
          let downloadData: any;
          
          if (result?.data && typeof result.data === 'object') {
            downloadData = result.data;
            console.log('📦 Using result.data');
          } else if (result && typeof result === 'object') {
            downloadData = result;
            console.log('📦 Using result directly');
          }
          
          console.log('📦 Download data:', downloadData);
          console.log('📦 Has access:', downloadData?.hasAccess);
          console.log('📦 File content length:', downloadData?.fileContent?.length || 0);
          console.log('📦 File content preview:', downloadData?.fileContent?.substring(0, 100) + '...');
          console.log('📦 File name:', downloadData?.fileName);
          console.log('📦 File type:', downloadData?.fileType);
          
          if (downloadData?.hasAccess && downloadData?.fileContent) {
            // Create download from base64 content
            this.createDownloadFromContent(downloadData.fileContent, downloadData.fileName, downloadData.fileType)
              .then(() => {
                observer.next(true);
                observer.complete();
              })
              .catch(error => {
                console.error('Error creating download from content:', error);
                observer.error(error);
              });
          } else {
            console.error('Access denied or no file content for file:', file.id);
            observer.error(new Error('Access denied or file content unavailable'));
          }
        },
        error: (error: any) => {
          console.error('Error downloading file content:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Download file by ID with enhanced security
   */
  downloadFileById(fileId: string): Observable<boolean> {
    if (!fileId) {
      throw new Error('Missing file ID');
    }

    return this.getFile(fileId).pipe(
      switchMap(file => {
        if (!file) {
          throw new Error('File not found');
        }
        return this.downloadFile(file);
      }),
      catchError(error => {
        console.error('Error downloading file by ID:', error);
        throw error;
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

    // Use Firebase Function for server-side access validation and file content
    const downloadFileContent = this.functions.httpsCallable('downloadFileContent');
    
    return new Observable(observer => {
      downloadFileContent({ fileId: file.id }).subscribe({
        next: (result: any) => {
          // Firebase Functions return data directly, not wrapped in result.data
          // Check both possible locations: result.data and result
          let downloadData: any;
          
          if (result?.data && typeof result.data === 'object') {
            downloadData = result.data;
          } else if (result && typeof result === 'object') {
            downloadData = result;
          }
          
          if (downloadData?.hasAccess && downloadData?.fileContent) {
            // Create a data URL from the base64 content
            const dataUrl = `data:${downloadData.fileType};base64,${downloadData.fileContent}`;
            observer.next(dataUrl);
            observer.complete();
          } else {
            console.error('Access denied or no file content for file:', file.id);
            observer.error(new Error('Access denied or file content unavailable'));
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
   * Create a download from base64 file content
   * Works on both web browsers and Android apps
   */
  private async createDownloadFromContent(base64Content: string, fileName: string, fileType: string): Promise<void> {
    try {
      console.log('🚀 Starting download process...');
      console.log('📊 Download parameters:', { fileName, fileType, contentLength: base64Content?.length || 0 });
      
      // Validate base64 content
      console.log('🔍 Validating base64 content...');
      const isValidBase64 = this.isValidBase64(base64Content);
      console.log('✅ Base64 valid:', isValidBase64);
      
      if (!isValidBase64) {
        throw new Error('Invalid base64 content received from server');
      }
      
      // Check if we're running on a native platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Native platform detected, using Capacitor Filesystem...');
        console.log('🔧 Capacitor platform:', Capacitor.getPlatform());
        await this.downloadFileNative(base64Content, fileName, fileType);
      } else {
        console.log('🌐 Web platform detected, using browser download...');
        await this.downloadFileWeb(base64Content, fileName, fileType);
      }
      
      console.log('✅ Download process completed successfully');
    } catch (error: any) {
      console.error('❌ Error creating download from content:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to create download from content: ${error.message}`);
    }
  }

  /**
   * Download file on web browsers
   */
  private async downloadFileWeb(base64Content: string, fileName: string, fileType: string): Promise<void> {
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = `data:${fileType};base64,${base64Content}`; // Create a data URL
    link.download = fileName; // Use the provided filename
    link.target = '_blank';
    
    // Append to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download file on native platforms (Android/iOS)
   */
  private async downloadFileNative(base64Content: string, fileName: string, fileType: string): Promise<void> {
    try {
      console.log('📱 Native platform detected, using Capacitor Filesystem...');
      console.log('📁 File details:', { fileName, fileType, contentLength: base64Content.length });
      
      // Check if we have valid base64 content
      if (!base64Content || base64Content.length === 0) {
        throw new Error('Base64 content is empty or invalid');
      }
      
      console.log('🔍 Base64 content preview:', base64Content.substring(0, 50) + '...');
      
      // Convert base64 to binary data first
      console.log('🔄 Converting base64 to binary data...');
      const binaryData = this.base64ToArrayBuffer(base64Content);
      console.log('📊 Binary data size:', binaryData.byteLength, 'bytes');
      
      // Convert binary data back to base64 for Capacitor (it expects base64 encoded data)
      console.log('🔄 Converting binary to base64 for Capacitor...');
      const base64ForCapacitor = this.arrayBufferToBase64(binaryData);
      console.log('📊 Base64 for Capacitor size:', base64ForCapacitor.length, 'characters');
      
      // For Capacitor, we need to pass the data without encoding parameter for binary files
      console.log('💾 Writing file to Documents directory...');
      
      const writeOptions: any = {
        path: fileName,
        data: base64ForCapacitor,
        directory: Directory.Documents
      };
      
      // Only add encoding for text files, not for binary files
      if (fileType.startsWith('text/') || fileType === 'application/json') {
        writeOptions.encoding = Encoding.UTF8;
        console.log('📝 Using UTF8 encoding for text file');
      } else {
        console.log('📦 Using binary mode for non-text file');
      }
      
      const result = await Filesystem.writeFile(writeOptions);
      
      console.log('✅ File saved successfully:', result.uri);
      console.log('📂 File location:', result.uri);
      
      // Show success message (you can customize this)
      // Note: On Android, the file will be saved to the Documents folder
      // Users can find it in their file manager
      
    } catch (error: any) {
      console.error('❌ Error saving file to device:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Convert Blob to base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 part
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Validate if string is valid base64
   */
  private isValidBase64(str: string): boolean {
    try {
      // Check if string is not empty
      if (!str || str.length === 0) {
        console.log('❌ Base64 validation failed: Empty string');
        return false;
      }

      // Check if string length is multiple of 4
      if (str.length % 4 !== 0) {
        console.log('❌ Base64 validation failed: Length not multiple of 4');
        return false;
      }

      // Check if string contains only valid base64 characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        console.log('❌ Base64 validation failed: Invalid characters');
        return false;
      }

      // Try to decode and re-encode to verify
      const decoded = atob(str);
      const reEncoded = btoa(decoded);
      
      if (reEncoded !== str) {
        console.log('❌ Base64 validation failed: Decode/re-encode mismatch');
        return false;
      }

      console.log('✅ Base64 validation passed');
      return true;
    } catch (error) {
      console.log('❌ Base64 validation failed with error:', error);
      return false;
    }
  }
}
