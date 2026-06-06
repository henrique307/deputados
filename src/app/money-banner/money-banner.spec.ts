import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyBanner } from './money-banner';

describe('MoneyBanner', () => {
  let component: MoneyBanner;
  let fixture: ComponentFixture<MoneyBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyBanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
