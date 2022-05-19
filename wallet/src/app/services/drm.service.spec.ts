import { TestBed } from '@angular/core/testing';

import { DrmService } from './drm.service';

describe('DrmService', () => {
  let service: DrmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
