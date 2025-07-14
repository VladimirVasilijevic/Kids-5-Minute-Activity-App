import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { ActivityService } from '../../services/activity.service';
import { BlogService } from '../../services/blog.service';

/**
 * Admin dashboard component that provides overview of content management system
 * Shows statistics for blogs, activities, and users
 */
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  stats = {
    totalBlogs: 0,
    publishedBlogs: 0,
    totalActivities: 0,
    totalUsers: 0
  };

  /**
   * Initializes the admin dashboard component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param activityService - Activity service for content management
   * @param blogService - Blog service for content management
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _activityService: ActivityService,
    private _blogService: BlogService
  ) {}

  /**
   * Initializes component data and loads statistics
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadStats();
  }

  /**
   * Loads the current user's profile
   */
  private loadUserProfile(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => user ? this._userService.getUserProfile(user.uid) : of(null))
    );
  }

  /**
   * Loads statistics for the dashboard
   */
  private loadStats(): void {
    // Load blog statistics
    this._blogService.getBlogPosts().subscribe(blogs => {
      this.stats.totalBlogs = blogs.length;
      // For now, all blogs are considered published since the model doesn't have status
      this.stats.publishedBlogs = blogs.length;
    });

    // Load activity statistics
    this._activityService.getActivities().subscribe(activities => {
      this.stats.totalActivities = activities.length;
    });

    // TODO: Add user statistics when user service is implemented
    // For now, we'll set a placeholder value
    this.stats.totalUsers = 0;
  }

  /**
   * Navigates to the admin blogs management page
   */
  navigateToBlogs(): void {
    this._router.navigate(['/admin/blogs']);
  }

  /**
   * Navigates to the admin activities management page
   */
  navigateToActivities(): void {
    this._router.navigate(['/admin/activities']);
  }

  /**
   * Navigates to the admin users management page
   */
  navigateToUsers(): void {
    this._router.navigate(['/admin/users'])
  }

  /**
   * Navigates to the admin about page management
   */
  navigateToAbout(): void {
    this._router.navigate(['/admin/about']);
  }

  /**
   * Navigates back to the home page
   */
  navigateToHome(): void {
    this._router.navigate(['/']);
  }

  /**
   * Checks if the current user has admin privileges
   * @param userProfile - The user profile to check
   * @returns True if user is admin, false otherwise
   */
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === UserRole.ADMIN;
  }
} 