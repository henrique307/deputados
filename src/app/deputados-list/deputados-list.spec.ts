import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Despesa } from '../../data/deputados';
import { DeputadosList } from './deputados-list';

const makeDespesa = (
  overrides: Partial<Despesa> & Pick<Despesa, 'id' | 'nome' | 'totalGeral'>,
): Despesa => ({
  email: `${overrides.nome.toLowerCase().replace(' ', '.')}@camara.leg.br`,
  urlFoto: 'https://example.com/foto.jpg',
  quantidadeDespesas: 10,
  porMes: { '2024-01-01': overrides.totalGeral },
  porTipoDespesa: { Combustível: { total: overrides.totalGeral, quantidade: 5 } },
  porFornecedor: {
    'Fornecedor A': {
      total: overrides.totalGeral,
      quantidade: 5,
      cnpjCpfFornecedor: '00.000.000/0001-00',
    },
  },
  ...overrides,
});

const mockDeputados: Despesa[] = [
  makeDespesa({ id: 1, nome: 'Carlos Souza', totalGeral: 80000 }),
  makeDespesa({ id: 2, nome: 'Ana Lima', totalGeral: 50000 }),
  makeDespesa({ id: 3, nome: 'Bruno Melo', totalGeral: 95000 }),
];

describe('DeputadosList', () => {
  let component: DeputadosList;
  let fixture: ComponentFixture<DeputadosList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeputadosList],
    }).compileComponents();

    fixture = TestBed.createComponent(DeputadosList);
    component = fixture.componentInstance;
    component.deputados = mockDeputados;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('max', () => {
    it('retorna o maior totalGeral', () => {
      expect(component.max).toBe(95000);
    });

    it('retorna 1 quando lista está vazia', () => {
      component.deputados = [];
      expect(component.max).toBe(1);
    });
  });

  describe('filtrados', () => {
    describe('ordenação', () => {
      it('ordena por maior gasto por padrão', () => {
        const nomes = component.filtrados.map((d) => d.nome);
        expect(nomes).toEqual(['Bruno Melo', 'Carlos Souza', 'Ana Lima']);
      });

      it('ordena por menor gasto', () => {
        component.sort = 'menor';
        const nomes = component.filtrados.map((d) => d.nome);
        expect(nomes).toEqual(['Ana Lima', 'Carlos Souza', 'Bruno Melo']);
      });

      it('ordena alphabeticamente A–Z', () => {
        component.sort = 'az';
        const nomes = component.filtrados.map((d) => d.nome);
        expect(nomes).toEqual(['Ana Lima', 'Bruno Melo', 'Carlos Souza']);
      });
    });

    describe('busca', () => {
      it('filtra por nome', () => {
        component.q = 'ana';
        expect(component.filtrados.length).toBe(1);
        expect(component.filtrados[0].nome).toBe('Ana Lima');
      });

      it('busca é case-insensitive', () => {
        component.q = 'CARLOS';
        expect(component.filtrados.length).toBe(1);
        expect(component.filtrados[0].nome).toBe('Carlos Souza');
      });

      it('retorna todos quando busca está vazia', () => {
        component.q = '';
        expect(component.filtrados.length).toBe(3);
      });

      it('retorna vazio quando nenhum nome bate', () => {
        component.q = 'xyzxyz';
        expect(component.filtrados.length).toBe(0);
      });

      it('ignora espaços no início e fim da busca', () => {
        component.q = '  bruno  ';
        expect(component.filtrados.length).toBe(1);
        expect(component.filtrados[0].nome).toBe('Bruno Melo');
      });
    });

    it('não muta o array original ao ordenar', () => {
      const original = [...mockDeputados];
      component.sort = 'az';
      component.filtrados;
      expect(component.deputados).toEqual(original);
    });
  });

  describe('trackByDeputado', () => {
    it('retorna o id do deputado', () => {
      expect(component.trackByDeputado(0, mockDeputados[0])).toBe(1);
    });
  });
});
