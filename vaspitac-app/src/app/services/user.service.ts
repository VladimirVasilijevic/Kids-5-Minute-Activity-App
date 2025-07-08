/**
 * UserService manages user profiles in Firestore.
 */
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserProfile } from '../models/user-profile.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private _afs: AngularFirestore) {}

  /**
   * Get a user profile by UID
   * @param uid - Firebase Auth UID
   * @returns Observable of UserProfile or null
   */
  getUserProfile(uid: string): Observable<UserProfile | null> {
    return this._afs.doc<UserProfile>(`users/${uid}`).valueChanges().pipe(
      map(profile => profile ?? null)
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