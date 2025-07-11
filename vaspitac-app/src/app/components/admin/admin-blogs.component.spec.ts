import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AdminBlogsComponent } from './admin-blogs.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { BlogService } from '../../services/blog.service';
import { AdminBlogPost } from '../../models/admin-blog-post.model';
import { mockAdminUser, mockSubscriber } from '../../../test-utils/mock-user-profiles';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';
import { ImageUploadService } from '../../services/image-upload.service';

describe('AdminBlogsComponent', (): void => {
  let component: AdminBlogsComponent;
  let fixture: ComponentFixture<AdminBlogsComponent>;
  let router: Router;
  let _authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let blogService: jasmine.SpyObj<BlogService>;
  let _translate: TranslateService;

  const mockUserProfile = mockAdminUser;

  const mockAdminBlogPosts: AdminBlogPost[] = mockBlogPosts.map(blog => ({
    ...blog,
    isEditing: false,
    isDeleting: false,
    status: 'published' as const
  }));

  const mockImageUploadService = {
    isValidImage: (): boolean => true,
    uploadImage: (): any => of('mock-url')
  };

  beforeEach(waitForAsync(async (): Promise<void> => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      user$: of({ uid: mockAdminUser.uid })
    });
    const userSpy = jasmine.createSpyObj('UserService', ['getUserProfile']);
    const blogSpy = jasmine.createSpyObj('BlogService', [
      'getBlogPosts',
      'createBlogPost',
      'updateBlogPost',
      'deleteBlogPost'
    ]);
    blogSpy.getBlogPosts.and.returnValue(of(mockBlogPosts));
    blogSpy.createBlogPost.and.returnValue(Promise.resolve());
    blogSpy.updateBlogPost.and.returnValue(Promise.resolve());
    blogSpy.deleteBlogPost.and.returnValue(Promise.resolve());
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    userSpy.getUserProfile.and.returnValue(of(mockUserProfile));

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdminBlogsComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userSpy },
        { provide: BlogService, useValue: blogSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        provideHttpClientTesting(),
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    _authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    blogService = TestBed.inject(BlogService) as jasmine.SpyObj<BlogService>;
    router = TestBed.inject(Router);
    _translate = TestBed.inject(TranslateService);
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(AdminBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', (): void => {
    expect(userService.getUserProfile).toHaveBeenCalledWith(mockAdminUser.uid);
  });

  it('should load blogs on init', (): void => {
    expect(blogService.getBlogPosts).toHaveBeenCalled();
  });

  it('should transform blog posts to admin blog posts', (): void => {
    expect(component.blogs.length).toBe(3);
    expect(component.blogs[0]).toEqual(jasmine.objectContaining({
      ...mockBlogPosts[0],
      isEditing: false,
      isDeleting: false
    }));
  });

  it('should identify admin users correctly', (): void => {
    expect(component.isAdmin(mockUserProfile)).toBe(true);
    
    expect(component.isAdmin(mockSubscriber)).toBe(false);
  });

  it('should return false for null user profile', (): void => {
    expect(component.isAdmin(null)).toBe(false);
  });

  it('should navigate to admin dashboard', (): void => {
    component.navigateToAdmin();
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show form when creating new blog', (): void => {
    component.showForm = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const form = compiled.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should handle form submission for creating blog', fakeAsync((): void => {
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    
    component.formData = {
      title: 'New Blog',
      excerpt: 'New Excerpt',
      fullContent: 'New Content',
      author: 'New Author',
      readTime: '10 min',
      imageUrl: 'new-blog.jpg'
    };
    
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(event.preventDefault).toHaveBeenCalled();
    // Find by title instead of relying on array index
    const newBlog = component.blogs.find(b => b.title === 'New Blog');
    expect(component.blogs.length).toBe(4); // 3 original + 1 new
    expect(newBlog).toBeTruthy();
    if (newBlog) {
      expect(newBlog.title).toBe('New Blog');
    }
    
    discardPeriodicTasks();
  }));

  it('should handle form submission for editing blog', fakeAsync((): void => {
    const event = new globalThis.Event('submit');
    spyOn(event, 'preventDefault');
    
    component.editingBlog = mockAdminBlogPosts[0];
    component.formData = {
      title: 'Updated Blog',
      excerpt: 'Updated Excerpt',
      fullContent: 'Updated Content',
      author: 'Updated Author',
      readTime: '15 min',
      imageUrl: 'updated-blog.jpg'
    };
    
    component.handleSubmit(event);
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(event.preventDefault).toHaveBeenCalled();
    // Find by id to ensure correct blog is updated
    const updated = component.blogs.find(b => b.id === mockAdminBlogPosts[0].id);
    expect(updated).toBeTruthy();
    if (updated) {
      expect(updated.title).toBe('Updated Blog');
    }
    
    discardPeriodicTasks();
  }));

  it('should handle edit blog', (): void => {
    const blogToEdit = mockAdminBlogPosts[0];
    
    component.handleEdit(blogToEdit);
    
    expect(component.editingBlog).toBe(blogToEdit);
    expect(component.showForm).toBe(true);
    expect(component.formData.title).toBe(blogToEdit.title);
  });

  it('should handle delete blog', fakeAsync((): void => {
    const blogToDelete = mockAdminBlogPosts[0];
    const initialLength = component.blogs.length;
    
    // Call handleDelete to set up the confirmation modal
    component.handleDelete(blogToDelete);
    
    // Verify the confirmation modal is shown
    expect(component.showConfirmModal).toBe(true);
    expect(component.confirmAction).toBeTruthy();
    
    // Execute the confirmation action
    component.onConfirmAction();
    tick(); // Wait for async operations
    flush(); // Flush any remaining timers
    
    expect(component.blogs.length).toBe(initialLength - 1);
    expect(component.blogs.find(b => b.id === blogToDelete.id)).toBeUndefined();
    
    discardPeriodicTasks();
  }));

  it('should not delete blog when confirmation modal is cancelled', fakeAsync((): void => {
    const blogToDelete = mockAdminBlogPosts[0];
    const initialLength = component.blogs.length;
    
    // Call handleDelete to set up the confirmation modal
    component.handleDelete(blogToDelete);
    
    // Verify the confirmation modal is shown
    expect(component.showConfirmModal).toBe(true);
    
    // Close the modal without confirming
    component.closeConfirmModal();
    
    expect(component.blogs.length).toBe(initialLength);
    expect(component.showConfirmModal).toBe(false);
    
    discardPeriodicTasks();
  }));

  it('should reset form after submission', (): void => {
    component.formData = {
      title: 'Test',
      excerpt: 'Test',
      fullContent: 'Test',
      author: 'Test',
      readTime: '5 min',
      imageUrl: 'test.jpg'
    };
    component.editingBlog = mockAdminBlogPosts[0];
    component.showForm = true;
    
    component.resetForm();
    
    expect(component.formData.title).toBe('');
    expect(component.editingBlog).toBeNull();
    expect(component.showForm).toBe(false);
  });



  it('should format date correctly', (): void => {
    const dateString = '2024-01-01';
    const formatted = component.formatDate(dateString);
    
    expect(formatted).toBe(new Date(dateString).toLocaleDateString());
  });

  it('should render blog list', (): void => {
    const compiled = fixture.nativeElement;
    const blogTable = compiled.querySelector('table');
    expect(blogTable).toBeTruthy();
  });

  it('should render admin blogs title', (): void => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
  });
}); 