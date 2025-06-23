import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';

import { ActivityDetailComponent } from './activity-detail.component';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule
      ],
      declarations: [ ActivityDetailComponent ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '001'
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have activity data', () => {
    expect(component.activity).toBeDefined();
    expect(component.activity.id).toBe('001');
  });

  it('should display activity title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(component.activity.title.sr);
  });

  it('should display activity description', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(component.activity.description.sr);
  });

  it('should have video element', () => {
    const compiled = fixture.nativeElement;
    const video = compiled.querySelector('video');
    expect(video).toBeTruthy();
  });

  it('should have video source with correct URL', () => {
    const compiled = fixture.nativeElement;
    const videoSource = compiled.querySelector('video source');
    expect(videoSource).toBeTruthy();
    expect(videoSource.getAttribute('src')).toBe(component.activity.videoUrl.sr);
  });
}); 