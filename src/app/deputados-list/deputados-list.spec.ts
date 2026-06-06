import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeputadosList } from './deputados-list';

describe('DeputadosList', () => {
  let component: DeputadosList;
  let fixture: ComponentFixture<DeputadosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeputadosList],
    }).compileComponents();

    fixture = TestBed.createComponent(DeputadosList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
