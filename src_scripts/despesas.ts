import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from './firebase.config';
import { fetchDeputados } from './fetchDeputados';
import { setGlobalDispatcher } from 'undici';
import { dispatcher } from './proxy.agent';

const URL = 'https://dadosabertos.camara.leg.br/api/v2';
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Obtenha uma referência para o Realtime Database

interface Deputa {
  id: number;
  nome: string;
  email: string;
  urlFoto: string;
}

async function fetchDespesa(putaId: number) {
  const res = await fetch(`${URL}/deputados/${putaId}/despesas`);
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

    resumo.porTipoDespesa[tipoDespesa] ??= { total: 0, quantidade: 0 };
    resumo.porTipoDespesa[tipoDespesa].total += valorLiquido;
    resumo.porTipoDespesa[tipoDespesa].quantidade++;

    resumo.porFornecedor[nomeFornecedor] ??= { total: 0, quantidade: 0, cnpjCpfFornecedor };
    resumo.porFornecedor[nomeFornecedor].total += valorLiquido;
    resumo.porFornecedor[nomeFornecedor].quantidade++;
  }

  return resumo;
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

  //Set Proxy Agent
  setGlobalDispatcher(dispatcher);

  for (const puta of deputados) {
    console.log(`🔍 Buscando despesas de ${puta.nome}...`);
    const despesa = await fetchDespesa(puta.id);
    const resumo = gerarResumo(despesa.dados, puta as Deputa);
    despesas.push(resumo);
  }

  // Função para escrever os dados JSON no Realtime Database
  const sanitizedJsonData = sanitizeKeys({
    updatedAt: new Date(),
    despesas: despesas,
  });

  // Chame a função para executar a operação
  writeJsonDataToDatabase(sanitizedJsonData);

  console.log(`✅ Resumo de ${despesas.length} deputados salvo`);
}

main();
