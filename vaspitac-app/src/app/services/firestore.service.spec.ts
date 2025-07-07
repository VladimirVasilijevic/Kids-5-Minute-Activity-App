import { TestBed } from '@angular/core/testing'
import { FirestoreService } from './firestore.service'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { HttpClient } from '@angular/common/http'
import { LanguageService } from './language.service'
import { of, throwError } from 'rxjs'
import { mockActivities } from '../../test-utils/mock-activities'

describe('FirestoreService', () => {
  let service: FirestoreService
  let afsSpy: jasmine.SpyObj<AngularFirestore>
  let httpSpy: jasmine.SpyObj<HttpClient>
  let langSpy: jasmine.SpyObj<LanguageService>

  beforeEach(() => {
    afsSpy = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc'])
    httpSpy = jasmine.createSpyObj('HttpClient', ['get'])
    langSpy = jasmine.createSpyObj('LanguageService', ['getLanguage'])
    TestBed.configureTestingModule({
      providers: [
        FirestoreService,
        { provide: AngularFirestore, useValue: afsSpy },
        { provide: HttpClient, useValue: httpSpy },
        { provide: LanguageService, useValue: langSpy }
      ]
    })
    service = TestBed.inject(FirestoreService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get categories from Firestore', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([{ id: '1', title: 'cat' }]))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    service.getCategories().subscribe(categories => {
      expect(categories).toEqual([{ id: '1', title: 'cat' }])
      done()
    })
  })

  it('should fallback to JSON for categories if Firestore fails', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    httpSpy.get.and.returnValue(of([{ id: '2', title: 'json' }]))
    service.getCategories().subscribe(categories => {
      expect(categories).toEqual([{ id: '2', title: 'json' }])
      done()
    })
  })

  it('should get blog posts from Firestore', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([{ id: '1', title: 'blog' }]))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    service.getBlogPosts().subscribe(posts => {
      expect(posts).toEqual([{ id: '1', title: 'blog' }])
      done()
    })
  })

  it('should fallback to JSON for blog posts if Firestore fails', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    httpSpy.get.and.returnValue(of([{ id: '2', title: 'json' }]))
    service.getBlogPosts().subscribe(posts => {
      expect(posts).toEqual([{ id: '2', title: 'json' }])
      done()
    })
  })

  it('should get tips from Firestore', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([{ id: '1', title: 'tip' }]))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    service.getTips().subscribe(tips => {
      expect(tips).toEqual([{ id: '1', title: 'tip' }])
      done()
    })
  })

  it('should fallback to JSON for tips if Firestore fails', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    httpSpy.get.and.returnValue(of([{ id: '2', title: 'json' }]))
    service.getTips().subscribe(tips => {
      expect(tips).toEqual([{ id: '2', title: 'json' }])
      done()
    })
  })

  it('should get activities from Firestore', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of([mockActivities[0]]))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    service.getActivities().subscribe(acts => {
      expect(acts).toEqual([mockActivities[0]])
      done()
    })
  })

  it('should fallback to JSON for activities if Firestore fails', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')))
    afsSpy.collection.and.returnValue({ valueChanges: valueChangesSpy } as any)
    httpSpy.get.and.returnValue(of([mockActivities[1]]))
    service.getActivities().subscribe(acts => {
      expect(acts).toEqual([mockActivities[1]])
      done()
    })
  })

  it('should get activity by id from Firestore', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(of(mockActivities[0]))
    afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as any)
    service.getActivityById('001').subscribe(act => {
      expect(act).toEqual(mockActivities[0])
      done()
    })
  })

  it('should fallback to JSON for activity by id if Firestore fails', done => {
    langSpy.getLanguage.and.returnValue(of('en'))
    const valueChangesSpy = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')))
    afsSpy.doc.and.returnValue({ valueChanges: valueChangesSpy } as any)
    httpSpy.get.and.returnValue(of([mockActivities[1]]))
    service.getActivityById('002').subscribe(act => {
      expect(act).toEqual(mockActivities[1])
      done()
    })
  })
}) 