/**
 * AuthService handles authentication using Firebase Auth.
 * Supports email/password and social providers.
 */
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Observable of the current Firebase user (null if not logged in)
   */
  user$: Observable<firebase.User | null>;

  constructor(private _afAuth: AngularFireAuth) {
    this.user$ = this._afAuth.authState;
  }

  /**
   * Sign up with email and password
   * @param email - User's email
   * @param password - User's password
   * @param displayName - User's display name
   * @returns Promise with the created user or null
   */
  async signUp(email: string, password: string, displayName: string): Promise<firebase.User | null> {
    const cred = await this._afAuth.createUserWithEmailAndPassword(email, password);
    if (cred.user) {
      await cred.user.updateProfile({ displayName });
      return cred.user;
    }
    return null;
  }

  /**
   * Log in with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with the logged-in user or null
   */
  async signIn(email: string, password: string): Promise<firebase.User | null> {
    const cred = await this._afAuth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  /**
   * Log out the current user
   * @returns Promise resolved when sign out is complete
   */
  signOut(): Promise<void> {
    return this._afAuth.signOut();
  }

  /**
   * Log in with a social provider (Google, Facebook, etc.)
   * @param provider - 'google' | 'facebook'
   * @returns Promise with the logged-in user or null
   */
  async signInWithProvider(provider: string): Promise<firebase.User | null> {
    let authProvider: firebase.auth.AuthProvider;
    if (provider === 'google') {
      authProvider = new firebase.auth.GoogleAuthProvider();
    } else if (provider === 'facebook') {
      authProvider = new firebase.auth.FacebookAuthProvider();
    } else {
      throw new Error('Unsupported provider');
    }
    const cred: firebase.auth.UserCredential = await this._afAuth.signInWithPopup(authProvider);
    return cred.user;
  }
} 