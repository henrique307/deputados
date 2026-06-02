import { readFile, writeFile } from "fs/promises";
import putas from "../deputados.json" with {type: "json"};

async function fetchDespesaDaPuta(putaId: number) {
    const URL = "https://dadosabertos.camara.leg.br/api/v2";
    const res = await fetch(`${URL}/deputados/${putaId}/despesas`);

    return await res.json()
}

function gerarResumo(despesas: any[], nomeDaPuta: string, id: number) {
  const resumo = {
    totalGeral: 0,
    quantidadeDespesas: despesas.length,
    nome: nomeDaPuta,
    id: id,

    porMes: {} as Record<string, number>,

    porTipoDespesa: {} as Record<
      string,
      {
        total: number;
        quantidade: number;
      }
    >,

    porFornecedor: {} as Record<
      string,
      {
        total: number;
        quantidade: number;
      }
    >,
  };

  for (const despesa of despesas) {
    const {
      ano,
      mes,
      tipoDespesa,
      nomeFornecedor,
      valorLiquido,
    } = despesa;

    resumo.totalGeral += valorLiquido;

    const chaveMes = `${ano}-${String(mes).padStart(2, "0")}`;

    resumo.porMes[chaveMes] ??= 0;
    resumo.porMes[chaveMes] += valorLiquido;

    resumo.porTipoDespesa[tipoDespesa] ??= {
      total: 0,
      quantidade: 0,
    };

    resumo.porTipoDespesa[tipoDespesa].total += valorLiquido;
    resumo.porTipoDespesa[tipoDespesa].quantidade++;

    resumo.porFornecedor[nomeFornecedor] ??= {
      total: 0,
      quantidade: 0,
    };

    resumo.porFornecedor[nomeFornecedor].total += valorLiquido;
    resumo.porFornecedor[nomeFornecedor].quantidade++;
  }

  return resumo;
}

const resumoDasFestaDaPutas = [];

for (let puta of putas) {
    const putaId = puta.id;

    const despesasDaPuta = await fetchDespesaDaPuta(putaId);

    const resumo = gerarResumo(despesasDaPuta.dados, puta.nome, puta.id);

    resumoDasFestaDaPutas.push(resumo);
}

await writeFile(
  "resumoDaFestaDasPutas.json",
  JSON.stringify(resumoDasFestaDaPutas, null, 2),
  "utf-8"
);