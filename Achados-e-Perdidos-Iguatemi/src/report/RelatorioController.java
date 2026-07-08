package report;

import dao.*;
import model.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

public class RelatorioController {

    private ItemPerdidoDao itemDao;
    private EntregaDao entregaDao;
    private RequisicaoClienteDao requisicaoDao;
    private ItemDestinadoDao destinadoDao;
    private UsuarioDao usuarioDao;
    private ProprietarioDao proprietarioDao;
    private DestinoFinalDao destinoDao;
    private LocalShoppingDao localDao;
    private TipoObjetoDao tipoDao;
    private CaixaArmazenamentoDao caixaDao;

    public RelatorioController() {
        this.itemDao = new ItemPerdidoDao();
        this.entregaDao = new EntregaDao();
        this.requisicaoDao = new RequisicaoClienteDao();
        this.destinadoDao = new ItemDestinadoDao();
        this.usuarioDao = new UsuarioDao();
        this.proprietarioDao = new ProprietarioDao();
        this.destinoDao = new DestinoFinalDao();
        this.localDao = new LocalShoppingDao();
        this.tipoDao = new TipoObjetoDao();
        this.caixaDao = new CaixaArmazenamentoDao();
    }

    /**
     * Gera todos os dados do relatório para o período especificado e tipo selecionado
     */
    public RelatorioDTO gerarDadosRelatorio(Date dataInicio, Date dataFim, RelatorioDTO.TipoRelatorio tipo) {
        RelatorioDTO relatorio = new RelatorioDTO();
        relatorio.setDataInicio(dataInicio);
        relatorio.setDataFim(dataFim);
        relatorio.setDataGeracao(new Date());
        relatorio.setProtocoloRelatorio(gerarProtocoloRelatorio(tipo, dataInicio, dataFim));
        relatorio.setPeriodoDescricao(formatarPeriodo(dataInicio, dataFim));
        relatorio.setTempoPeriodo(calcularTempoPermanencia(dataInicio, dataFim));
        relatorio.setTipoRelatorio(tipo);

        switch (tipo) {
            case ITENS_CADASTRADOS:
                relatorio.setItensCadastrados(buscarItensCadastrados(dataInicio, dataFim));
                break;

            case ITENS_DEVOLVIDOS:
                relatorio.setEntregas(buscarEntregas(dataInicio, dataFim));
                break;

            case ITENS_REQUISITADOS:
                relatorio.setRequisicoes(buscarRequisicoes(dataInicio, dataFim));
                break;

            case ITENS_ENCAMINHADOS:
                relatorio.setEncaminhamentos(buscarEncaminhamentos(dataInicio, dataFim));
                break;

            case TODOS:
                relatorio.setItensCadastrados(buscarItensCadastrados(dataInicio, dataFim));
                relatorio.setEntregas(buscarEntregas(dataInicio, dataFim));
                relatorio.setRequisicoes(buscarRequisicoes(dataInicio, dataFim));
                relatorio.setEncaminhamentos(buscarEncaminhamentos(dataInicio, dataFim));
                break;
        }

        preencherEstatisticasGerais(relatorio);
        return relatorio;
    }

