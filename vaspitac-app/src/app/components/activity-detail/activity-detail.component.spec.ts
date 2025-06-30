import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { ActivityDetailComponent } from './activity-detail.component';
import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../models/activity.model';
import { ActivatedRoute } from '@angular/router';
import { mockActivitiesData } from '../../../test-utils/mock-activities';
import { of } from 'rxjs';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;
  const mockActivity: Activity = mockActivitiesData.activities[0];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule
      ],
      declarations: [ ActivityDetailComponent ],
      providers: [
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivityService,
          useValue: {
            getActivityById: () => of(mockActivity)
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '001' })
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have activity$ observable', (done) => {
    component.activity$.subscribe(activity => {
      expect(activity).toBeTruthy();
      expect(activity?.id).toBe('001');
      done();
    });
  });

  // UI test: should render the activity title in the DOM
  it('should render the activity title in the current language', () => {
    component.lang = 'sr'
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const title = compiled.querySelector('h1')
    expect(title).toBeTruthy()
    expect(title && title.textContent).toContain(mockActivity.title['sr'])
    component.lang = 'en'
    fixture.detectChanges()
    const titleEn = compiled.querySelector('h1')
    expect(titleEn).toBeTruthy()
    expect(titleEn && titleEn.textContent).toContain(mockActivity.title['en'])
  })

  it('should show not found message if activity is missing', () => {
    // Simulate no activity found
    const testBed = TestBed.inject(ActivityService) as any
    spyOn(testBed, 'getActivityById').and.returnValue(of(undefined))
    fixture = TestBed.createComponent(ActivityDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const notFound = compiled.querySelector('ng-template') || compiled.textContent
    expect(compiled.textContent).toContain('ACTIVITY.NOT_FOUND')
  })
}); 