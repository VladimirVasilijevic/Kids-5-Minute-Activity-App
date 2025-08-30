import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable, of, map, catchError, firstValueFrom } from 'rxjs';
import { UserAccess } from '../models/user-access.model';

@Injectable({
  providedIn: 'root'
})
export class UserAccessService {
  private readonly COLLECTION = 'user_access';

  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  /**
   * Check if a user has access to a specific file
   * This method now uses server-side validation for enhanced security
   */
  hasAccess(userId: string, fileId: string): Observable<boolean> {
    if (!userId || !fileId) {
      return of(false);
    }

    // Use Firebase Function for server-side validation
    const verifyAccess = this.functions.httpsCallable('verifyFileAccess');
    
    return new Observable(observer => {
      verifyAccess({ fileId }).subscribe({
        next: (result: any) => {
          // Firebase Functions return data directly, not wrapped in result.data
          // Check both possible locations: result.data.hasAccess and result.hasAccess
          let hasAccess: boolean | undefined;
          
          if (result?.data?.hasAccess !== undefined) {
            hasAccess = result.data.hasAccess;
          } else if (result?.hasAccess !== undefined) {
            hasAccess = result.hasAccess;
          }
          
          if (typeof hasAccess === 'boolean') {
            observer.next(hasAccess);
          } else {
            console.warn('Could not find valid hasAccess value in result');
            observer.next(false);
          }
          observer.complete();
        },
        error: (error: any) => {
          console.error('❌ Error verifying file access:', error);
          // Return false on error to prevent access issues
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  /**
   * Get all files a user has access to
   */
  getUserAccessibleFiles(userId: string): Observable<UserAccess[]> {
    if (!userId) {
      return of([]);
    }

    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('userId', '==', userId)
           .where('isActive', '==', true)
      )
      .valueChanges({ idField: 'id' }) as Observable<UserAccess[]>;
  }

  /**
   * Grant access to a user for a specific file
   * This method now uses Firebase Functions for enhanced security
   */
  async grantAccess(userId: string, fileId: string, purchaseId: string, grantedBy: string): Promise<void> {
    if (!userId || !fileId || !purchaseId || !grantedBy) {
      throw new Error('Missing required parameters for granting access');
    }

    try {
      // Use Firebase Function for server-side access granting
      const grantAccess = this.functions.httpsCallable('grantFileAccess');
      await grantAccess({ userId, fileId, purchaseId });
    } catch (error) {
      console.error('Error granting access:', error);
      throw new Error('Failed to grant access');
    }
  }

  /**
   * Revoke access from a user for a specific file
   * This method now uses Firebase Functions for enhanced security
   */
  async revokeAccess(userId: string, fileId: string): Promise<void> {
    if (!userId || !fileId) {
      throw new Error('Missing required parameters for revoking access');
    }

    try {
      // Use Firebase Function for server-side access revocation
      const revokeAccess = this.functions.httpsCallable('revokeFileAccess');
      await revokeAccess({ userId, fileId });
    } catch (error) {
      console.error('Error revoking access:', error);
      throw new Error('Failed to revoke access');
    }
  }

  /**
   * Get access record for a specific user and file
   */
  getUserAccess(userId: string, fileId: string): Observable<UserAccess | null> {
    if (!userId || !fileId) {
      return of(null);
    }

    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('userId', '==', userId)
           .where('fileId', '==', fileId)
           .where('isActive', '==', true)
           .limit(1)
      )
      .get()
      .pipe(
        map(snapshot => {
          if (snapshot.empty) return null;
          const doc = snapshot.docs[0];
          const data = doc.data();
          if (!data) return null;
          return { id: doc.id, ...data } as UserAccess;
        }),
        catchError(error => {
          console.error('Error getting user access:', error);
          return of(null);
        })
      );
  }

  /**
   * Check if user has active access to multiple files
   * This method now uses server-side validation for enhanced security
   */
  hasMultipleAccess(userId: string, fileIds: string[]): Observable<Record<string, boolean>> {
    if (!userId || !fileIds.length) {
      return of({});
    }

    // For multiple files, we'll check each one individually using the secure method
    const accessChecks = fileIds.map(fileId => 
      this.hasAccess(userId, fileId).pipe(
        map(hasAccess => ({ fileId, hasAccess }))
      )
    );

    return new Observable(observer => {
      // Use Promise.all to check all files in parallel
      Promise.all(accessChecks.map(check => firstValueFrom(check)))
        .then(results => {
          const accessMap: Record<string, boolean> = {};
          results.forEach(result => {
            accessMap[result.fileId] = result.hasAccess;
          });
          observer.next(accessMap);
          observer.complete();
        })
        .catch(error => {
          console.error('❌ Error checking multiple access:', error);
          // Fallback to empty access map
          const accessMap: Record<string, boolean> = {};
          fileIds.forEach(fileId => accessMap[fileId] = false);
          observer.next(accessMap);
          observer.complete();
        });
    });
  }

  /**
   * Verify access on server side and get secure download information
   * This method provides enhanced security for file downloads
   */
  getSecureFileDownload(fileId: string): Observable<{
    hasAccess: boolean;
    fileId: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    downloadUrl?: string;
    accessVerifiedAt?: string;
  }> {
    if (!fileId) {
      return of({ hasAccess: false, fileId: '' });
    }

    // Use Firebase Function for server-side validation
    const getSecureDownload = this.functions.httpsCallable('getSecureFileDownload');
    
    return new Observable(observer => {
      getSecureDownload({ fileId }).subscribe({
        next: (result: any) => {
          // Firebase Functions return data directly, not wrapped in result.data
          // Check both possible locations: result.data and result
          let downloadData: any;
          
          if (result?.data && typeof result.data === 'object') {
            downloadData = result.data;
          } else if (result && typeof result === 'object') {
            downloadData = result;
          }
          
          if (downloadData && typeof downloadData.hasAccess === 'boolean') {
            observer.next(downloadData);
          } else {
            console.warn('Could not find valid download data');
            observer.next({ hasAccess: false, fileId });
          }
          observer.complete();
        },
        error: (error: any) => {
          console.error('Error getting secure file download:', error);
          observer.next({ hasAccess: false, fileId });
          observer.complete();
        }
      });
    });
  }

  /**
   * Verify purchase and grant access
   * This method handles the complete purchase verification workflow securely
   */
  async verifyPurchaseAndGrantAccess(purchaseId: string, adminNotes?: string): Promise<{
    success: boolean;
    message: string;
    purchaseId: string;
    accessResult?: any;
  }> {
    if (!purchaseId) {
      throw new Error('Missing purchase ID');
    }

    try {
      // Use Firebase Function for server-side purchase verification
      const verifyPurchase = this.functions.httpsCallable('verifyPurchaseAndGrantAccess');
      const result = await firstValueFrom(verifyPurchase({ purchaseId, adminNotes }));
      
      // Firebase Functions return data directly, not wrapped in result.data
      // Check both possible locations: result.data and result
      let responseData: any;
      
      if (result?.data && typeof result.data === 'object') {
        responseData = result.data;
      } else if (result && typeof result === 'object') {
        responseData = result;
      }
      
      if (responseData) {
        return responseData;
      } else {
        console.error('Invalid response format from verifyPurchaseAndGrantAccess');
        throw new Error('Invalid response format from purchase verification');
      }
    } catch (error) {
      console.error('Error verifying purchase and granting access:', error);
      throw new Error('Failed to verify purchase and grant access');
    }
  }
}