    /**
     * Busca itens cadastrados no período com informações completas
     */
    private List<RelatorioDTO.ItemRelatorio> buscarItensCadastrados(Date dataInicio, Date dataFim) {
        List<ItemPerdido> itens = itemDao.listarItens();
        List<RelatorioDTO.ItemRelatorio> itensFiltrados = new ArrayList<>();

        // Carregar caches para evitar múltiplas consultas
        Map<Integer, String> locaisMap = localDao.listarLocais().stream()
                .collect(Collectors.toMap(LocalShopping::getId, LocalShopping::getNome));
        Map<Integer, String> tiposMap = tipoDao.listarTipos().stream()
                .collect(Collectors.toMap(TipoObjeto::getId, TipoObjeto::getNome));
        Map<Integer, String> caixasMap = caixaDao.listarCaixas().stream()
                .collect(Collectors.toMap(CaixaArmazenamento::getId,
                        c -> "Caixa " + c.getNumero() + " - " + (c.getDescricao() != null ? c.getDescricao() : "Sem descrição")));

        for (ItemPerdido item : itens) {
            if (isBetween(item.getDataRegistro(), dataInicio, dataFim)) {
                RelatorioDTO.ItemRelatorio ir = new RelatorioDTO.ItemRelatorio();

                // Informações básicas
                ir.setId(item.getId());
                ir.setNumeroRegistro(item.getNumeroRegistro());
                ir.setNome(item.getNome());
                ir.setMarca(item.getMarca() != null ? item.getMarca() : "-");
                ir.setDataRegistro(item.getDataRegistro());
                ir.setNumeroLacre(item.getNumeroLacre());
                ir.setEstadoConservacao(item.getEstadoConservacao());
                ir.setObservacao(item.getObservacao() != null ? item.getObservacao() : "-");
                ir.setSituacao(getSituacaoNome(item.getSituacaoId()));

                // Localização
                ir.setLocalEncontrado(locaisMap.getOrDefault(item.getLocalId(), "-"));
                ir.setTipoObjeto(tiposMap.getOrDefault(item.getTipoId(), "-"));
                ir.setCaixaArmazenamento(item.getCaixaId() != null ?
                        caixasMap.getOrDefault(item.getCaixaId(), "Caixa desconhecida") : "Nenhuma");

                // Responsável
                String responsavelCadastro = item.getResponsavelCadastro();
                if (responsavelCadastro == null || responsavelCadastro.trim().isEmpty()) {
                    Usuario resp = usuarioDao.buscarPorId(item.getUsuarioResponsavelId());
                    responsavelCadastro = resp != null ? resp.getNome() : "Desconhecido";
                }
                ir.setResponsavelCadastro(responsavelCadastro);
                ir.setNomeEntregador(item.getNomeEntregador() != null ? item.getNomeEntregador() : "Não informado");
                ir.setAssinaturaOperador(item.getAssinaturaOperador() != null ? item.getAssinaturaOperador() : "-");
                ir.setUsuarioResponsavelId(item.getUsuarioResponsavelId());

                // Foto
                ir.setCaminhoFoto(item.getCaminhoFoto());

                // Se o item foi devolvido, buscar informações da entrega
                if (item.getSituacaoId() == 4) { // Devolvido
                    buscarInfoEntregaParaItem(ir, item.getId());
                }

                // Se o item foi encaminhado, buscar informações do encaminhamento
                if (item.getSituacaoId() == 5) { // Finalizado (encaminhado)
                    buscarInfoEncaminhamentoParaItem(ir, item.getId());
                }

                Date dataFinal = ir.getDataDevolucao() != null ? ir.getDataDevolucao() :
                        (ir.getDataEncaminhamento() != null ? ir.getDataEncaminhamento() : dataFim);
                ir.setTempoPermanencia(calcularTempoPermanencia(item.getDataRegistro(), dataFinal));

                itensFiltrados.add(ir);
            }
        }

        itensFiltrados.sort((a, b) -> b.getDataRegistro().compareTo(a.getDataRegistro()));
        return itensFiltrados;
    }

    /**
     * Busca informações de entrega para um item devolvido
     */
    private void buscarInfoEntregaParaItem(RelatorioDTO.ItemRelatorio ir, int itemId) {
        List<Entrega> entregas = entregaDao.listarEntregas();

        Optional<Entrega> entregaOpt = entregas.stream()
                .filter(e -> e.getItemId() == itemId)
                .findFirst();

        if (entregaOpt.isPresent()) {
            Entrega entrega = entregaOpt.get();
            ir.setDataDevolucao(entrega.getDataEntrega());
            ir.setCodigoAutenticacaoEntrega(entrega.getCodigoAutenticacao());

            Proprietario prop = proprietarioDao.buscarPorId(entrega.getProprietarioId());
            if (prop != null) {
                ir.setProprietarioNome(prop.getNome());
                ir.setProprietarioTelefone(prop.getTelefone());
                ir.setProprietarioCpf(prop.getCpf() != null ? prop.getCpf() : "-");
                ir.setProprietarioRg(prop.getRg() != null ? prop.getRg() : "-");
            }

            ir.setFotoEntrega(entregaDao.getCaminhoFotoEntrega(entrega.getId()));
        }
    }

