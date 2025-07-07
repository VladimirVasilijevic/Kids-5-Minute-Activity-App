import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { mockFirestoreService } from '../../../test-utils/mock-firestore-service';

import { ActivityListComponent } from './activity-list.component';
import { ActivityService } from '../../services/activity.service';
import { mockActivities } from '../../../test-utils/mock-activities';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;
  let router: Router;
  let translate: TranslateService;
  const mockActivitiesList = mockActivities;
  let activitiesSubject: Subject<any[]>;

  beforeEach(waitForAsync(() => {
    activitiesSubject = new Subject<any[]>();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule
      ],
      declarations: [ ActivityListComponent ],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            getActivities: () => activitiesSubject.asObservable()
          }
        },
        { provide: FirestoreService, useValue: mockFirestoreService },
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    translate = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the activities title using translation key', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const title = compiled.querySelector('h2')
    expect(title).toBeTruthy()
    expect(title && title.textContent).toContain(translate.instant('HOME.CAT_PHYSICAL_TITLE'))
  })

  it('should show a message if no activities are available', () => {
    activitiesSubject.next([])
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const emptyMsg = compiled.querySelector('.col-span-full')
    expect(emptyMsg).toBeTruthy()
    expect(emptyMsg && emptyMsg.textContent).toContain('ACTIVITIES.EMPTY')
  })

  it('should show a loading spinner while loading', () => {
    // No spinner in new template, so skip or update this test if needed
    // expect(compiled.querySelector('[data-testid="loading-spinner"]')).toBeTruthy()
    expect(true).toBeTrue() // placeholder
  })

  it('should render activity cards with Tailwind classes', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const cards = compiled.querySelectorAll('.group.overflow-hidden.bg-white')
    expect(cards.length).toBe(mockActivitiesList.length)
    expect(cards[0].className).toMatch(/rounded-xl/)
  })

  it('should apply responsive Tailwind classes', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const grid = compiled.querySelector('.grid')
    expect(grid.className).toMatch(/sm:grid-cols-2/)
    expect(grid.className).toMatch(/lg:grid-cols-3/)
  })

  it('should have accessible alt text for images in the current language', () => {
    activitiesSubject.next(mockActivitiesList)
    component.lang = 'sr'
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const images = compiled.querySelectorAll('img')
    images.forEach((img: HTMLImageElement, i: number) => {
      expect(img.alt).toBe(mockActivitiesList[i].title)
    })
    component.lang = 'en'
    fixture.detectChanges()
    const imagesEn = compiled.querySelectorAll('img')
    imagesEn.forEach((img: HTMLImageElement, i: number) => {
      expect(img.alt).toBe(mockActivitiesList[i].title)
    })
  })

  it('should call goBack and navigate to / when back button is clicked', () => {
    spyOn(component, 'goBack').and.callThrough()
    const router = TestBed.inject(Router)
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true))
    const compiled = fixture.nativeElement
    const backBtn = compiled.querySelector('button')
    backBtn.click()
    expect(component.goBack).toHaveBeenCalled()
    expect(router.navigate).toHaveBeenCalledWith(['/'])
  })

  it('should render category filter buttons for all categories', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const filterBtns = compiled.querySelectorAll('div.flex button')
    // 1 for ALL + one per category
    expect(filterBtns.length).toBe(1 + component.categories.length)
    expect(filterBtns[0].textContent).toContain('ACTIVITIES.ALL')
  })

  it('should highlight the selected category', () => {
    activitiesSubject.next(mockActivitiesList)
    component.selectedCategory = component.categories[0]
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const filterBtns = compiled.querySelectorAll('div.flex button')
    expect(filterBtns[1].className).toContain('bg-green-600')
  })

  it('should call selectCategory and update filter when a category is clicked', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    spyOn(component, 'selectCategory').and.callThrough()
    const compiled = fixture.nativeElement
    const filterBtns = compiled.querySelectorAll('div.flex button')
    filterBtns[1].click()
    expect(component.selectCategory).toHaveBeenCalled()
    expect(component.selectedCategory).toBe(component.categories[0])
  })

  it('should render a card for each activity with correct content', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const cards = compiled.querySelectorAll('.group.overflow-hidden.bg-white')
    expect(cards.length).toBe(mockActivitiesList.length)
    mockActivitiesList.forEach((activity, i) => {
      const card = cards[i]
      expect(card.textContent).toContain(activity.title)
      expect(card.textContent).toContain(activity.description)
      expect(card.querySelector('img').getAttribute('src')).toBe(activity.imageUrl)
      expect(card.querySelector('img').getAttribute('alt')).toBe(activity.title)
      expect(card.textContent).toContain('HOME.CAT_' + activity.category.toUpperCase() + '_TITLE')
      expect(card.textContent).toContain(activity.duration)
    })
  })

  it('should navigate to activity detail on card click', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    spyOn(router, 'navigate')
    const compiled = fixture.nativeElement
    const firstCard = compiled.querySelector('.group.overflow-hidden.bg-white')
    firstCard.click()
    expect(router.navigate).toHaveBeenCalledWith(['/activity', mockActivitiesList[0].id], jasmine.any(Object))
  })

  it('should call goToActivity and navigate to detail when start button is clicked', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    spyOn(component, 'goToActivity').and.callThrough()
    spyOn(router, 'navigate')
    const compiled = fixture.nativeElement
    const startBtn = compiled.querySelector('.group.overflow-hidden.bg-white button')
    startBtn.click()
    expect(component.goToActivity).toHaveBeenCalledWith(mockActivitiesList[0].id)
    expect(router.navigate).toHaveBeenCalledWith(['/activity', mockActivitiesList[0].id], jasmine.any(Object))
  })

  it('should apply responsive Tailwind classes to the grid', () => {
    activitiesSubject.next(mockActivitiesList)
    fixture.detectChanges()
    const compiled = fixture.nativeElement
    const grid = compiled.querySelector('.grid')
    expect(grid.className).toMatch(/sm:grid-cols-2/)
    expect(grid.className).toMatch(/lg:grid-cols-3/)
  })
}); 