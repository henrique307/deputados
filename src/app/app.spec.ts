import { TestBed } from '@angular/core/testing';
import { App } from './app';

const makeDespesa = (overrides: {
  id?: number;
  nome: string;
  totalGeral: number;
  porMes?: Record<string, number>;
  porTipoDespesa?: Record<string, { total: number; quantidade: number }>;
  porFornecedor?: Record<string, { total: number; quantidade: number; cnpjCpfFornecedor: string }>;
}) => ({
  id: overrides.id ?? 1,
  nome: overrides.nome,
  email: `${overrides.nome.toLowerCase().replace(' ', '.')}@camara.leg.br`,
  urlFoto: 'https://example.com/foto.jpg',
  totalGeral: overrides.totalGeral,
  quantidadeDespesas: 10,
  porMes: overrides.porMes ?? { '2025-01-01': overrides.totalGeral },
  porTipoDespesa: overrides.porTipoDespesa ?? {
    Combustível: { total: overrides.totalGeral, quantidade: 5 },
  },
  porFornecedor: overrides.porFornecedor ?? {
    'Fornecedor A': {
      total: overrides.totalGeral,
      quantidade: 5,
      cnpjCpfFornecedor: '12.345.678/0001-99',
    },
  },
});

describe('App', () => {
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initials', () => {
    it('retorna iniciais de duas palavras longas', () => {
      const d = makeDespesa({ nome: 'Carlos Souza', totalGeral: 0 });
      expect(component.initials(d)).toBe('CS');
    });

    it('ignora palavras com 2 caracteres ou menos', () => {
      const d = makeDespesa({ nome: 'José da Silva', totalGeral: 0 });
      expect(component.initials(d)).toBe('JS'); // 'da' ignorado
    });

    it('retorna no máximo 2 iniciais', () => {
      const d = makeDespesa({ nome: 'Ana Maria Souza Lima', totalGeral: 0 });
      expect(component.initials(d).length).toBe(2);
    });
  });

  describe('meses', () => {
    it('retorna entradas com key, label e valor', () => {
      const d = makeDespesa({ nome: 'Ana Lima', totalGeral: 5000, porMes: { '2025-01-01': 5000 } });
      const meses = component.meses(d);
      expect(meses.length).toBe(1);
      expect(meses[0].key).toBe('2025-01-01');
      expect(meses[0].valor).toBe(5000);
      expect(meses[0].label).toBeTruthy();
    });

    it('retorna múltiplos meses', () => {
      const d = makeDespesa({
        nome: 'Bruno Melo',
        totalGeral: 10000,
        porMes: { '2025-01-01': 4000, '2025-02-01': 6000 },
      });
      expect(component.meses(d).length).toBe(2);
    });
  });

  describe('tipos', () => {
    it('retorna tipos com nome, total, quantidade e barClass', () => {
      const d = makeDespesa({ nome: 'Carlos Souza', totalGeral: 8000 });
      const tipos = component.tipos(d);
      expect(tipos[0].nome).toBeTruthy();
      expect(tipos[0].total).toBe(8000);
      expect(tipos[0].barClass).toBeTruthy();
    });

    it('capitaliza o nome do tipo', () => {
      const d = makeDespesa({ nome: 'Carlos Souza', totalGeral: 8000 });
      d.porTipoDespesa = { 'Combustível.': { total: 8000, quantidade: 3 } };
      const tipos = component.tipos(d);
      expect(tipos[0].nome[0]).toBe(tipos[0].nome[0].toUpperCase());
    });

    it('remove ponto final do nome do tipo', () => {
      const d = makeDespesa({ nome: 'Carlos Souza', totalGeral: 8000 });
      d.porTipoDespesa = { 'Divulgação.': { total: 8000, quantidade: 3 } };
      const tipos = component.tipos(d);
      expect(tipos[0].nome).not.toContain('.');
    });

    it('cicla barClass entre 4 cores', () => {
      const d = makeDespesa({ nome: 'Carlos Souza', totalGeral: 0 });
      d.porTipoDespesa = Object.fromEntries(
        Array.from({ length: 5 }, (_, i) => [`Tipo ${i}`, { total: i * 100, quantidade: 1 }]),
      );
      const tipos = component.tipos(d);
      expect(tipos[4].barClass).toBe(tipos[0].barClass); // volta ao início
    });
  });

  describe('fornecedoresOrdenados', () => {
    it('ordena por total decrescente', () => {
      const d = makeDespesa({ nome: 'Ana Lima', totalGeral: 0 });
      d.porFornecedor = {
        'Fornecedor A': { total: 1000, quantidade: 1, cnpjCpfFornecedor: '00000000000' },
        'Fornecedor B': { total: 9000, quantidade: 1, cnpjCpfFornecedor: '00000000000000' },
      };
      const result = component.fornecedoresOrdenados(d);
      expect(result[0].nome).toBe('Fornecedor B');
    });

    it('formata CPF corretamente', () => {
      const d = makeDespesa({ nome: 'Ana Lima', totalGeral: 0 });
      d.porFornecedor = {
        'Pessoa Física': { total: 500, quantidade: 1, cnpjCpfFornecedor: '12345678901' },
      };
      const result = component.fornecedoresOrdenados(d);
      expect(result[0].cnpjCpfFornecedor).toMatch(/^CPF:/);
    });

    it('formata CNPJ corretamente', () => {
      const d = makeDespesa({ nome: 'Ana Lima', totalGeral: 0 });
      d.porFornecedor = {
        'Empresa X': { total: 500, quantidade: 1, cnpjCpfFornecedor: '12345678000199' },
      };
      const result = component.fornecedoresOrdenados(d);
      expect(result[0].cnpjCpfFornecedor).toMatch(/^CNPJ:/);
    });

    it('retorna "Sem Identificação" quando cnpjCpfFornecedor está vazio', () => {
      const d = makeDespesa({ nome: 'Ana Lima', totalGeral: 0 });
      d.porFornecedor = {
        'Sem Doc': { total: 500, quantidade: 1, cnpjCpfFornecedor: '' },
      };
      const result = component.fornecedoresOrdenados(d);
      expect(result[0].cnpjCpfFornecedor).toBe('Sem Identificação');
    });
  });
});
