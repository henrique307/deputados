import { fmtBRL, fmtBRLCompact, nomeMes, ultimoMes } from './format';

describe('fmtBRL', () => {
  it('formata valor em reais', () => {
    expect(fmtBRL(1000)).toContain('1.000');
    expect(fmtBRL(1000)).toContain('R$');
  });

  it('formata zero', () => {
    expect(fmtBRL(0)).toContain('R$');
  });

  it('formata com centavos', () => {
    expect(fmtBRL(1.5)).toContain('1,50');
  });
});

describe('fmtBRLCompact', () => {
  it('formata valores abaixo de mil normalmente', () => {
    expect(fmtBRLCompact(500)).toContain('R$');
    expect(fmtBRLCompact(500)).not.toContain('mil');
  });

  it('formata milhares com "mil"', () => {
    expect(fmtBRLCompact(5000)).toBe('R$ 5,0 mil');
  });

  it('formata milhões com "mi"', () => {
    expect(fmtBRLCompact(2_500_000)).toBe('R$ 2,50 mi');
  });

  it('arredonda mil corretamente', () => {
    expect(fmtBRLCompact(1500)).toBe('R$ 1,5 mil');
  });

  it('arredonda mi corretamente', () => {
    expect(fmtBRLCompact(1_000_000)).toBe('R$ 1,00 mi');
  });
});

describe('nomeMes', () => {
  it('retorna nome do mês e ano', () => {
    expect(nomeMes('2024-01')).toBe('janeiro de 2024');
  });

  it('funciona para dezembro', () => {
    expect(nomeMes('2024-12')).toBe('dezembro de 2024');
  });

  it('funciona para todos os meses', () => {
    const esperados = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ];
    esperados.forEach((nome, i) => {
      const mes = String(i + 1).padStart(2, '0');
      expect(nomeMes(`2024-${mes}`)).toContain(nome);
    });
  });
});

describe('ultimoMes', () => {
  it('retorna o mês mais recente', () => {
    expect(ultimoMes({ '2024-01': 100, '2024-03': 300, '2024-02': 200 })).toBe('2024-03');
  });

  it('funciona com um único mês', () => {
    expect(ultimoMes({ '2024-06': 500 })).toBe('2024-06');
  });

  it('ordena corretamente entre anos diferentes', () => {
    expect(ultimoMes({ '2023-12': 100, '2024-01': 200 })).toBe('2024-01');
  });
});
