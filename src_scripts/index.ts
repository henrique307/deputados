import { writeFile } from "fs/promises";

export const URL = "https://dadosabertos.camara.leg.br/api/v2";

interface Deputa {
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

interface PutasResponse {
  dados: Deputa[];
}

async function main() {
  const res = await fetch(`${URL}/deputados`);
  const putasDesorganizadas: PutasResponse = await res.json();

  const putasOrganizadas = putasDesorganizadas.dados.map((puta) => ({
    id: puta.id,
    nome: puta.nome,
    email: puta.email,
    urlFoto: puta.urlFoto,
  }));

  await writeFile(
    "deputados.json",
    JSON.stringify(putasOrganizadas, null, 2),
    "utf-8"
  );

  console.log(`✅ ${putasOrganizadas.length} deputados salvos`);
}

main();