import { TestBed } from '@angular/core/testing'
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing'
import { ActivityService } from './activity.service'
import { mockActivities } from '../../test-utils/mock-activities'

describe('ActivityService', () => {
  let service: ActivityService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityService]
    })
    service = TestBed.inject(ActivityService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should load activities from JSON', done => {
    service.getActivities().subscribe(acts => {
      expect(acts.length).toBe(mockActivities.length)
      expect(acts[0].id).toBe(mockActivities[0].id)
      done()
    })
    httpMock.expectOne('assets/activities_sr.json').flush(mockActivities)
  })

  it('should get activity by ID', done => {
    const targetId = mockActivities[1].id
    service.getActivityById(targetId).subscribe(act => {
      expect(act).toBeTruthy()
      expect(act?.id).toBe(targetId)
      done()
    })
    httpMock.expectOne('assets/activities_sr.json').flush(mockActivities)
  })

  it('should return undefined for missing ID', done => {
    service.getActivityById('999').subscribe(act => {
      expect(act).toBeUndefined()
      done()
    })
    httpMock.expectOne('assets/activities_sr.json').flush(mockActivities)
  })
}) 