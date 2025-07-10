/**
 * PermissionGuard protects routes based on user permissions and subscription status.
 * Can be used to restrict access to premium content, admin features, etc.
 */
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { PermissionService } from '../services/permission.service';
import { Permission, UserProfile } from '../models/user-profile.model';

export interface PermissionGuardData {
  /** Required permissions for the route */
  permissions?: Permission[];
  /** Whether user needs active subscription */
  requiresSubscription?: boolean;
  /** Whether user needs premium access */
  requiresPremium?: boolean;
  /** Redirect route if access is denied */
  redirectTo?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  constructor(
    private _auth: AuthService,
    private _userService: UserService,
    private _permissionService: PermissionService,
    private _router: Router
  ) {}

  /**
   * Check if user can activate the route
   * @param route - Current route snapshot
   * @param state - Router state snapshot
   * @returns Observable of boolean indicating if access is allowed
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const guardData: PermissionGuardData = route.data['permissions'] || {};
    
    return this._auth.user$.pipe(
      switchMap(user => {
        if (!user) {
          // User not logged in, redirect to login
          this._redirectToLogin(state.url);
          return of(false);
        }

        return this._userService.getUserProfile(user.uid).pipe(
          switchMap(userProfile => {
            if (!userProfile) {
              // User profile not found, redirect to login
              this._redirectToLogin(state.url);
              return of(false);
            }

            return this._checkPermissions(userProfile, guardData);
          }),
          catchError(() => {
            // Error loading user profile, redirect to login
            this._redirectToLogin(state.url);
            return of(false);
          })
        );
      }),
      catchError(() => {
        // Error with auth state, redirect to login
        this._redirectToLogin(state.url);
        return of(false);
      })
    );
  }

  /**
   * Check if user has required permissions
   * @param userProfile - User profile to check
   * @param guardData - Permission guard data
   * @returns Observable of boolean indicating if access is allowed
   */
  private _checkPermissions(
    userProfile: UserProfile,
    guardData: PermissionGuardData
  ): Observable<boolean> {
    // Check if subscription is required
    if (guardData.requiresSubscription) {
      return this._permissionService.hasActiveSubscription(userProfile).pipe(
        switchMap(hasSubscription => {
          if (!hasSubscription) {
            this._redirectToSubscription(guardData.redirectTo);
            return of(false);
          }
          return this._checkSpecificPermissions(userProfile, guardData);
        })
      );
    }

    // Check if premium access is required
    if (guardData.requiresPremium) {
      return this._permissionService.canAccessPremiumContent(userProfile).pipe(
        switchMap(hasPremium => {
          if (!hasPremium) {
            this._redirectToSubscription(guardData.redirectTo);
            return of(false);
          }
          return this._checkSpecificPermissions(userProfile, guardData);
        })
      );
    }

    return this._checkSpecificPermissions(userProfile, guardData);
  }

  /**
   * Check specific permissions for the route
   * @param userProfile - User profile to check
   * @param guardData - Permission guard data
   * @returns Observable of boolean indicating if access is allowed
   */
  private _checkSpecificPermissions(
    userProfile: UserProfile,
    guardData: PermissionGuardData
  ): Observable<boolean> {
    if (!guardData.permissions || guardData.permissions.length === 0) {
      return of(true);
    }

    return this._permissionService.hasAllPermissions(userProfile, guardData.permissions).pipe(
      map(hasPermissions => {
        if (!hasPermissions) {
          this._redirectToAccessDenied(guardData.redirectTo);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Redirect to login page
   * @param returnUrl - URL to return to after login
   */
  private _redirectToLogin(returnUrl: string): void {
    this._router.navigate(['/'], { 
      queryParams: { 
        returnUrl,
        showAuth: 'true'
      }
    });
  }

  /**
   * Redirect to subscription page
   * @param redirectTo - Custom redirect URL
   */
  private _redirectToSubscription(redirectTo?: string): void {
    if (redirectTo) {
      this._router.navigate([redirectTo]);
    } else {
      this._router.navigate(['/shop'], { 
        queryParams: { 
          upgrade: 'true'
        }
      });
    }
  }

  /**
   * Redirect to access denied page
   * @param redirectTo - Custom redirect URL
   */
  private _redirectToAccessDenied(redirectTo?: string): void {
    if (redirectTo) {
      this._router.navigate([redirectTo]);
    } else {
      this._router.navigate(['/'], { 
        queryParams: { 
          error: 'access_denied'
        }
      });
    }
  }
} 