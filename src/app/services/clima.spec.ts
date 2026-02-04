import { TestBed } from '@angular/core/testing';
import { ClimaService } from './clima'; 

describe('ClimaService', () => {
  let service: ClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClimaService]
    });
    service = TestBed.inject(ClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});