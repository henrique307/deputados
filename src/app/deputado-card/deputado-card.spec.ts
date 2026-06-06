import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Despesa } from '../../data/deputados';
import { DeputadoCard } from './deputado-card';

const mockDespesa: Despesa = {
  id: 1,
  nome: 'João da Silva',
  email: 'joao.silva@camara.leg.br',
  urlFoto: 'https://example.com/foto.jpg',
  totalGeral: 50000,
  quantidadeDespesas: 42,
  porMes: {
    '2024-01-01': 10000,
    '2024-02-01': 15000,
    '2024-03-01': 25000,
  },
  porTipoDespesa: {
    Combustível: { total: 4000, quantidade: 10 },
    Divulgação: { total: 15500, quantidade: 8 },
    Passagens: { total: 11000, quantidade: 15 },
    Consultorias: { total: 7000, quantidade: 5 },
    Alimentação: { total: 12500, quantidade: 4 },
  },
  porFornecedor: {
    'Posto ABC': { total: 4000, quantidade: 10, cnpjCpfFornecedor: '12.345.678/0001-99' },
    'Gráfica XYZ': { total: 15500, quantidade: 8, cnpjCpfFornecedor: '98.765.432/0001-11' },
  },
};

describe('DeputadoCard', () => {
  let component: DeputadoCard;
  let fixture: ComponentFixture<DeputadoCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeputadoCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DeputadoCard);
    component = fixture.componentInstance;
    component.d = mockDespesa;
    component.rank = 1;
    component.max = 100000;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('pct', () => {
    it('calcula percentual corretamente', () => {
      expect(component.pct).toBe(50); // 50000/100000 * 100
    });

    it('retorna mínimo 4 quando totalGeral é muito pequeno', () => {
      component.d = { ...mockDespesa, totalGeral: 1 };
      expect(component.pct).toBe(4);
    });
  });

  describe('tipos', () => {
    it('retorna despesas ordenadas por total decrescente', () => {
      const tipos = component.tipos;
      for (let i = 0; i < tipos.length - 1; i++) {
        expect(tipos[i][1].total).toBeGreaterThanOrEqual(tipos[i + 1][1].total);
      }
    });

    it('retorna todos os tipos de despesa', () => {
      expect(component.tipos.length).toBe(5);
    });
  });

  describe('meses', () => {
    it('retorna meses ordenados cronologicamente', () => {
      const meses = component.meses;
      for (let i = 0; i < meses.length - 1; i++) {
        expect(meses[i][0].localeCompare(meses[i + 1][0])).toBeLessThanOrEqual(0);
      }
    });

    it('retorna todos os meses', () => {
      expect(component.meses.length).toBe(3);
    });
  });

  describe('toggle', () => {
    it('começa fechado', () => {
      expect(component.open).toBeFalsy();
    });

    it('abre ao chamar toggle', () => {
      component.toggle();
      expect(component.open).toBeTruthy();
    });

    it('fecha ao chamar toggle duas vezes', () => {
      component.toggle();
      component.toggle();
      expect(component.open).toBeFalsy();
    });
  });

  describe('hideImage', () => {
    it('esconde a imagem ao chamar hideImage', () => {
      const img = document.createElement('img');
      const event = { target: img } as unknown as Event;
      component.hideImage(event);
      expect(img.style.visibility).toBe('hidden');
    });
  });
});