    /**
     * Busca informações de encaminhamento para um item finalizado
     */
    private void buscarInfoEncaminhamentoParaItem(RelatorioDTO.ItemRelatorio ir, int itemId) {
        List<ItemDestinado> destinados = destinadoDao.listarItensDestinados();

        Optional<ItemDestinado> destOpt = destinados.stream()
                .filter(d -> d.getItemId() == itemId)
                .findFirst();

        if (destOpt.isPresent()) {
            ItemDestinado dest = destOpt.get();
            ir.setDataEncaminhamento(dest.getDataEnvio());
            ir.setDataInventario(dest.getDataInventario());

            DestinoFinal destino = destinoDao.buscarPorId(dest.getDestinoId());
            ir.setDestinoFinal(destino != null ? destino.getNome() : "Desconhecido");
        }
    }

    /**
     * Busca entregas (devoluções) no período com informações completas
     */
    private List<RelatorioDTO.EntregaRelatorio> buscarEntregas(Date dataInicio, Date dataFim) {
        List<Entrega> entregas = entregaDao.listarEntregas();
        List<RelatorioDTO.EntregaRelatorio> entregasFiltradas = new ArrayList<>();

        for (Entrega entrega : entregas) {
            if (isBetween(entrega.getDataEntrega(), dataInicio, dataFim)) {
                RelatorioDTO.EntregaRelatorio er = new RelatorioDTO.EntregaRelatorio();
                er.setDataEntrega(entrega.getDataEntrega());
                er.setCodigoAutenticacao(entrega.getCodigoAutenticacao());

                Proprietario prop = proprietarioDao.buscarPorId(entrega.getProprietarioId());
                if (prop != null) {
                    er.setProprietario(prop.getNome());
                    er.setProprietarioTelefone(prop.getTelefone());
                    er.setProprietarioCpf(prop.getCpf() != null ? prop.getCpf() : "-");
                    er.setProprietarioRg(prop.getRg() != null ? prop.getRg() : "-");
                }

                ItemPerdido item = itemDao.buscarPorId(entrega.getItemId());
                if (item != null) {
                    er.setItem(item.getNome());
                    er.setMarcaItem(item.getMarca() != null ? item.getMarca() : "-");
                    er.setDataCadastroItem(item.getDataRegistro());
                    er.setNumeroRegistro(item.getNumeroRegistro());
                    er.setNumeroLacre(item.getNumeroLacre());
                    er.setEstadoConservacao(item.getEstadoConservacao());
                    er.setObservacaoItem(item.getObservacao() != null ? item.getObservacao() : "-");
                    er.setNomeEntregador(item.getNomeEntregador() != null ? item.getNomeEntregador() : "Não informado");
                    er.setAssinaturaOperadorCadastro(item.getAssinaturaOperador() != null ? item.getAssinaturaOperador() : "-");
                    er.setTempoPermanencia(calcularTempoPermanencia(item.getDataRegistro(), entrega.getDataEntrega()));
                    er.setLocalEncontrado(buscarNomeLocal(item.getLocalId()));
                    er.setTipoObjeto(buscarNomeTipo(item.getTipoId()));
                    er.setCaixaArmazenamento(buscarNomeCaixa(item.getCaixaId()));
                    er.setCaminhoFotoItem(item.getCaminhoFoto());
                }

                er.setCaminhoFotoEntrega(entregaDao.getCaminhoFotoEntrega(entrega.getId()));

                Usuario resp = usuarioDao.buscarPorId(entrega.getUsuarioId());
                er.setResponsavel(resp != null ? resp.getNome() : "Desconhecido");

                entregasFiltradas.add(er);
            }
        }

        entregasFiltradas.sort((a, b) -> b.getDataEntrega().compareTo(a.getDataEntrega()));
        return entregasFiltradas;
    }

