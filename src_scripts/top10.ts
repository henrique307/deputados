import deputados from "../resumoDaFestaDasPutas.json" with { type: "json" }

const top10Deputados = deputados
  .sort((a, b) => b.totalGeral - a.totalGeral)
  .slice(0, 10).map(puta => {
    return {
        nome: puta.nome,
        gasto: (puta.totalGeral).toFixed(2),
    }
  });

console.log(top10Deputados)