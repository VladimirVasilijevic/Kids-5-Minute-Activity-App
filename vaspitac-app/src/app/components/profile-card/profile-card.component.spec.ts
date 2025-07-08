import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileCardComponent } from './profile-card.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfileCardComponent', () => {
  let component: ProfileCardComponent;
  let fixture: ComponentFixture<ProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileCardComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind name and avatarUrl inputs', () => {
    component.name = 'Test User';
    component.avatarUrl = 'http://example.com/avatar.png';
    fixture.detectChanges();
    expect(component.name).toBe('Test User');
    expect(component.avatarUrl).toBe('http://example.com/avatar.png');
  });

  it('should emit profileClick when card is clicked', () => {
    spyOn(component.profileClick, 'emit');
    const card = fixture.debugElement.query(By.css('div'));
    card.triggerEventHandler('click', null);
    expect(component.profileClick.emit).toHaveBeenCalled();
  });

  it('should render avatar image if avatarUrl is provided', () => {
    component.avatarUrl = 'http://example.com/avatar.png';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.src).toContain('http://example.com/avatar.png');
  });

  it('should render default icon if avatarUrl is not provided', () => {
    component.avatarUrl = '';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img[src="/assets/placeholder.svg"]'));
    expect(img).toBeTruthy();
  });
}); 