    /**
     * Busca requisições no período
     */
    private List<RelatorioDTO.RequisicaoRelatorio> buscarRequisicoes(Date dataInicio, Date dataFim) {
        List<RequisicaoCliente> requisicoes = requisicaoDao.listarTodasRequisicoes();
        List<RelatorioDTO.RequisicaoRelatorio> requisicoesFiltradas = new ArrayList<>();

        for (RequisicaoCliente req : requisicoes) {
            if (isBetween(req.getDataRequisicao(), dataInicio, dataFim)) {
                RelatorioDTO.RequisicaoRelatorio rr = new RelatorioDTO.RequisicaoRelatorio();
                rr.setDataRequisicao(req.getDataRequisicao());
                rr.setCodigoRequisicao(req.getCodigoRequisicao());
                rr.setCliente(req.getNomeCliente());
                rr.setTelefone(req.getTelefone());
                rr.setCategoriaObjeto(req.getCategoriaObjeto() != null ? req.getCategoriaObjeto() : "-");
                rr.setDescricao(req.getDescricao());
                rr.setEncontrado(req.isEncontrado());
                rr.setResponsavelCadastro(req.getResponsavelCadastro() != null ? req.getResponsavelCadastro() : "Não informado");
                rr.setAssinaturaOperador(req.getAssinaturaOperador() != null ? req.getAssinaturaOperador() : "-");

                if (req.getItemId() != null) {
                    ItemPerdido item = itemDao.buscarPorId(req.getItemId());
                    if (item != null) {
                        rr.setItemEncontrado(item.getNome());
                        rr.setNumeroRegistroItem(String.valueOf(item.getNumeroRegistro()));
                        rr.setNumeroLacre(String.valueOf(item.getNumeroLacre()));
                        rr.setCaminhoFotoItem(item.getCaminhoFoto());
                    }
                } else {
                    rr.setItemEncontrado("-");
                    rr.setNumeroRegistroItem("-");
                    rr.setNumeroLacre("-");
                }

                requisicoesFiltradas.add(rr);
            }
        }

        requisicoesFiltradas.sort((a, b) -> b.getDataRequisicao().compareTo(a.getDataRequisicao()));
        return requisicoesFiltradas;
    }

    /**
     * Busca encaminhamentos no período com informações completas
     */
    private List<RelatorioDTO.EncaminhamentoRelatorio> buscarEncaminhamentos(Date dataInicio, Date dataFim) {
        List<ItemDestinado> encaminhamentos = destinadoDao.listarItensDestinados();
        List<RelatorioDTO.EncaminhamentoRelatorio> encaminhamentosFiltrados = new ArrayList<>();

        for (ItemDestinado enc : encaminhamentos) {
            if (isBetween(enc.getDataEnvio(), dataInicio, dataFim)) {
                RelatorioDTO.EncaminhamentoRelatorio er = new RelatorioDTO.EncaminhamentoRelatorio();
                er.setDataEnvio(enc.getDataEnvio());
                er.setDataInventario(enc.getDataInventario());

                ItemPerdido item = itemDao.buscarPorId(enc.getItemId());
                if (item != null) {
                    er.setItem(item.getNome());
                    er.setDataCadastroItem(item.getDataRegistro());
                    er.setTempoPermanencia(calcularTempoPermanencia(item.getDataRegistro(), enc.getDataEnvio()));
                    er.setNumeroRegistro(item.getNumeroRegistro());
                    er.setNumeroLacre(item.getNumeroLacre());
                    er.setLocalEncontrado(buscarNomeLocal(item.getLocalId()));
                    er.setTipoObjeto(buscarNomeTipo(item.getTipoId()));
                    er.setCaixaArmazenamento(buscarNomeCaixa(item.getCaixaId()));
                    er.setCaminhoFotoItem(item.getCaminhoFoto());
                }

                DestinoFinal dest = destinoDao.buscarPorId(enc.getDestinoId());
                er.setDestino(dest != null ? dest.getNome() : "Desconhecido");
                er.setResponsavelEncaminhamento(enc.getResponsavelEncaminhamento() != null ?
                        enc.getResponsavelEncaminhamento() : "Não informado");

                encaminhamentosFiltrados.add(er);
            }
        }

        encaminhamentosFiltrados.sort((a, b) -> b.getDataEnvio().compareTo(a.getDataEnvio()));
        return encaminhamentosFiltrados;
    }

    /**
     * Verifica se uma data está entre duas datas
     */
    private boolean isBetween(Date data, Date inicio, Date fim) {
        if (data == null) return false;
        return !data.before(inicio) && !data.after(fim);
    }

