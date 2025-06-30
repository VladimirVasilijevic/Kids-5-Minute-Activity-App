import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AboutComponent } from './about.component'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'

class MockRouter {
  navigate = jasmine.createSpy('navigate')
}

describe('AboutComponent', () => {
  let component: AboutComponent
  let fixture: ComponentFixture<AboutComponent>
  let router: MockRouter
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useClass: MockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(AboutComponent)
    component = fixture.componentInstance
    router = TestBed.inject(Router) as any
    translate = TestBed.inject(TranslateService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render the about title and name', () => {
    const compiled = fixture.nativeElement as HTMLElement
    const title = compiled.querySelector('h1')
    expect(title).toBeTruthy()
    expect(title && title.textContent).toContain('ABOUT.NAME')
  })

  it('should navigate back to home on back button click', () => {
    const backBtn = fixture.debugElement.query(By.css('button'))
    backBtn.triggerEventHandler('click', null)
    expect(router.navigate).toHaveBeenCalledWith(['/'])
  })
}) 