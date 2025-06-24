import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule
      ],
      declarations: [ HomeComponent ],
      providers: [
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display welcome card', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.welcome-card')).toBeTruthy();
  });

  it('should have start activities button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button[routerLink="/activities"]');
    expect(button).toBeTruthy();
  });
}); 