    /**
     * Converte o ID da situação para nome legível
     */
    private String getSituacaoNome(int situacaoId) {
        switch (situacaoId) {
            case 1: return "No prazo";
            case 2: return "Vence hoje";
            case 3: return "Vencido";
            case 4: return "Devolvido";
            case 5: return "Finalizado";
            default: return "Desconhecida";
        }
    }

    private void preencherEstatisticasGerais(RelatorioDTO relatorio) {
        if (relatorio.getItensCadastrados() != null) {
            int pendentes = 0;
            int devolvidos = 0;
            int finalizados = 0;

            for (RelatorioDTO.ItemRelatorio item : relatorio.getItensCadastrados()) {
                if ("Devolvido".equals(item.getSituacao())) {
                    devolvidos++;
                } else if ("Finalizado".equals(item.getSituacao())) {
                    finalizados++;
                } else {
                    pendentes++;
                }
            }

            relatorio.setTotalItensPendentes(pendentes);
            relatorio.setTotalItensDevolvidos(devolvidos);
            relatorio.setTotalItensFinalizados(finalizados);
            return;
        }

        relatorio.setTotalItensPendentes(relatorio.getRequisicoes() != null ? relatorio.getTotalRequisicoes() : 0);
        relatorio.setTotalItensDevolvidos(relatorio.getEntregas() != null ? relatorio.getTotalEntregas() : 0);
        relatorio.setTotalItensFinalizados(relatorio.getEncaminhamentos() != null ? relatorio.getTotalEncaminhamentos() : 0);
    }

    private String gerarProtocoloRelatorio(RelatorioDTO.TipoRelatorio tipo, Date dataInicio, Date dataFim) {
        String prefixo = tipo != null ? tipo.name().replace("ITENS_", "").replace("TODOS", "GERAL") : "GERAL";
        String gerado = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
        String inicio = new SimpleDateFormat("yyyyMMdd").format(dataInicio);
        String fim = new SimpleDateFormat("yyyyMMdd").format(dataFim);
        return "REL-" + prefixo + "-" + inicio + "-" + fim + "-" + gerado;
    }

    private String formatarPeriodo(Date dataInicio, Date dataFim) {
        SimpleDateFormat formato = new SimpleDateFormat("dd/MM/yyyy HH:mm");
        return formato.format(dataInicio) + " até " + formato.format(dataFim);
    }

    private String calcularTempoPermanencia(Date inicio, Date fim) {
        if (inicio == null || fim == null) {
            return "-";
        }

        long diferencaMillis = Math.max(0, fim.getTime() - inicio.getTime());
        long totalHoras = diferencaMillis / (1000L * 60L * 60L);
        long dias = totalHoras / 24L;
        long horas = totalHoras % 24L;

        if (dias > 0) {
            return dias + " dia(s) e " + horas + " hora(s)";
        }
        if (totalHoras > 0) {
            return totalHoras + " hora(s)";
        }
        return "Menos de 1 hora";
    }

    private String buscarNomeLocal(int localId) {
        return localDao.listarLocais().stream()
                .filter(local -> local.getId() == localId)
                .map(LocalShopping::getNome)
                .findFirst()
                .orElse("-");
    }

    private String buscarNomeTipo(int tipoId) {
        return tipoDao.listarTipos().stream()
                .filter(tipo -> tipo.getId() == tipoId)
                .map(TipoObjeto::getNome)
                .findFirst()
                .orElse("-");
    }

    private String buscarNomeCaixa(Integer caixaId) {
        if (caixaId == null) {
            return "Nenhuma";
        }

        return caixaDao.listarCaixas().stream()
                .filter(caixa -> caixa.getId() == caixaId)
                .map(caixa -> "Caixa " + caixa.getNumero() + " - " +
                        (caixa.getDescricao() != null ? caixa.getDescricao() : "Sem descrição"))
                .findFirst()
                .orElse("Caixa desconhecida");
    }

    /**
     * Método para compatibilidade com código antigo
     */
    public RelatorioDTO gerarDadosRelatorio(Date dataInicio, Date dataFim) {
        return gerarDadosRelatorio(dataInicio, dataFim, RelatorioDTO.TipoRelatorio.TODOS);
    }
}
