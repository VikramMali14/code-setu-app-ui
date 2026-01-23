import { TestBed } from '@angular/core/testing';

import { DepartmentDialogService } from './department-dialog.service';

describe('DepartmentDialogService', () => {
  let service: DepartmentDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
