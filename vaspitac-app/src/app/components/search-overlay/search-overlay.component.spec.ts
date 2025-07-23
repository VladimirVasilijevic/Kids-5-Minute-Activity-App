import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

import { SearchOverlayComponent } from './search-overlay.component';
import { mockActivities } from '../../../test-utils/mock-activities';
import { mockBlogPosts } from '../../../test-utils/mock-blog-posts';

describe('SearchOverlayComponent', () => {
  let component: SearchOverlayComponent;
  let fixture: ComponentFixture<SearchOverlayComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const translateSpy = {
      instant: (key: string) => key,
      get: (key: string) => of(key),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [ SearchOverlayComponent ],
      imports: [FormsModule, TranslateModule.forRoot()],
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
    component.searchTerm = 'Play';
    component.onSearchChange();
    expect(component.filteredBlogs.length).toBe(1);
    expect(component.filteredBlogs[0].title).toBe('The Importance of Play in Early Childhood');
  });

  it('should clear results when search term is empty', () => {
    component.searchTerm = '';
    component.onSearchChange();
    expect(component.filteredActivities.length).toBe(0);
    expect(component.filteredBlogs.length).toBe(0);
  });

  it('should navigate to activity on result click', () => {
    const activityId = '001';
    component.onActivityClick(activityId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/activity', activityId]);
  });

  it('should navigate to blog on result click', () => {
    const blogId = 1;
    component.onBlogClick(blogId);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/blog'], { queryParams: { post: 1 } });
  });

  it('should emit close event', () => {
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