import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let router: Router;
  let _translate: TranslateService;

  beforeEach(async (): Promise<void> => {
    const navigateSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve());
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigate: navigateSpy } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    _translate = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should render the about title and name', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    expect(title).toBeTruthy();
    expect(title && title.textContent).toContain('ABOUT.NAME');
  });

  it('should navigate back to home on back button click', (): void => {
    // Call the goBack method directly
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
