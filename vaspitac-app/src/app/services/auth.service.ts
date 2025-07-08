/**
 * AuthService handles authentication using Firebase Auth.
 * Supports email/password authentication only.
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
    try {
      const cred = await this._afAuth.createUserWithEmailAndPassword(email, password);
      if (cred.user) {
        if (cred.user.updateProfile) {
          await cred.user.updateProfile({ displayName });
        }
        return cred.user;
      }
      return null;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      throw this._handleAuthError(error as Error & { code?: string });
    }
  }

  /**
   * Log in with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with the logged-in user or null
   */
  async signIn(email: string, password: string): Promise<firebase.User | null> {
    try {
      const cred = await this._afAuth.signInWithEmailAndPassword(email, password);
      return cred.user;
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      throw this._handleAuthError(error as Error & { code?: string });
    }
  }

  /**
   * Log out the current user
   * @returns Promise resolved when sign out is complete
   */
  async signOut(): Promise<void> {
    try {
      await this._afAuth.signOut();
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      throw this._handleAuthError(error as Error & { code?: string });
    }
  }

  /**
   * Get the current user
   * @returns Promise<firebase.User | null> - Current user or null
   */
  async getCurrentUser(): Promise<firebase.User | null> {
    return await this._afAuth.currentUser;
  }

  /**
   * Check if user is logged in
   * @returns Promise<boolean> - true if logged in, false otherwise
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const currentUser = await this._afAuth.currentUser;
      return !!currentUser;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Handle Firebase Auth errors and provide user-friendly messages
   * @param error - Firebase error object
   * @returns Error with user-friendly message
   */
  private _handleAuthError(error: Error & { code?: string }): Error {
    let message = 'An authentication error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection and try again.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address. Please check your email and try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/operation-not-allowed':
        message = 'This sign-in method is not enabled. Please contact support.';
        break;
      default:
        message = error.message || message;
    }
    
    const userError = new Error(message);
    userError.name = error.code || 'auth/unknown';
    return userError;
  }

  /**
   * Send a password reset email to the given address
   * @param email - User's email address
   * @returns Promise<void>
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this._afAuth.sendPasswordResetEmail(email);
    } catch (error: unknown) {
      console.error('Password reset email error:', error);
      throw this._handleAuthError(error as Error & { code?: string });
    }
  }
} 