import { TestBed } from '@angular/core/testing'
import { CategoryService } from './category.service'
import { FirestoreService } from './firestore.service'
import { of } from 'rxjs'
import { mockFirestoreService } from '../../test-utils/mock-firestore-service'
import { mockCategories } from '../../test-utils/mock-categories'

describe('CategoryService', () => {
  let service: CategoryService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        { provide: FirestoreService, useValue: mockFirestoreService }
      ]
    })
    service = TestBed.inject(CategoryService)
    mockFirestoreService.getCategories.calls.reset()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get categories from FirestoreService', () => {
    mockFirestoreService.getCategories.and.returnValue(of(mockCategories))
    service.getCategories().subscribe(categories => {
      expect(categories).toEqual(mockCategories)
    })
    expect(mockFirestoreService.getCategories).toHaveBeenCalled()
  })
}) 