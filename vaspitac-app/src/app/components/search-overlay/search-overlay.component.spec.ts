import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { SearchOverlayComponent } from './search-overlay.component';
import { mockActivities } from '../../../test-utils/mock-activities';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';

describe('SearchOverlayComponent', () => {
  let component: SearchOverlayComponent;
  let fixture: ComponentFixture<SearchOverlayComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      declarations: [ SearchOverlayComponent ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateSpy }
      ]
    })
    .compileComponents();

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchOverlayComponent);
    component = fixture.componentInstance;
    component.activities = mockActivities;
    component.blogPosts = mockBlogPosts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter activities when search term is entered', () => {
    component.searchTerm = 'Yoga';
    component.onSearchChange();
    expect(component.filteredActivities.length).toBe(1);
    expect(component.filteredActivities[0].title).toBe('Yoga for Kids');
  });

  it('should filter blog posts when search term is entered', () => {
    component.searchTerm = 'Motivate';
    component.onSearchChange();
    expect(component.filteredBlogs.length).toBe(1);
    expect(component.filteredBlogs[0].title).toBe('How to Motivate Kids');
  });

  it('should clear results when search term is empty', () => {
    component.searchTerm = '';
    component.onSearchChange();
    expect(component.filteredActivities.length).toBe(0);
    expect(component.filteredBlogs.length).toBe(0);
  });

  it('should navigate to activity detail when activity is clicked', () => {
    component.onActivityClick('1');
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/activity', '1']);
  });

  it('should navigate to blog when blog is clicked', () => {
    component.onBlogClick(1);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog'], { queryParams: { post: 1 } });
  });

  it('should emit close event when closeOverlay is called', () => {
    spyOn(component.close, 'emit');
    
    component.closeOverlay();
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should close overlay when backdrop is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    };
    mockEvent.target = mockEvent.currentTarget;
    
    component.onBackdropClick(mockEvent as { target: unknown; currentTarget: unknown });
    
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should not close overlay when content is clicked', () => {
    spyOn(component.close, 'emit');
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    };
    // Different elements
    mockEvent.target = document.createElement('div');
    
    component.onBackdropClick(mockEvent as { target: unknown; currentTarget: unknown });
    
    expect(component.close.emit).not.toHaveBeenCalled();
  });
}); 