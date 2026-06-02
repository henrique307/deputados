import { writeFile } from "fs/promises";
import putas from "../deputados.json" with { type: "json" };

const URL = "https://dadosabertos.camara.leg.br/api/v2";

interface Deputa {
  id: number;
  nome: string;
  email: string;
  urlFoto: string;
}

async function fetchDespesaDaPuta(putaId: number) {
  const res = await fetch(`${URL}/deputados/${putaId}/despesas`);
  return await res.json();
}

function gerarResumo(despesas: any[], puta: Deputa) {
  const resumo = {
    totalGeral: 0,
    quantidadeDespesas: despesas.length,
    nome: puta.nome,
    email: puta.email,
    id: puta.id,
    urlFoto: puta.urlFoto,
    porMes: {} as Record<string, number>,
    porTipoDespesa: {} as Record<string, { total: number; quantidade: number }>,
    porFornecedor: {} as Record<string, { total: number; quantidade: number, cnpjCpfFornecedor: string }>,
  };

  for (const despesa of despesas) {
    const { ano, mes, tipoDespesa, nomeFornecedor, valorLiquido, cnpjCpfFornecedor } = despesa;

    resumo.totalGeral += valorLiquido;

    const chaveMes = `${ano}-${String(mes).padStart(2, "0")}`;
    resumo.porMes[chaveMes] ??= 0;
    resumo.porMes[chaveMes] += valorLiquido;

    resumo.porTipoDespesa[tipoDespesa] ??= { total: 0, quantidade: 0 };
    resumo.porTipoDespesa[tipoDespesa].total += valorLiquido;
    resumo.porTipoDespesa[tipoDespesa].quantidade++;

    resumo.porFornecedor[nomeFornecedor] ??= { total: 0, quantidade: 0, cnpjCpfFornecedor };
    resumo.porFornecedor[nomeFornecedor].total += valorLiquido;
    resumo.porFornecedor[nomeFornecedor].quantidade++;
  }

  return resumo;
}

async function main() {
  const resumoDasFestaDaPutas = [];

  for (const puta of putas) {
    console.log(`🔍 Buscando despesas de ${puta.nome}...`);
    const despesasDaPuta = await fetchDespesaDaPuta(puta.id);
    const resumo = gerarResumo(despesasDaPuta.dados, puta as Deputa);
    resumoDasFestaDaPutas.push(resumo);
  }

  await writeFile(
    "resumoDaFestaDasPutas.json",
    JSON.stringify(resumoDasFestaDaPutas, null, 2),
    "utf-8"
  );

  console.log(`✅ Resumo de ${resumoDasFestaDaPutas.length} deputados salvo`);
}

main();