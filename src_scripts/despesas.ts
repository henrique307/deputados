import { setGlobalDispatcher } from 'undici';
import { dispatcher } from './proxy.agent';

//Set Proxy Agent
setGlobalDispatcher(dispatcher);

import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';
import { fetchDeputados } from './fetchDeputados';
import { Deputado, DeputadoDetalhes, DeputadoDetalhesResponse, Despesa, DespesasResponse } from './types';

const URL = 'https://dadosabertos.camara.leg.br/api/v2';
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Obtenha uma referência para o Realtime Database

async function fetchDetalhesDeputado(deputadoId: number): Promise<DeputadoDetalhesResponse> {
  const res = await fetch(`${URL}/deputados/${deputadoId}`);
  return await res.json();
}

async function fetchDespesa(deputadoId: number): Promise<DespesasResponse> {
  const res = await fetch(`${URL}/deputados/${deputadoId}/despesas`);
  return await res.json();
}

async function writeJsonDataToDatabase(data: any) {
  try {
    // A função 'set' escreve ou substitui os dados em um determinado caminho.
    // Usando 'ref(database, '/')' você pode preencher a raiz do seu banco de dados.
    // Tenha cuidado ao usar isso, pois pode sobrescrever dados existentes.
    await set(ref(database, '/'), data);
    console.log('Dados JSON preenchidos com sucesso!');
    return;
  } catch (error) {
    console.error('Erro ao preencher dados JSON:', error);
  } finally {
    deleteApp(app);
  }
}
function gerarResumo(despesas: any[], deputado: DeputadoDetalhes) {
  const dados = deputado.dados;
  const resumo = {
    totalGeral: 0,
    quantidadeDespesas: despesas.length,
    nome: dados.ultimoStatus.nome,
    email: dados.ultimoStatus.email,
    id: dados.id,
    urlFoto: dados.ultimoStatus.urlFoto,
    siglaPartido: dados.ultimoStatus.siglaPartido,
    siglaUf: dados.ultimoStatus.siglaUf,
    urlCamara: `https://www.camara.leg.br/deputados/${dados.id}`,
    porMes: {} as Record<string, number>,
    redesSociais: dados.redeSocial,
    porTipoDespesa: {} as Record<
      string,
      {
        total: number;
        quantidade: number;
        fornecedores: { nome: string; cnpjCpf: string; total: number; quantidade: number }[];
      }
    >,
    porFornecedor: {} as Record<
      string,
      { total: number; quantidade: number; cnpjCpfFornecedor: string }
    >,
  };

  for (const despesa of despesas) {
    const { ano, mes, tipoDespesa, nomeFornecedor, valorLiquido, cnpjCpfFornecedor } = despesa;

    const valor = valorLiquido ?? 0;
    if (!valor) continue;

    resumo.totalGeral += valorLiquido;

    const chaveMes = `${ano}-${String(mes).padStart(2, '0')}`;
    resumo.porMes[chaveMes] ??= 0;
    resumo.porMes[chaveMes] += valor;

    resumo.porTipoDespesa[tipoDespesa] ??= { total: 0, quantidade: 0, fornecedores: [] };
    resumo.porTipoDespesa[tipoDespesa].total += valorLiquido;
    resumo.porTipoDespesa[tipoDespesa].quantidade++;

    const fornecedoresTipo = resumo.porTipoDespesa[tipoDespesa].fornecedores;
    fornecedoresTipo[nomeFornecedor] ??= {
      nome: nomeFornecedor,
      cnpjCpf: cnpjCpfFornecedor,
      total: 0,
      quantidade: 0,
    };
    fornecedoresTipo[nomeFornecedor].total += valorLiquido;
    fornecedoresTipo[nomeFornecedor].quantidade++;

    resumo.porFornecedor[nomeFornecedor] ??= { total: 0, quantidade: 0, cnpjCpfFornecedor };
    resumo.porFornecedor[nomeFornecedor].total += valorLiquido;
    resumo.porFornecedor[nomeFornecedor].quantidade++;
  }

  // Converte fornecedores de objeto para array, ordenado por total desc
  const porTipoDespesaFinal = Object.fromEntries(
    Object.entries(resumo.porTipoDespesa).map(([tipo, dados]) => [
      tipo,
      {
        total: dados.total,
        quantidade: dados.quantidade,
        fornecedores: Object.values(dados.fornecedores).sort((a, b) => b.total - a.total),
      },
    ]),
  );

  return {
    ...resumo,
    porTipoDespesa: porTipoDespesaFinal,
  };
}

function sanitizeKeys(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeKeys);
  }

  const sanitizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Substitui caracteres inválidos. Por exemplo, substituindo '.' por '-'
      // Ou você pode simplesmente remover, dependendo da sua necessidade
      const sanitizedKey = key.replace(/[.#$/\[\]]/g, '-');
      sanitizedObject[sanitizedKey] = sanitizeKeys(data[key]);
    }
  }
  return sanitizedObject;
}

async function main() {
  const despesas = [];

  const deputados = await fetchDeputados();

  for (const deputado of deputados.dados) {
    console.log(`🔍 Buscando de ${deputado.nome}...`);
    const detalhes = await fetchDetalhesDeputado(deputado.id);
    const despesa = await fetchDespesa(deputado.id);
    const resumo = gerarResumo(despesa.dados, detalhes);
    despesas.push(resumo);
  }

  // Função para escrever os dados JSON no Realtime Database
  const sanitizedJsonData = sanitizeKeys({
    updatedAt: new Date(),
    despesas: despesas,
  });

  // Chame a função para executar a operação
  writeJsonDataToDatabase(sanitizedJsonData);

  console.log(`✅ Resumo de ${despesas.length} deputados salvos`);
}

main();
