/**
 * UserService manages user profiles in Firestore.
 */
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserProfile } from '../models/user-profile.model';
import { Observable, tap, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from './loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

/**
 * Interface for API response with success status and optional message
 */
interface ApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Interface for password reset response
 */
interface PasswordResetResponse extends ApiResponse {
  resetLink?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _afs: AngularFirestore,
    private _loadingService: LoadingService,
    private _translateService: TranslateService,
    private _functions: AngularFireFunctions
  ) {}

  /**
   * Get a user profile by UID with loading indicator
   * @param uid - Firebase Auth UID
   * @returns Observable of UserProfile or null
   */
  getUserProfile(uid: string): Observable<UserProfile | null> {
    this._loadingService.showWithMessage(this._translateService.instant('PROFILE.LOADING'));
    
    return this._afs.doc<UserProfile>(`users/${uid}`).valueChanges().pipe(
      map(profile => {
        if (!profile) return null;
        
        return {
          ...profile,
          // Convert Firestore Timestamps to Date objects
          createdAt: this.convertTimestamp(profile.createdAt),
          updatedAt: profile.updatedAt ? this.convertTimestamp(profile.updatedAt) : undefined,
          // Handle subscription dates if they exist
          subscription: profile.subscription ? {
            ...profile.subscription,
            startDate: this.convertTimestamp(profile.subscription.startDate),
            endDate: profile.subscription.endDate ? this.convertTimestamp(profile.subscription.endDate) : undefined,
            lastPaymentDate: profile.subscription.lastPaymentDate ? this.convertTimestamp(profile.subscription.lastPaymentDate) : undefined,
            nextPaymentDate: profile.subscription.nextPaymentDate ? this.convertTimestamp(profile.subscription.nextPaymentDate) : undefined
          } : undefined
        };
      }),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Create or update a user profile in Firestore
   * @param profile - UserProfile object
   * @returns Promise resolved when the profile is set
   */
  setUserProfile(profile: UserProfile): Promise<void> {
    return this._afs.doc<UserProfile>(`users/${profile.uid}`).set(profile, { merge: true });
  }

  /**
   * Get all user profiles from Firestore
   * @returns Observable of UserProfile[]
   */
  getAllUsers(): Observable<UserProfile[]> {
    this._loadingService.showWithMessage(this._translateService.instant('PROFILE.LOADING'));
    return this._afs.collection<UserProfile>('users').valueChanges().pipe(
      map(users => users.map(user => ({
        ...user,
        // Convert Firestore Timestamps to Date objects
        createdAt: this.convertTimestamp(user.createdAt),
        updatedAt: user.updatedAt ? this.convertTimestamp(user.updatedAt) : undefined,
        // Handle subscription dates if they exist
        subscription: user.subscription ? {
          ...user.subscription,
          startDate: this.convertTimestamp(user.subscription.startDate),
          endDate: user.subscription.endDate ? this.convertTimestamp(user.subscription.endDate) : undefined,
          lastPaymentDate: user.subscription.lastPaymentDate ? this.convertTimestamp(user.subscription.lastPaymentDate) : undefined,
          nextPaymentDate: user.subscription.nextPaymentDate ? this.convertTimestamp(user.subscription.nextPaymentDate) : undefined
        } : undefined
      }))),
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Converts a Firestore Timestamp to an ISO string or returns the original value
   * @param timestamp - Firestore Timestamp, Date, or string
   * @returns ISO string or original value
   */
  private convertTimestamp(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      // If it's already a string, return it
      if (typeof timestamp === 'string') {
        return timestamp;
      }
      
      // If it's a Date object, convert to ISO string
      if (timestamp instanceof Date) {
        return timestamp.toISOString();
      }
      
      // If it's a Firestore Timestamp, convert to Date then to ISO string
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds !== undefined) {
        return new Date(timestamp.seconds * 1000).toISOString();
      }
      
      // If it's a number (milliseconds), convert to Date then to ISO string
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toISOString();
      }
      
      // Fallback: try to convert to string
      return String(timestamp);
    } catch (error) {
      console.warn('Failed to convert timestamp:', timestamp, error);
      return '';
    }
  }

  /**
   * Create a new user via Firebase Callable Function
   * @param data - { email, password, displayName, role }
   * @returns Observable from the callable function
   */
  createUser(data: { email: string; password: string; displayName: string; role: string }): Observable<ApiResponse> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SAVING'));
    return from(this._functions.httpsCallable('createUser')(data)).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }

  /**
   * Update an existing user via Firebase Callable Function
   * @param data - { uid, displayName, role }
   * @returns Observable from the callable function
   */
  updateUser(data: { uid: string; displayName: string; role: string }): Observable<ApiResponse> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SAVING'));
    return from(this._functions.httpsCallable('updateUser')(data)).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }

  /**
   * Delete a user via Firebase Callable Function
   * @param data - { uid }
   * @returns Observable from the callable function
   */
  deleteUser(data: { uid: string }): Observable<ApiResponse> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.DELETING'));
    return from(this._functions.httpsCallable('deleteUser')(data)).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }

  /**
   * Reset user password via Firebase Callable Function
   * @param data - { email }
   * @returns Observable from the callable function
   */
  resetUserPassword(data: { email: string }): Observable<PasswordResetResponse> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SENDING'));
    return from(this._functions.httpsCallable('resetUserPassword')(data)).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }

  /**
   * Delete own profile via Firebase Callable Function
   * @param data - { password }
   * @returns Observable from the callable function
   */
  deleteOwnProfile(data: { password: string }): Observable<ApiResponse> {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.DELETING'));
    return from(this._functions.httpsCallable('deleteOwnProfile')(data)).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }
} 