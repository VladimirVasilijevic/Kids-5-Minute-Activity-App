import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './home.component';
import { Router } from '@angular/router';
import { CATEGORY_KEYS } from '../../models/category-keys';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [ HomeComponent ],
      providers: [
        { provide: Router, useValue: routerSpy }
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
    const ps = compiled.querySelectorAll('p');
    const subtitle = Array.from(ps).find(
      el => (el as HTMLElement).className.includes('text-base') && (el as HTMLElement).className.includes('md:text-lg')
    ) as HTMLElement | undefined;
    const desc = Array.from(ps).find(
      el => (el as HTMLElement).className.includes('text-sm') && (el as HTMLElement).className.includes('md:text-base')
    ) as HTMLElement | undefined;
    expect(title).toBeTruthy();
    expect(subtitle).toBeTruthy();
    expect(desc).toBeTruthy();
    expect(title.textContent).toContain('HOME.WELCOME_TITLE');
    expect(subtitle && subtitle.textContent).toContain('HOME.WELCOME_SUBTITLE');
    expect(desc && desc.textContent).toContain('HOME.DESCRIPTION');
  });

  it('should navigate to /about and call scrollToTop', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.ABOUT);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/about']);
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /shop and call scrollToTop', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.SHOP);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/shop']);
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /blog and call scrollToTop', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.BLOG);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/blog']);
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /tips and call scrollToTop', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.TIPS);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tips']);
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities with category for PHYSICAL', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.PHYSICAL);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.PHYSICAL } });
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities with category for CREATIVE', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.CREATIVE);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.CREATIVE } });
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities with category for EDUCATIONAL', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.EDUCATIONAL);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.EDUCATIONAL } });
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities with category for MUSICAL', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.MUSICAL);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.MUSICAL } });
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities with category for NATURE', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory(CATEGORY_KEYS.NATURE);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities'], { queryParams: { category: CATEGORY_KEYS.NATURE } });
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });

  it('should navigate to /activities (default case) and call scrollToTop', async () => {
    spyOn(component as any, 'scrollToTop');
    await component.goToCategory('UNKNOWN');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/activities']);
    expect((component as any).scrollToTop).toHaveBeenCalled();
  });
}); 