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
        BrowserAnimationsModule
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

  it('should display welcome section with translation keys', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('h2');
    const subtitle = compiled.querySelector('p.text-lg');
    const desc = compiled.querySelector('p.text-gray-600');
    expect(title.textContent).toContain('HOME.WELCOME_TITLE');
    expect(subtitle.textContent).toContain('HOME.WELCOME_SUBTITLE');
    expect(desc.textContent).toContain('HOME.DESCRIPTION');
  });

  it('should have start activities button with routerLink', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button[routerLink="/activities"]');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('HOME.START_ACTIVITIES');
  });
}); 