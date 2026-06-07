export type Despesa = {
  totalGeral: number;
  quantidadeDespesas: number;
  nome: string;
  email: string;
  id: number;
  urlFoto: string;
  porMes: Record<string, number>;
  porTipoDespesa: Record<string, { total: number; quantidade: number }>;
  porFornecedor: Record<string, { total: number; quantidade: number; cnpjCpfFornecedor: string }>;
};

export type DespesasFile = {
  updatedAt: string;
  despesas: Despesa[];
};