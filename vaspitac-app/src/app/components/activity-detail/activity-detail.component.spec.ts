import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../models/activity.model';
import { mockActivities } from '../../../test-utils/mock-activities';
import { FirestoreService } from '../../services/firestore.service';
import { mockFirestoreService } from '../../../test-utils/mock-firestore-service';

import { ActivityDetailComponent } from './activity-detail.component';
import { ScrollToTopComponent } from '../scroll-to-top/scroll-to-top.component';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;
  const mockActivity: Activity = mockActivities[0];

  beforeEach(waitForAsync(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), BrowserAnimationsModule, MatCardModule],
      declarations: [ActivityDetailComponent, ScrollToTopComponent],
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivityService,
          useValue: {
            getActivityById: (): Observable<Activity | undefined> => of(mockActivity),
          },
        },
        { provide: FirestoreService, useValue: mockFirestoreService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (): string => '001' }),
            snapshot: {
              queryParamMap: {
                get: (): null => null,
              },
            },
          },
        },
        {
          provide: Router,
        },
      ],
    }).compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should have activity$ observable', (done: Function): void => {
    component.activity$.subscribe((activity) => {
      expect(activity).toBeTruthy();
      expect(activity?.id).toBe('001');
      done();
    });
  });

  // UI test: should render the activity title in the DOM
  it('should render the activity title in the current language', (): void => {
    component.lang = 'sr';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title && title.textContent).toContain(mockActivity.title);
    component.lang = 'en';
    fixture.detectChanges();
    const titleEn = compiled.querySelector('h1');
    expect(titleEn).toBeTruthy();
    expect(titleEn && titleEn.textContent).toContain(mockActivity.title);
  });

  it('should show not found message if activity is missing', (): void => {
    // Simulate no activity found
    const activityService = TestBed.inject(ActivityService);
    spyOn(activityService, 'getActivityById').and.returnValue(of(undefined));
    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const _notFound = compiled.querySelector('ng-template') || compiled.textContent;
    expect(compiled.textContent).toContain('ACTIVITY.NOT_FOUND');
  });

  it('should call goBack and navigate to /activities when back button is clicked', (): void => {
    spyOn(component, 'goBack').and.callThrough();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const compiled = fixture.nativeElement;
    const backBtn = compiled.querySelector('button');
    backBtn.click();
    expect(component.goBack).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/activities'], {
      queryParams: { category: null },
    });
  });

  it('should render video link if videoUrl is present', (): void => {
    const compiled = fixture.nativeElement;
    const videoLink = compiled.querySelector('a[href="' + mockActivity.videoUrl + '"]');
    if (mockActivity.videoUrl) {
      expect(videoLink).toBeTruthy();
      expect(videoLink.textContent).toContain('ACTIVITY.PLAY_VIDEO');
    } else {
      expect(videoLink).toBeFalsy();
    }
  });

  it('should render image with correct src and alt', (): void => {
    const compiled = fixture.nativeElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe(mockActivity.imageUrl);
    expect(img.getAttribute('alt')).toBe(mockActivity.title);
  });

  it('should render materials if present', (): void => {
    const compiled = fixture.nativeElement;
    if (mockActivity.materials && mockActivity.materials.length) {
      const materials = compiled.querySelectorAll(
        'div.bg-white.shadow-sm.border.border-green-100.rounded-xl'
      )[1];
      expect(materials.textContent).toContain('ACTIVITY.MATERIALS_TITLE');
      mockActivity.materials.forEach((mat) => {
        expect(materials.textContent).toContain(mat);
      });
      expect(materials).toBeTruthy();
    } else {
      expect(true).toBeTrue(); // No materials, test passes
    }
  });

  it('should render instructions if present', (): void => {
    const compiled = fixture.nativeElement;
    if (mockActivity.instructions && mockActivity.instructions.length) {
      const instructions = compiled.querySelectorAll(
        'div.bg-white.shadow-sm.border.border-green-100.rounded-xl'
      )[2];
      expect(instructions.textContent).toContain('ACTIVITY.INSTRUCTIONS_TITLE');
      mockActivity.instructions.forEach((instr) => {
        expect(instructions.textContent).toContain(instr);
      });
      expect(instructions).toBeTruthy();
    } else {
      expect(true).toBeTrue(); // No instructions, test passes
    }
  });

  it('should render category badge with correct translation key', (): void => {
    const compiled = fixture.nativeElement;
    const badge = compiled.querySelector('span.bg-green-100.text-green-700');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain(
      'HOME.CAT_' + mockActivity.category.toUpperCase() + '_TITLE'
    );
  });
});
