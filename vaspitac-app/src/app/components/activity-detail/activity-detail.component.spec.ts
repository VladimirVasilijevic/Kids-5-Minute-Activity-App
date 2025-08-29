import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ActivityDetailComponent } from './activity-detail.component';
import { ActivityService } from '../../services/activity.service';
import { mockActivities } from '../../../test-utils/mock-activities';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;
  let activityService: jasmine.SpyObj<ActivityService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  beforeEach(async (): Promise<void> => {
    const activityServiceSpy = jasmine.createSpyObj('ActivityService', ['getActivities']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      paramMap: of({ get: (_key: string): string => '001' }),
      snapshot: { queryParamMap: { get: (_key: string): string | null => null } },
    };

    await TestBed.configureTestingModule({
      declarations: [ActivityDetailComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ActivityService, useValue: activityServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    activityService = TestBed.inject(ActivityService) as jasmine.SpyObj<ActivityService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle activity not found', (done: any): void => {
    activatedRoute.paramMap = of({ get: (_key: string) => '999' });
    activityService.getActivities.and.returnValue(of(mockActivities));
    fixture.detectChanges();
    component.activity$?.subscribe(activity => {
      expect(activity).toBeUndefined();
      done();
    });
  });

  it('should navigate back to the activities list', () => {
    spyOn(window, 'scrollTo');
    router.navigate.and.resolveTo(true);
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: null } });
  });

  it('should navigate back with a category if it exists in the query params', () => {
    spyOn(window, 'scrollTo');
    activatedRoute.snapshot.queryParamMap.get = (_key: string): string => 'physical';
    router.navigate.and.resolveTo(true);
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: 'physical' } });
  });
});
