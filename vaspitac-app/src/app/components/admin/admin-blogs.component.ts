import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserProfile, UserRole } from '../../models/user-profile.model';
import { BlogService } from '../../services/blog.service';
import { AdminBlogPost } from '../../models/admin-blog-post.model';

/**
 * Admin blogs component for managing blog posts
 * Provides CRUD operations for blog content
 */
@Component({
  selector: 'app-admin-blogs',
  templateUrl: './admin-blogs.component.html',
  styleUrls: ['./admin-blogs.component.scss']
})
export class AdminBlogsComponent implements OnInit {
  userProfile$: Observable<UserProfile | null> = of(null);
  blogs: AdminBlogPost[] = [];
  showForm = false;
  editingBlog: AdminBlogPost | null = null;
  formData = {
    title: '',
    excerpt: '',
    fullContent: '',
    author: '',
    readTime: '',
    imageUrl: '',
    status: 'draft' as 'published' | 'draft'
  };

  /**
   * Initializes the admin blogs component
   * @param router - Angular router for navigation
   * @param auth - Authentication service
   * @param userService - User service for profile management
   * @param blogService - Blog service for content management
   */
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserService,
    private _blogService: BlogService
  ) {}

  /**
   * Initializes component data and loads blogs
   */
  ngOnInit(): void {
    this.loadUserProfile();
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
   * Loads blogs from the service
   */
  private loadBlogs(): void {
    this._blogService.getBlogPosts().subscribe(blogs => {
      this.blogs = blogs.map(blog => ({
        ...blog,
        isEditing: false,
        isDeleting: false,
        status: 'published' // Default status since model doesn't have it
      }));
    });
  }

  /**
   * Handles form submission for creating or editing blogs
   * @param event - Form submission event
   */
  handleSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.editingBlog) {
      this.updateBlog();
    } else {
      this.createBlog();
    }
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
      status: this.formData.status,
      isEditing: false,
      isDeleting: false
    };

    // TODO: Implement blog creation in service
    this.blogs.push(newBlog);
    this.resetForm();
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
      imageUrl: this.formData.imageUrl,
      status: this.formData.status
    };

    // TODO: Implement blog update in service
    const index = this.blogs.findIndex(b => b.id === this.editingBlog?.id);
    if (index !== -1) {
      this.blogs[index] = updatedBlog;
    }

    this.resetForm();
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
      imageUrl: '',
      status: 'draft'
    };
    this.editingBlog = null;
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
      imageUrl: blog.imageUrl,
      status: blog.status || 'draft'
    };
    this.showForm = true;
  }

  /**
   * Handles deleting a blog post
   * @param blog - The blog post to delete
   */
  handleDelete(blog: AdminBlogPost): void {
    if (confirm('Are you sure you want to delete this blog post?')) {
      // TODO: Implement blog deletion in service
      this.blogs = this.blogs.filter(b => b.id !== blog.id);
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

  /**
   * Publishes a blog post
   * @param blog - The blog post to publish
   */
  publishBlog(blog: AdminBlogPost): void {
    blog.status = 'published';
    // TODO: Implement blog publishing in service
  }

  /**
   * Unpublishes a blog post
   * @param blog - The blog post to unpublish
   */
  unpublishBlog(blog: AdminBlogPost): void {
    blog.status = 'draft';
    // TODO: Implement blog unpublishing in service
  }
} 