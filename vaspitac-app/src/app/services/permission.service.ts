/**
 * PermissionService handles role-based access control and permission checking.
 * Integrates with subscription system to determine user access rights.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile, UserRole, Permission, SubscriptionStatus } from '../models/user-profile.model';
import { LoadingService } from './loading.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(
    private _loadingService: LoadingService,
    private _translateService: TranslateService
  ) {}

  /**
   * Check if user has a specific permission
   * @param user - User profile to check
   * @param permission - Permission to check for
   * @returns Observable of boolean indicating if user has permission
   */
  hasPermission(user: UserProfile | null, permission: Permission): Observable<boolean> {
    if (!user) {
      return of(false);
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return of(true);
    }

    // Check if user has the specific permission
    return of(user.permissions.includes(permission));
  }

  /**
   * Check if user has any of the specified permissions
   * @param user - User profile to check
   * @param permissions - Array of permissions to check for
   * @returns Observable of boolean indicating if user has any of the permissions
   */
  hasAnyPermission(user: UserProfile | null, permissions: Permission[]): Observable<boolean> {
    if (!user) {
      return of(false);
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return of(true);
    }

    // Check if user has any of the specified permissions
    return of(permissions.some(permission => user.permissions.includes(permission)));
  }

  /**
   * Check if user has all of the specified permissions
   * @param user - User profile to check
   * @param permissions - Array of permissions to check for
   * @returns Observable of boolean indicating if user has all permissions
   */
  hasAllPermissions(user: UserProfile | null, permissions: Permission[]): Observable<boolean> {
    if (!user) {
      return of(false);
    }

    // Admin has all permissions
    if (user.role === UserRole.ADMIN) {
      return of(true);
    }

    // Check if user has all of the specified permissions
    return of(permissions.every(permission => user.permissions.includes(permission)));
  }

  /**
   * Check if user has an active subscription
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user has active subscription
   */
  hasActiveSubscription(user: UserProfile | null): Observable<boolean> {
    if (!user || !user.subscription) {
      return of(false);
    }

    const now = new Date();
    const endDate = user.subscription.endDate ? new Date(user.subscription.endDate) : null;
    
    return of(
      user.subscription.status === SubscriptionStatus.ACTIVE ||
      user.subscription.status === SubscriptionStatus.TRIAL ||
      (endDate !== null && endDate > now)
    );
  }

  /**
   * Get user's subscription status
   * @param user - User profile to check
   * @returns Observable of subscription status or null
   */
  getSubscriptionStatus(user: UserProfile | null): Observable<SubscriptionStatus | null> {
    if (!user || !user.subscription) {
      return of(null);
    }

    return of(user.subscription.status);
  }

  /**
   * Check if user can access premium content
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user can access premium content
   */
  canAccessPremiumContent(user: UserProfile | null): Observable<boolean> {
    if (!user) {
      return of(false);
    }

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
      return of(true);
    }

    // Check subscription status
    return this.hasActiveSubscription(user).pipe(
      map(hasActiveSubscription => {
        if (!hasActiveSubscription) {
          return false;
        }

        // Check for premium content permissions
        const premiumPermissions = [
          Permission.ACCESS_PREMIUM_ACTIVITIES,
          Permission.ACCESS_PREMIUM_BLOG
        ];

        return premiumPermissions.some(permission => 
          user.permissions.includes(permission)
        );
      })
    );
  }

  /**
   * Check if user can download materials
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user can download materials
   */
  canDownloadMaterials(user: UserProfile | null): Observable<boolean> {
    if (!user) {
      return of(false);
    }

    // Admin can download everything
    if (user.role === UserRole.ADMIN) {
      return of(true);
    }

    // Check for download permissions
    const downloadPermissions = [
      Permission.DOWNLOAD_PDF_GUIDES,
      Permission.DOWNLOAD_VIDEO_MATERIALS
    ];

    return this.hasAnyPermission(user, downloadPermissions);
  }

  /**
   * Get default permissions for a user role
   * @param role - User role
   * @returns Array of default permissions for the role
   */
  getDefaultPermissionsForRole(role: UserRole): Permission[] {
    switch (role) {
      case UserRole.ADMIN:
        return Object.values(Permission); // Admin gets all permissions
      
      case UserRole.SUBSCRIBER:
        return [
          Permission.ACCESS_ALL_ACTIVITIES,
          Permission.ACCESS_PREMIUM_ACTIVITIES,
          Permission.ACCESS_BLOG_POSTS,
          Permission.ACCESS_PREMIUM_BLOG,

          Permission.DOWNLOAD_PDF_GUIDES,
          Permission.DOWNLOAD_VIDEO_MATERIALS,
          Permission.EDIT_PROFILE,
          Permission.VIEW_PROFILE,
          Permission.MANAGE_OWN_SUBSCRIPTION
        ];
      
      case UserRole.TRIAL_USER:
        return [
          Permission.ACCESS_ALL_ACTIVITIES,
          Permission.ACCESS_BLOG_POSTS,
          Permission.EDIT_PROFILE,
          Permission.VIEW_PROFILE,
          Permission.MANAGE_OWN_SUBSCRIPTION
        ];
      
      case UserRole.FREE_USER:
        return [
          Permission.ACCESS_BLOG_POSTS,
          Permission.EDIT_PROFILE,
          Permission.VIEW_PROFILE
        ];
      
      default:
        return [];
    }
  }

  /**
   * Check if user can manage content (admin only)
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user can manage content
   */
  canManageContent(user: UserProfile | null): Observable<boolean> {
    return this.hasPermission(user, Permission.MANAGE_CONTENT);
  }

  /**
   * Check if user can manage users (admin only)
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user can manage users
   */
  canManageUsers(user: UserProfile | null): Observable<boolean> {
    return this.hasPermission(user, Permission.MANAGE_USERS);
  }

  /**
   * Check if user can view analytics (admin only)
   * @param user - User profile to check
   * @returns Observable of boolean indicating if user can view analytics
   */
  canViewAnalytics(user: UserProfile | null): Observable<boolean> {
    return this.hasPermission(user, Permission.VIEW_ANALYTICS);
  }
} 