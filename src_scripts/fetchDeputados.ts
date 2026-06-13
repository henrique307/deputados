export const URL = "https://dadosabertos.camara.leg.br/api/v2";

export async function fetchDeputados(): Promise<DeputadosResponse> {
  const res = await fetch(`${URL}/deputados`);
  const deputadosResponse: DeputadosResponse = await res.json();
  return deputadosResponse;
}