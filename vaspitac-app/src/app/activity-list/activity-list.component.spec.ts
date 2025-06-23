import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';

import { ActivityListComponent } from './activity-list.component';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule
      ],
      declarations: [ ActivityListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have activities array', () => {
    expect(component.activities).toBeDefined();
    expect(Array.isArray(component.activities)).toBeTruthy();
  });

  it('should display activity cards', () => {
    const compiled = fixture.nativeElement;
    const activityCards = compiled.querySelectorAll('.activity-card');
    expect(activityCards.length).toBe(component.activities.length);
  });

  it('should display activity titles', () => {
    const compiled = fixture.nativeElement;
    const firstActivity = component.activities[0];
    expect(compiled.textContent).toContain(firstActivity.title.sr);
  });

  it('should have router links for activities', () => {
    const compiled = fixture.nativeElement;
    const activityCards = compiled.querySelectorAll('.activity-card');
    activityCards.forEach((card: any, index: number) => {
      const routerLink = card.getAttribute('ng-reflect-router-link');
      expect(routerLink).toContain('/activity');
      expect(routerLink).toContain(component.activities[index].id);
    });
  });
}); 