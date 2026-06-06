import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeputadoCard } from './deputado-card';

describe('DeputadoCard', () => {
  let component: DeputadoCard;
  let fixture: ComponentFixture<DeputadoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeputadoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DeputadoCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
