import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Firebase imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Translation imports
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../environments/environment';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ActivityListComponent } from './components/activity-list/activity-list.component';
import { ActivityDetailComponent } from './components/activity-detail/activity-detail.component';
import { ShopComponent } from './components/shop/shop.component';
import { AboutComponent } from './components/about/about.component';
import { BlogComponent } from './components/blog/blog.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { TipsComponent } from './components/tips/tips.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { SearchOverlayComponent } from './components/search-overlay/search-overlay.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { EditProfileModalComponent } from './components/profile/edit-profile-modal.component';
import { ResetPasswordModalComponent } from './components/auth-modal/reset-password-modal.component';
import { ErrorModalComponent } from './components/shared/error-modal.component';
import { ConfirmationModalComponent } from './components/shared/confirmation-modal.component';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { SplashDemoComponent } from './components/splash-demo/splash-demo.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminActivitiesComponent } from './components/admin/admin-activities.component';
import { AdminBlogsComponent } from './components/admin/admin-blogs.component';
import { AdminAboutComponent } from './components/admin/admin-about.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { SubscribeComponent } from './components/subscribe/subscribe.component';

// AoT requires an exported function for factories
/**
 * Factory function for creating the HTTP loader for translations
 * @param http - HTTP client for loading translation files
 * @returns TranslateHttpLoader instance
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Main application module
 */
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ActivityListComponent,
    ActivityDetailComponent,
    ShopComponent,
    AboutComponent,
    BlogComponent,
    BlogDetailComponent,
    TipsComponent,
    ScrollToTopComponent,
    SearchOverlayComponent,
    AuthModalComponent,
    ProfileCardComponent,
    ProfileComponent,
    UserCardComponent,
    EditProfileModalComponent,
    ResetPasswordModalComponent,
    ErrorModalComponent,
    ConfirmationModalComponent,
    SplashScreenComponent,
    SplashDemoComponent,
    AdminDashboardComponent,
    AdminActivitiesComponent,
    AdminBlogsComponent,
    AdminAboutComponent,
    AdminUsersComponent,
    BackButtonComponent,
    SubscribeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'activities', component: ActivityListComponent },
      { path: 'activity/:id', component: ActivityDetailComponent },
      { path: 'shop', component: ShopComponent },
      { path: 'about', component: AboutComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'blog/:id', component: BlogDetailComponent },
      { path: 'tips', component: TipsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'splash-demo', component: SplashDemoComponent },
      { path: 'admin', component: AdminDashboardComponent },
      { path: 'admin/activities', component: AdminActivitiesComponent },
      { path: 'admin/blogs', component: AdminBlogsComponent },
      { path: 'admin/about', component: AdminAboutComponent },
      { path: 'admin/users', component: AdminUsersComponent },
      { path: 'subscribe', component: SubscribeComponent },
      { path: '**', redirectTo: '' },
    ]),
    TranslateModule.forRoot({
      defaultLanguage: 'sr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // Firebase modules
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    // Angular Material modules
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatBottomSheetModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
