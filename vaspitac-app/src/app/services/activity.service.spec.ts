import { TestBed } from '@angular/core/testing'
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing'
import { ActivityService } from './activity.service'
import { mockActivitiesData } from '../../test-utils/mock-activities'

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
      expect(acts.length).toBe(mockActivitiesData.activities.length)
      expect(acts[0].id).toBe(mockActivitiesData.activities[0].id)
      done()
    })
    httpMock.expectOne('assets/activities.json').flush(mockActivitiesData)
  })

  it('should get version from JSON', done => {
    service.getVersion().subscribe(version => {
      expect(version).toBe(mockActivitiesData.version)
      done()
    })
    httpMock.expectOne('assets/activities.json').flush(mockActivitiesData)
  })

  it('should get activity by ID', done => {
    const targetId = mockActivitiesData.activities[1].id
    service.getActivityById(targetId).subscribe(act => {
      expect(act).toBeTruthy()
      expect(act?.id).toBe(targetId)
      done()
    })
    httpMock.expectOne('assets/activities.json').flush(mockActivitiesData)
  })

  it('should return undefined for missing ID', done => {
    service.getActivityById('999').subscribe(act => {
      expect(act).toBeUndefined()
      done()
    })
    httpMock.expectOne('assets/activities.json').flush(mockActivitiesData)
  })
}) 