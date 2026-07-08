const { obterDadosParaRelatorio } = require("../mob/AchadosPerdidosMobileBack/dist/controllers/relatorioController");

async function main() {
  const [dataInicio = "2000-01-01", dataFim = "2100-12-31", tipo = "TODOS"] = process.argv.slice(2);

  const req = {
    query: {
      dataInicio,
      dataFim,
      tipo,
    },
  };

  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };

  await obterDadosParaRelatorio(req, res);

  if (res.statusCode !== 200) {
    console.error(JSON.stringify({ statusCode: res.statusCode, payload: res.payload }, null, 2));
    process.exit(1);
  }

  const dados = res.payload;
  const resultado = {
    tipo: dados.tipoRelatorio,
    protocolo: dados.protocoloRelatorio,
    periodo: dados.periodoDescricao,
    tempo: dados.tempoPeriodo,
    totalItens: dados.resumo.totalItens,
    totalEntregas: dados.resumo.totalEntregas,
    totalRequisicoes: dados.resumo.totalRequisicoes,
    totalEncaminhamentos: dados.resumo.totalEncaminhamentos,
    totalItensPendentes: dados.resumo.totalItensPendentes,
    totalItensDevolvidos: dados.resumo.totalItensDevolvidos,
    totalItensFinalizados: dados.resumo.totalItensFinalizados,
    itensCount: dados.itensCadastrados.length,
    entregasCount: dados.entregas.length,
    requisicoesCount: dados.requisicoes.length,
    encaminhamentosCount: dados.encaminhamentos.length,
    primeiroItem: dados.itensCadastrados[0]?.nome ?? "",
    primeiraEntrega: dados.entregas[0]?.codigoAutenticacao ?? "",
    primeiraRequisicao: dados.requisicoes[0]?.codigoRequisicao ?? "",
    primeiroEncaminhamento: dados.encaminhamentos[0]?.destino ?? "",
  };

  console.log(JSON.stringify(resultado));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
