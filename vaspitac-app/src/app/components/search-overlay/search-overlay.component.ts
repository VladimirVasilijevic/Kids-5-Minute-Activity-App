import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Activity } from '../../models/activity.model';
import { BlogPost } from '../../models/blog-post.model';



@Component({
  selector: 'app-search-overlay',
  templateUrl: './search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss']
})
export class SearchOverlayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() activities: Activity[] = [];
  @Input() blogPosts: BlogPost[] = [];
  
  @Output() close = new EventEmitter<void>();

  searchTerm = '';
  filteredActivities: Activity[] = [];
  filteredBlogs: BlogPost[] = [];

  constructor(
    private _router: Router,
    private _translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.setupBodyScroll();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.setupBodyScroll();
      } else {
        this.restoreBodyScroll();
        this.searchTerm = '';
      }
    }
  }

  private setupBodyScroll(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = 'unset';
  }

  /**
   * Handles search input changes and triggers result filtering
   */
  onSearchChange(): void {
    this.filterResults();
  }

  private filterResults(): void {
    if (!this.searchTerm.trim()) {
      this.filteredActivities = [];
      this.filteredBlogs = [];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();

    // Filter activities
    this.filteredActivities = this.activities.filter(activity =>
      activity.title.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      activity.category.toLowerCase().includes(searchLower)
    );

    // Filter blog posts
    this.filteredBlogs = this.blogPosts.filter(blog =>
      blog.title.toLowerCase().includes(searchLower) ||
      blog.excerpt.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Navigates to activity detail page and closes the search overlay
   * @param activityId - The unique identifier of the activity
   */
  onActivityClick(activityId: string): void {
    this._router.navigate(['/activity', activityId]);
    this.closeOverlay();
  }

  /**
   * Navigates to blog post page and closes the search overlay
   * @param blogId - The unique identifier of the blog post
   */
  onBlogClick(blogId: number): void {
    this._router.navigate(['/blog', blogId]);
    this.closeOverlay();
  }

  /**
   * Emits close event to parent component
   */
  closeOverlay(): void {
    this.close.emit();
  }

  /**
   * Handles backdrop click to close the overlay
   * @param event - The click event
   */
  onBackdropClick(event: { target: unknown; currentTarget: unknown }): void {
    if (event.target === event.currentTarget) {
      this.closeOverlay();
    }
  }
} 