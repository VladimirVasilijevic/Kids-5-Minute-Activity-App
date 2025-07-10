import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';
import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../models/activity.model';

/**
 * Interface for admin activity with additional management properties
 */
interface AdminActivity extends Activity {
  /** Whether the activity is being edited */
  isEditing?: boolean;
  /** Whether the activity is being deleted */
  isDeleting?: boolean;
  /** ISO string of creation date (optional) */
  createdAt?: string;
}

/**
 * Admin activities component for managing craft activities and tutorials
 * Provides CRUD operations for activities
 */
@Component({
  selector: 'app-admin-activities',
  templateUrl: './admin-activities.component.html',
  styleUrls: ['./admin-activities.component.scss']
})
export class AdminActivitiesComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  activities: AdminActivity[] = [];
  showForm = false;
  editingActivity: AdminActivity | null = null;
  formData = {
    title: '',
    description: '',
    ageGroup: '',
    duration: '30',
    instructions: '',
    image: ''
  };

  /** Available age groups for activities */
  ageGroups = [
    'Toddler (1-2 years)',
    'Preschool (3-5 years)',
    'School Age (6-12 years)',
    'Teen (13+ years)',
    'All Ages'
  ];

  /**
   * Initializes the admin activities component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param activityService - Activity service for content management
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _activityService: ActivityService
  ) {}

  /**
   * Initializes component data and loads activities
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadActivities();
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
   * Loads activities from the service
   */
  private loadActivities(): void {
    this._activityService.getActivities().subscribe(activities => {
      this.activities = activities.map(activity => ({
        ...activity,
        isEditing: false,
        isDeleting: false
      }));
    });
  }

  /**
   * Handles form submission for creating or editing activities
   * @param event - Form submission event
   */
  handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.editingActivity) {
      this.updateActivity();
    } else {
      this.createActivity();
    }
  }

  /**
   * Creates a new activity
   */
  private createActivity(): void {
    const newActivity: AdminActivity = {
      id: Date.now().toString(),
      title: this.formData.title,
      description: this.formData.description,
      ageGroup: this.formData.ageGroup,
      duration: this.formData.duration,
      instructions: this.formData.instructions ? [this.formData.instructions] : [],
      imageUrl: this.formData.image || '',
      category: 'general', // Default category
      isEditing: false,
      isDeleting: false,
      createdAt: new Date().toISOString()
    };

    // TODO: Implement activity creation in service
    this.activities.push(newActivity);
    this.resetForm();
  }

  /**
   * Updates an existing activity
   */
  private updateActivity(): void {
    if (!this.editingActivity) return;

    const updatedActivity: AdminActivity = {
      ...this.editingActivity,
      title: this.formData.title,
      description: this.formData.description,
      ageGroup: this.formData.ageGroup,
      duration: this.formData.duration,
      instructions: this.formData.instructions ? [this.formData.instructions] : [],
      imageUrl: this.formData.image || ''
    };

    // TODO: Implement activity update in service
    const index = this.activities.findIndex(a => a.id === this.editingActivity?.id);
    if (index !== -1) {
      this.activities[index] = updatedActivity;
    }

    this.resetForm();
  }

  /**
   * Resets the form and editing state
   */
  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      ageGroup: '',
      duration: '30',
      instructions: '',
      image: ''
    };
    this.editingActivity = null;
    this.showForm = false;
  }

  /**
   * Handles editing an activity
   * @param activity - The activity to edit
   */
  handleEdit(activity: AdminActivity): void {
    this.editingActivity = activity;
    this.formData = {
      title: activity.title,
      description: activity.description,
      ageGroup: activity.ageGroup || '',
      duration: activity.duration,
      instructions: activity.instructions ? activity.instructions.join('\n') : '',
      image: activity.imageUrl || ''
    };
    this.showForm = true;
  }

  /**
   * Handles deleting an activity
   * @param activity - The activity to delete
   */
  handleDelete(activity: AdminActivity): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      // TODO: Implement activity deletion in service
      this.activities = this.activities.filter(a => a.id !== activity.id);
    }
  }

  /**
   * Navigates back to the admin dashboard
   */
  navigateToAdmin(): void {
    this._router.navigate(['/admin']);
  }

  /**
   * Checks if the current user has admin privileges
   * @param userProfile - The user profile to check
   * @returns True if user is admin, false otherwise
   */
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.role === 'admin';
  }

  /**
   * Formats the creation date for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 