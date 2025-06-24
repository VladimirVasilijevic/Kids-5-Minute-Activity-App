import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';

import { ActivityListComponent } from './activity-list.component';
import { ActivityService } from '../../services/activity.service';
import { mockActivitiesData } from '../../../test-utils/mock-activities';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;
  const mockActivities = mockActivitiesData.activities;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        RouterModule
      ],
      declarations: [ ActivityListComponent ],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            getActivities: () => of(mockActivities)
          }
        },
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have activities$ observable', (done) => {
    component.activities$.subscribe(activities => {
      expect(Array.isArray(activities)).toBeTruthy();
      expect(activities.length).toBe(mockActivities.length);
      done();
    });
  });

  it('should display activity cards', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const activityCards = compiled.querySelectorAll('.activity-card');
    expect(activityCards.length).toBe(mockActivities.length);
  });

  it('should display activity titles', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockActivities[0].title['sr']);
  });

  it('should have router links for activities', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const activityCards = compiled.querySelectorAll('.activity-card');
    activityCards.forEach((card: any, index: number) => {
      const routerLink = card.getAttribute('ng-reflect-router-link');
      expect(routerLink).toContain('/activity');
      expect(routerLink).toContain(mockActivities[index].id);
    });
  });
}); 