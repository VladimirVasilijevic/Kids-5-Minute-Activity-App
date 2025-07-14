/**
 * UserService manages user profiles in Firestore.
 */
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserProfile } from '../models/user-profile.model';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from './loading.service';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

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
      map(profile => profile ?? null),
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
      tap(() => {
        this._loadingService.hide();
      })
    );
  }

  /**
   * Create a new user via Firebase Callable Function
   * @param data - { email, password, displayName, role }
   * @returns Observable from the callable function
   */
  createUser(data: { email: string; password: string; displayName: string; role: string }) {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SAVING'));
    return this._functions.httpsCallable('createUser')(data).pipe(
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
  updateUser(data: { uid: string; displayName: string; role: string }) {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SAVING'));
    return this._functions.httpsCallable('updateUser')(data).pipe(
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
  deleteUser(data: { uid: string }) {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.DELETING'));
    return this._functions.httpsCallable('deleteUser')(data).pipe(
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
  resetUserPassword(data: { email: string }) {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.SENDING'));
    return this._functions.httpsCallable('resetUserPassword')(data).pipe(
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
  deleteOwnProfile(data: { password: string }) {
    this._loadingService.showWithMessage(this._translateService.instant('COMMON.DELETING'));
    return this._functions.httpsCallable('deleteOwnProfile')(data).pipe(
      tap({
        next: () => this._loadingService.hide(),
        error: () => this._loadingService.hide()
      })
    );
  }
} 