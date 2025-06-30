import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { ShopComponent } from './shop.component'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { By } from '@angular/platform-browser'
import { NO_ERRORS_SCHEMA } from '@angular/core'

class MockRouter {
  navigate = jasmine.createSpy('navigate')
}

describe('ShopComponent', () => {
  let component: ShopComponent
  let fixture: ComponentFixture<ShopComponent>
  let router: MockRouter
  let translate: TranslateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShopComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useClass: MockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(ShopComponent)
    component = fixture.componentInstance
    router = TestBed.inject(Router) as any
    translate = TestBed.inject(TranslateService)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render the shop title and description', () => {
    const compiled = fixture.nativeElement as HTMLElement
    const title = compiled.querySelector('h1')
    const desc = compiled.querySelector('p.text-lg')
    expect(title).toBeTruthy()
    expect(desc).toBeTruthy()
    expect(title && title.textContent).toContain('SHOP.TITLE')
    expect(desc && desc.textContent).toContain('SHOP.DESCRIPTION')
  })

  it('should navigate back to home on back button click', () => {
    const backBtn = fixture.debugElement.query(By.css('button'))
    backBtn.triggerEventHandler('click', null)
    expect(router.navigate).toHaveBeenCalledWith(['/'])
  })

  it('should copy PayPal email and show feedback', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())
    component.copyPayPalEmail()
    tick()
    expect(component.copiedPayPal).toBeTrue()
    tick(2000)
    expect(component.copiedPayPal).toBeFalse()
  }))

  it('should render PayPal email', () => {
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.textContent).toContain('ana.petrovic.vaspitac@g') // partial check for obfuscated email
    expect(compiled.textContent).toContain('SHOP.PAYPAL_EMAIL_LABEL')
  })
}) 