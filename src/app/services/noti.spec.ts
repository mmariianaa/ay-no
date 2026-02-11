import { TestBed } from '@angular/core/testing';

import { Noti } from './noti';

describe('Noti', () => {
  let service: Noti;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Noti);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
