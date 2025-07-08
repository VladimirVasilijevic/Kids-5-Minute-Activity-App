/**
 * ProfileComponent displays and manages user profile information.
 * Allows users to view and edit their profile details.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../models/user-profile.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  isLoading = true;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService
  ) {}

  ngOnInit(): void {
    this.userProfile$ = this._auth.user$.pipe(
      switchMap(user => {
        if (user) {
          return this._userService.getUserProfile(user.uid);
        } else {
          // Redirect to home if not logged in
          this._router.navigate(['/']);
          return of(null);
        }
      })
    );
    
    this.userProfile$.subscribe(() => {
      this.isLoading = false;
    });
  }

  /** Navigate back to home */
  goBack(): void {
    this._router.navigate(['/']);
  }

  /** Handle logout */
  onLogout(): void {
    this._auth.signOut();
    this._router.navigate(['/']);
  }
} 