import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { MoneyBanner } from './money-banner';

describe('MoneyBanner', () => {
  let component: MoneyBanner;
  let fixture: ComponentFixture<MoneyBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyBanner],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }], // sem rAF no teste
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges / animateTotal (SSR)', () => {
    it('seta shown = total direto no SSR', () => {
      component.total = 99000;
      component.ngOnChanges({
        total: {
          currentValue: 99000,
          previousValue: 0,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(component.shown).toBe(99000);
    });

    it('não anima quando total não muda', () => {
      component.shown = 42;
      component.ngOnChanges({
        mesRef: {
          currentValue: '2024-01',
          previousValue: '',
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.shown).toBe(42);
    });
  });

  describe('stats', () => {
    it('tem 4 categorias', () => {
      expect(component.stats.length).toBe(4);
    });

    it('contém as categorias esperadas', () => {
      const labels = component.stats.map((s) => s.l);
      expect(labels).toContain('Combustível');
      expect(labels).toContain('Divulgação');
      expect(labels).toContain('Passagens');
      expect(labels).toContain('Consultorias');
    });
  });
});

describe('MoneyBanner (browser)', () => {
  let component: MoneyBanner;
  let fixture: ComponentFixture<MoneyBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyBanner],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(MoneyBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shown começa em 0', () => {
    expect(component.shown).toBe(0);
  });

  it('shown chega ao valor final após a animação', async () => {
    component.total = 50000;
    component.ngOnChanges({
      total: {
        currentValue: 50000,
        previousValue: 0,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(component.shown).toBeCloseTo(50000, -1);
  });
});
