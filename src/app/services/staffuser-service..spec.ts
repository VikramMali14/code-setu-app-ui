import { TestBed } from '@angular/core/testing';

import { StaffuserServiceService } from './staffuser-service';

describe('StaffuserServiceService', () => {
  let service: StaffuserServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaffuserServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
