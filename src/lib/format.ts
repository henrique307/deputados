export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });

export const fmtBRLCompact = (v: number) => {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2).replace('.', ',')} mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1).replace('.', ',')} mil`;
  return fmtBRL(v);
};

const MESES = [
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

export const nomeMes = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MESES[m - 1]} de ${y}`;
};

export const ultimoMes = (porMes: Record<string, number>) => {
  if (!porMes || Object.keys(porMes).length === 0) return null;
  const chaves = Object.keys(porMes).sort();
  return chaves[chaves.length - 1];
};

export function formatCpfCnpj(value: string): string {
  if (!value) return 'Sem Identificação';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    const cpf = digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    return `CPF: ${cpf}`;
  }

  if (digits.length === 14) {
    const cnpj = digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');

    return `CNPJ: ${cnpj}`;
  }

  return digits;
}