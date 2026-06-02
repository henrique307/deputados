import { readFile, writeFile } from "fs/promises";

export const URL = "https://dadosabertos.camara.leg.br/api/v2";

async function fetchPutas() {
    const res = await fetch(`${URL}/deputados`);

    return await res.json()
}

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
    dados: Deputa[]
}

const putasDesorganizadas: PutasResponse = await fetchPutas();
const putasOrganizadas = putasDesorganizadas.dados.map(puta => {
    return {
        id: puta.id,
        nome: puta.nome,
        email: puta.email
    }
})

console.log(putasOrganizadas)

await writeFile(
  "deputados.json",
  JSON.stringify(putasOrganizadas, null, 2),
  "utf-8"
);

export {}