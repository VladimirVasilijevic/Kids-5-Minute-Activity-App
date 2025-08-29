import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Observable, of, map, catchError, firstValueFrom } from 'rxjs';
import { Purchase, PurchaseFormData } from '../models/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly COLLECTION = 'purchases';

  constructor(
    private firestore: AngularFirestore,
    private functions: AngularFireFunctions
  ) {}

  /**
   * Create a new purchase record
   * This method now includes enhanced validation
   */
  async createPurchase(purchase: PurchaseFormData): Promise<string> {
    if (!purchase.userId || !purchase.fileId || !purchase.amount || !purchase.currency) {
      throw new Error('Missing required purchase information');
    }

    const purchaseData: Omit<Purchase, 'id'> = {
      ...purchase,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = await this.firestore.collection(this.COLLECTION).add(purchaseData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw new Error('Failed to create purchase record');
    }
  }

  /**
   * Get all purchases for a specific user
   */
  getUserPurchases(userId: string): Observable<Purchase[]> {
    if (!userId) {
      return of([]);
    }

    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('userId', '==', userId)
           .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' }) as Observable<Purchase[]>;
  }

  /**
   * Get all pending purchases for admin review
   */
  getPendingPurchases(): Observable<Purchase[]> {
    return this.firestore
      .collection(this.COLLECTION, ref => 
        ref.where('status', '==', 'PENDING')
           .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' }) as Observable<Purchase[]>;
  }

  /**
   * Get a specific purchase by ID
   */
  getPurchase(purchaseId: string): Observable<Purchase | null> {
    if (!purchaseId) {
      return of(null);
    }

    return this.firestore
      .collection(this.COLLECTION)
      .doc(purchaseId)
      .get()
      .pipe(
        map(doc => {
          if (!doc.exists) return null;
          const data = doc.data();
          if (!data) return null;
          return { id: doc.id, ...data } as Purchase;
        }),
        catchError(error => {
          console.error('Error getting purchase:', error);
          return of(null);
        })
      );
  }

  /**
   * Update payment proof for a purchase
   * This method now includes enhanced validation
   */
  async updatePaymentProof(purchaseId: string, paymentProof: string): Promise<void> {
    if (!purchaseId || !paymentProof) {
      throw new Error('Missing purchase ID or payment proof');
    }

    try {
      await this.firestore
        .collection(this.COLLECTION)
        .doc(purchaseId)
        .update({
          paymentProof,
          updatedAt: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating payment proof:', error);
      throw new Error('Failed to update payment proof');
    }
  }

  /**
   * Verify a purchase and grant access
   */
  async verifyPurchase(purchaseId: string, adminNotes?: string, verifiedBy?: string): Promise<boolean> {
    if (!purchaseId) {
      throw new Error('Missing purchase ID');
    }

    try {
      // Use Firebase Function for server-side verification
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
      
      if (responseData?.success !== undefined) {
        return responseData.success;
      } else {
        console.error('Invalid response format from verifyPurchaseAndGrantAccess');
        throw new Error('Invalid response format from purchase verification');
      }
    } catch (error) {
      console.error('Error verifying purchase:', error);
      throw new Error('Failed to verify purchase');
    }
  }

  /**
   * Reject a purchase
   */
  async rejectPurchase(purchaseId: string, rejectionReason: string, rejectedBy?: string): Promise<void> {
    if (!purchaseId || !rejectionReason) {
      throw new Error('Missing purchase ID or rejection reason');
    }

    const updateData: Partial<Purchase> = {
      status: 'REJECTED',
      rejectionReason,
      updatedAt: new Date().toISOString()
    };

    if (rejectedBy) {
      updateData.verifiedBy = rejectedBy;
    }

    try {
      await this.firestore
        .collection(this.COLLECTION)
        .doc(purchaseId)
        .update(updateData);
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      throw new Error('Failed to reject purchase');
    }
  }

  /**
   * Get purchase statistics
   */
  getPurchaseStats(): Observable<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  }> {
    return this.firestore
      .collection(this.COLLECTION)
      .valueChanges()
      .pipe(
        map(purchases => {
          const stats = {
            total: purchases.length,
            pending: 0,
            verified: 0,
            rejected: 0
          };

          purchases.forEach((purchase: any) => {
            switch (purchase.status) {
              case 'PENDING':
                stats.pending++;
                break;
              case 'VERIFIED':
                stats.verified++;
                break;
              case 'REJECTED':
                stats.rejected++;
                break;
            }
          });

          return stats;
        }),
        catchError(error => {
          console.error('Error getting purchase stats:', error);
          return of({ total: 0, pending: 0, verified: 0, rejected: 0 });
        })
      );
  }

  /**
   * Delete a purchase record
   * This method now includes enhanced validation
   */
  async deletePurchase(purchaseId: string): Promise<void> {
    if (!purchaseId) {
      throw new Error('Missing purchase ID');
    }

    try {
      await this.firestore
        .collection(this.COLLECTION)
        .doc(purchaseId)
        .delete();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw new Error('Failed to delete purchase');
    }
  }
}
