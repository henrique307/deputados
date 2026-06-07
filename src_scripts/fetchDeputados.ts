export const URL = "https://dadosabertos.camara.leg.br/api/v2";

interface Deputado {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email: string;
}

interface deputadoResponse {
  dados: Deputado[];
}

export async function fetchDeputados() {
  const res = await fetch(`${URL}/deputados`);
  const deputadosResponse: deputadoResponse = await res.json();

  const deputados = deputadosResponse.dados.map((deputado) => ({
    id: deputado.id,
    nome: deputado.nome,
    email: deputado.email,
    urlFoto: deputado.urlFoto,
  }));

  console.log(`✅ ${deputados.length} deputados salvos`);

  return deputados;
}