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

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _afs: AngularFirestore,
    private _loadingService: LoadingService,
    private _translateService: TranslateService
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
} 