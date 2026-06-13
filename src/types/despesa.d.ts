interface DeputadoDespesas {
  id: number;
  nome: string;

  porFornecedor: {
    [fornecedor: string]: FornecedorResumo;
  };

  porMes: {
    [mes: string]: number;
  };

  porTipoDespesa: {
    [tipoDespesa: string]: TipoDespesaResumo;
  };

  gabinete: {
    andar: string;
    email: string;
    nome: string;
    predio: string;
    sala: string;
    telefone: string;
  };

  urlWebsite: string,
  email: string
  quantidadeDespesas: number;
  redesSociais: string[];
  siglaPartido: string;
  siglaUf: string;
  totalGeral: number;
  urlCamara: string;
  urlFoto: string;
}
