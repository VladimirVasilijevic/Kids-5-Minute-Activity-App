import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { BlogService } from '../../services/blog.service';
import { AdminBlogPost } from '../../models/admin-blog-post.model';
import { ImageUploadService } from '../../services/image-upload.service';
import { LanguageService } from '../../services/language.service';

/**
 * Admin blogs component for managing blog posts
 * Provides CRUD operations for blog posts
 */
@Component({
  selector: 'app-admin-blogs',
  templateUrl: './admin-blogs.component.html',
  styleUrls: ['./admin-blogs.component.scss']
})
export class AdminBlogsComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  blogs: AdminBlogPost[] = [];
  filteredBlogs: AdminBlogPost[] = [];
  showForm = false;
  editingBlog: AdminBlogPost | null = null;
  currentLanguage = 'sr';
  availableLanguages = ['sr', 'en'];

  // Error handling
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';

  // Success handling
  showSuccessMessage = false;
  successMessage = '';

  // Confirmation modal state
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  // Infinite scroll
  displayedBlogs: AdminBlogPost[] = [];
  itemsPerPage = 20;
  currentIndex = 0;
  isLoadingMore = false;
  hasMoreItems = true;

  // Form validation
  formErrors: { [key: string]: string } = {};

  // Image upload
  isUploadingImage = false;
  imagePreview: string | null = null;

  formData = {
    title: '',
    excerpt: '',
    fullContent: '',
    author: '',
    readTime: '',
    imageUrl: ''
  };

  /**
   * Initializes the admin blogs component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param blogService - Blog service for content management
   * @param languageService - Language service for internationalization
   * @param imageUploadService - Service for image upload functionality
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _blogService: BlogService,
    private _languageService: LanguageService,
    private _imageUploadService: ImageUploadService
  ) {}

  /**
   * Initializes component data and loads blogs
   */
  ngOnInit(): void {
    this.loadUserProfile();
    this.loadCurrentLanguage();
    this.loadBlogs();
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
   * Loads the current language setting
   */
  private loadCurrentLanguage(): void {
    this.currentLanguage = this._languageService.getCurrentLanguage();
  }

  /**
   * Loads blogs from the service
   */
  private loadBlogs(): void {
    this._blogService.getBlogPosts().subscribe(blogs => {
      this.blogs = blogs.map(blog => ({
        ...blog,
        isEditing: false,
        isDeleting: false
      }));
      this.initializeInfiniteScroll();
    });
  }

  /**
   * Handles form submission for creating or editing blogs
   * @param event - Form submission event
   */
  handleSubmit(event: globalThis.Event): void {
    event.preventDefault();
    
    // Validate form before submission
    if (!this.validateForm()) {
      return;
    }
    
    if (this.editingBlog) {
      this.updateBlog();
    } else {
      this.createBlog();
    }
  }

  /**
   * Validates the form data
   * @returns True if form is valid, false otherwise
   */
  private validateForm(): boolean {
    this.formErrors = {};
    
    if (!this.formData.title.trim()) {
      this.formErrors['title'] = 'Title is required';
    }
    
    if (!this.formData.excerpt.trim()) {
      this.formErrors['excerpt'] = 'Excerpt is required';
    }
    
    if (!this.formData.fullContent.trim()) {
      this.formErrors['fullContent'] = 'Content is required';
    }
    
    if (!this.formData.author.trim()) {
      this.formErrors['author'] = 'Author is required';
    }
    
    if (!this.formData.readTime.trim()) {
      this.formErrors['readTime'] = 'Read time is required';
    }
    
    return Object.keys(this.formErrors).length === 0;
  }

  /**
   * Initializes infinite scroll data
   */
  private initializeInfiniteScroll(): void {
    this.displayedBlogs = [];
    this.currentIndex = 0;
    this.hasMoreItems = true;
    this.loadMoreItems();
  }

  /**
   * Loads more items for infinite scroll
   */
  loadMoreItems(): void {
    if (this.isLoadingMore || !this.hasMoreItems) return;
    
    this.isLoadingMore = true;
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const endIndex = Math.min(this.currentIndex + this.itemsPerPage, this.blogs.length);
      const newItems = this.blogs.slice(this.currentIndex, endIndex);
      
      this.displayedBlogs.push(...newItems);
      this.currentIndex = endIndex;
      this.hasMoreItems = this.currentIndex < this.blogs.length;
      this.isLoadingMore = false;
    }, 300);
  }

  /**
   * Handles scroll event for infinite scroll
   * @param event - Scroll event
   */
  onScroll(event: globalThis.Event): void {
    const element = event.target as globalThis.HTMLInputElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Load more when user is near the bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      this.loadMoreItems();
    }
  }

  /**
   * Changes the language context
   * @param language - Language code to switch to
   */
  changeLanguage(language: string): void {
    this._languageService.setLanguage(language);
    this.currentLanguage = language;
    this.loadBlogs();
  }

  /**
   * Shows error modal with specified message
   * @param title - Error title
   * @param message - Error message
   */
  private showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  /**
   * Shows success message
   * @param message - Success message
   */
  private showSuccess(message: string): void {
    console.log('Showing success message:', message); // Debug log
    this.successMessage = message;
    this.showSuccessMessage = true;
    
    // Auto-hide success message after 5 seconds (increased for better visibility)
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }

  /**
   * Closes the error modal
   */
  closeErrorModal(): void {
    this.showErrorModal = false;
  }

  /**
   * Closes the confirmation modal
   */
  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmTitle = '';
    this.confirmMessage = '';
    this.confirmAction = null;
  }

  /**
   * Handles confirmation action
   */
  onConfirmAction(): void {
    if (this.confirmAction) {
      this.confirmAction();
    }
    this.closeConfirmModal();
  }

  /**
   * Handles file selection for image upload
   * @param event - File input change event
   */
  onImageSelected(event: globalThis.Event): void {
    const input = event.target as globalThis.HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    if (!this._imageUploadService.isValidImage(file)) {
      this.showError('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
      return;
    }
    
    this.uploadImage(file);
  }

  /**
   * Uploads an image to Firebase Storage
   * @param file - The image file to upload
   */
  private uploadImage(file: globalThis.File): void {
    this.isUploadingImage = true;
    
    this._imageUploadService.uploadImage(file, 'blog-images/').subscribe({
      next: (downloadUrl) => {
        this.formData.imageUrl = downloadUrl;
        this.imagePreview = downloadUrl;
        this.isUploadingImage = false;
      },
      error: (error: Error) => {
        console.error('Error uploading image:', error);
        this.isUploadingImage = false;
        
        // Show specific error message based on error type
        let errorMessage = 'Failed to upload image. Please try again.';
        if (error.message) {
          errorMessage = error.message;
        }
        
        this.showError('Upload Error', errorMessage);
      }
    });
  }

  /**
   * Handles drag over event for image upload
   * @param event - Drag over event
   */
  onDragOver(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles drop event for image upload
   * @param event - Drop event
   */
  onDrop(event: globalThis.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!this._imageUploadService.isValidImage(file)) {
      this.showError('Invalid Image', 'Please select a valid image file (JPEG, PNG, GIF, WebP) under 5MB.');
      return;
    }
    
    this.uploadImage(file);
  }

  /**
   * Removes the current image
   */
  removeImage(): void {
    this.formData.imageUrl = '';
    this.imagePreview = null;
  }

  /**
   * Creates a new blog post
   */
  private createBlog(): void {
    const newBlog: AdminBlogPost = {
      id: Date.now(),
      title: this.formData.title,
      excerpt: this.formData.excerpt,
      fullContent: this.formData.fullContent,
      author: this.formData.author,
      readTime: this.formData.readTime,
      date: new Date().toISOString(),
      imageUrl: this.formData.imageUrl,
      isEditing: false,
      isDeleting: false
    };

    // Create blog post in service
    this._blogService.createBlogPost(newBlog).then(() => {
      // Add to local array after successful creation
      this.blogs.push(newBlog);
      this.initializeInfiniteScroll();
      this.resetForm();
      this.showSuccess('Blog post created successfully!');
    }).catch((error: Error) => {
      console.error('Error creating blog post:', error);
      this.showError('Create Error', 'Failed to create blog post. Please try again.');
    });
  }

  /**
   * Updates an existing blog post
   */
  private updateBlog(): void {
    if (!this.editingBlog) return;

    const updatedBlog: AdminBlogPost = {
      ...this.editingBlog,
      title: this.formData.title,
      excerpt: this.formData.excerpt,
      fullContent: this.formData.fullContent,
      author: this.formData.author,
      readTime: this.formData.readTime,
      imageUrl: this.formData.imageUrl
    };

    // Update blog post in service
    this._blogService.updateBlogPost(updatedBlog).then(() => {
      console.log('Blog update successful, showing success message'); // Debug log
      // Update local array after successful update
      const index = this.blogs.findIndex(b => b.id === this.editingBlog?.id);
      if (index !== -1) {
        this.blogs[index] = { ...updatedBlog, isEditing: false, isDeleting: false };
      }
      this.initializeInfiniteScroll();
      this.resetForm();
      this.showSuccess('Blog post updated successfully!');
    }).catch((error: Error) => {
      console.error('Error updating blog post:', error);
      this.showError('Update Error', 'Failed to update blog post. Please try again.');
    });
  }

  /**
   * Resets the form and editing state
   */
  resetForm(): void {
    this.formData = {
      title: '',
      excerpt: '',
      fullContent: '',
      author: '',
      readTime: '',
      imageUrl: ''
    };
    this.editingBlog = null;
    this.imagePreview = null; // Clear image preview
    this.showForm = false;
  }

  /**
   * Handles editing a blog post
   * @param blog - The blog post to edit
   */
  handleEdit(blog: AdminBlogPost): void {
    this.editingBlog = blog;
    this.formData = {
      title: blog.title,
      excerpt: blog.excerpt,
      fullContent: blog.fullContent,
      author: blog.author,
      readTime: blog.readTime,
      imageUrl: blog.imageUrl
    };
    this.imagePreview = blog.imageUrl; // Set image preview for editing
    this.showForm = true;
  }

  /**
   * Handles deleting a blog post
   * @param blog - The blog post to delete
   */
  handleDelete(blog: AdminBlogPost): void {
    this.confirmTitle = 'Delete Blog Post';
    this.confirmMessage = `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`;
    this.confirmAction = (): void => {
      // Delete blog post from service
      this._blogService.deleteBlogPost(blog.id).then(() => {
        // Remove from local array after successful deletion
        this.blogs = this.blogs.filter(b => b.id !== blog.id);
        this.initializeInfiniteScroll();
        this.showSuccess('Blog post deleted successfully!');
      }).catch((error: Error) => {
        console.error('Error deleting blog post:', error);
        this.showError('Delete Error', 'Failed to delete blog post. Please try again.');
      });
    };
    this.showConfirmModal = true;
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
    return userProfile?.role === UserRole.ADMIN;
  }

  /**
   * Formats the publication date for display
   * @param dateString - The date string to format
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }


} 