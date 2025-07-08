import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserCardComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind name, email, and avatarUrl inputs', () => {
    component.name = 'Test User';
    component.email = 'test@example.com';
    component.avatarUrl = 'http://example.com/avatar.png';
    fixture.detectChanges();
    expect(component.name).toBe('Test User');
    expect(component.email).toBe('test@example.com');
    expect(component.avatarUrl).toBe('http://example.com/avatar.png');
  });

  it('should emit logout event when logout button is clicked', () => {
    spyOn(component.logout, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', null);
    expect(component.logout.emit).toHaveBeenCalled();
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
    const icon = fixture.debugElement.query(By.css('.i-lucide--user'));
    expect(icon).toBeTruthy();
  });
}); 