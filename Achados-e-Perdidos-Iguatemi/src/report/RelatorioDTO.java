package report;

import java.util.Date;
import java.util.List;

public class RelatorioDTO {

    // Enum para tipos de relatório
    public enum TipoRelatorio {
        ITENS_CADASTRADOS("Itens Cadastrados"),
        ITENS_DEVOLVIDOS("Itens Devolvidos"),
        ITENS_REQUISITADOS("Requisições de Clientes"),
        ITENS_ENCAMINHADOS("Itens Encaminhados"),
        TODOS("Relatório Completo");

        private final String descricao;

        TipoRelatorio(String descricao) {
            this.descricao = descricao;
        }

        public String getDescricao() {
            return descricao;
        }
    }

    private Date dataInicio;
    private Date dataFim;
    private Date dataGeracao;
    private String protocoloRelatorio;
    private String periodoDescricao;
    private String tempoPeriodo;
    private TipoRelatorio tipoRelatorio;

    // Dados do relatório
    private List<ItemRelatorio> itensCadastrados;
    private List<EntregaRelatorio> entregas;
    private List<RequisicaoRelatorio> requisicoes;
    private List<EncaminhamentoRelatorio> encaminhamentos;

    // Estatísticas
    private int totalItens;
    private int totalEntregas;
    private int totalRequisicoes;
    private int totalEncaminhamentos;
    private int totalItensPendentes;
    private int totalItensDevolvidos;
    private int totalItensFinalizados;

    // Construtor vazio
    public RelatorioDTO() {}

    // --- Classes internas para os dados ---

    public static class ItemRelatorio {
        // Informações básicas do item
        private int id;
        private int numeroRegistro;
        private String nome;
        private String marca;
        private Date dataRegistro;
        private int numeroLacre;
        private String estadoConservacao;
        private String observacao;
        private String situacao;

        // Informações de localização
        private String localEncontrado;
        private String tipoObjeto;
        private String caixaArmazenamento;

        // Informações de responsável
        private String responsavelCadastro;
        private String nomeEntregador;
        private String assinaturaOperador;
        private String tempoPermanencia;
        private int usuarioResponsavelId;

        // Foto
        private String caminhoFoto;

        // Histórico de movimentações (para itens devolvidos ou encaminhados)
        private Date dataDevolucao;
        private String proprietarioNome;
        private String proprietarioTelefone;
        private String proprietarioCpf;
        private String proprietarioRg;
        private String codigoAutenticacaoEntrega;
        private String fotoEntrega;

        private Date dataEncaminhamento;
        private String destinoFinal;
        private Date dataInventario;

        // Getters e Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }

        public int getNumeroRegistro() { return numeroRegistro; }
        public void setNumeroRegistro(int numeroRegistro) { this.numeroRegistro = numeroRegistro; }

        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }

        public String getMarca() { return marca; }
        public void setMarca(String marca) { this.marca = marca; }

        public Date getDataRegistro() { return dataRegistro; }
        public void setDataRegistro(Date dataRegistro) { this.dataRegistro = dataRegistro; }

        public int getNumeroLacre() { return numeroLacre; }
        public void setNumeroLacre(int numeroLacre) { this.numeroLacre = numeroLacre; }

        public String getEstadoConservacao() { return estadoConservacao; }
        public void setEstadoConservacao(String estadoConservacao) { this.estadoConservacao = estadoConservacao; }

        public String getObservacao() { return observacao; }
        public void setObservacao(String observacao) { this.observacao = observacao; }

        public String getSituacao() { return situacao; }
        public void setSituacao(String situacao) { this.situacao = situacao; }

        public String getLocalEncontrado() { return localEncontrado; }
        public void setLocalEncontrado(String localEncontrado) { this.localEncontrado = localEncontrado; }

        public String getTipoObjeto() { return tipoObjeto; }
        public void setTipoObjeto(String tipoObjeto) { this.tipoObjeto = tipoObjeto; }

        public String getCaixaArmazenamento() { return caixaArmazenamento; }
        public void setCaixaArmazenamento(String caixaArmazenamento) { this.caixaArmazenamento = caixaArmazenamento; }

        public String getResponsavelCadastro() { return responsavelCadastro; }
        public void setResponsavelCadastro(String responsavelCadastro) { this.responsavelCadastro = responsavelCadastro; }

        public String getNomeEntregador() { return nomeEntregador; }
        public void setNomeEntregador(String nomeEntregador) { this.nomeEntregador = nomeEntregador; }

        public String getAssinaturaOperador() { return assinaturaOperador; }
        public void setAssinaturaOperador(String assinaturaOperador) { this.assinaturaOperador = assinaturaOperador; }

        public String getTempoPermanencia() { return tempoPermanencia; }
        public void setTempoPermanencia(String tempoPermanencia) { this.tempoPermanencia = tempoPermanencia; }

        public int getUsuarioResponsavelId() { return usuarioResponsavelId; }
        public void setUsuarioResponsavelId(int usuarioResponsavelId) { this.usuarioResponsavelId = usuarioResponsavelId; }

        public String getCaminhoFoto() { return caminhoFoto; }
        public void setCaminhoFoto(String caminhoFoto) { this.caminhoFoto = caminhoFoto; }

        // Histórico de movimentações
        public Date getDataDevolucao() { return dataDevolucao; }
        public void setDataDevolucao(Date dataDevolucao) { this.dataDevolucao = dataDevolucao; }

        public String getProprietarioNome() { return proprietarioNome; }
        public void setProprietarioNome(String proprietarioNome) { this.proprietarioNome = proprietarioNome; }

        public String getProprietarioTelefone() { return proprietarioTelefone; }
        public void setProprietarioTelefone(String proprietarioTelefone) { this.proprietarioTelefone = proprietarioTelefone; }

        public String getProprietarioCpf() { return proprietarioCpf; }
        public void setProprietarioCpf(String proprietarioCpf) { this.proprietarioCpf = proprietarioCpf; }

        public String getProprietarioRg() { return proprietarioRg; }
        public void setProprietarioRg(String proprietarioRg) { this.proprietarioRg = proprietarioRg; }

        public String getCodigoAutenticacaoEntrega() { return codigoAutenticacaoEntrega; }
        public void setCodigoAutenticacaoEntrega(String codigoAutenticacaoEntrega) { this.codigoAutenticacaoEntrega = codigoAutenticacaoEntrega; }

        public String getFotoEntrega() { return fotoEntrega; }
        public void setFotoEntrega(String fotoEntrega) { this.fotoEntrega = fotoEntrega; }

        public Date getDataEncaminhamento() { return dataEncaminhamento; }
        public void setDataEncaminhamento(Date dataEncaminhamento) { this.dataEncaminhamento = dataEncaminhamento; }

        public String getDestinoFinal() { return destinoFinal; }
        public void setDestinoFinal(String destinoFinal) { this.destinoFinal = destinoFinal; }

        public Date getDataInventario() { return dataInventario; }
        public void setDataInventario(Date dataInventario) { this.dataInventario = dataInventario; }
    }

    // As outras classes (EntregaRelatorio, RequisicaoRelatorio, EncaminhamentoRelatorio)
    // permanecem iguais às versões anteriores
    public static class EntregaRelatorio {
        private Date dataEntrega;
        private String codigoAutenticacao;
        private String proprietario;
        private String proprietarioTelefone;
        private String proprietarioCpf;
        private String proprietarioRg;
        private String item;
        private int numeroRegistro;
        private int numeroLacre;
        private String responsavel;
        private Date dataCadastroItem;
        private String tempoPermanencia;
        private String localEncontrado;
        private String tipoObjeto;
        private String caixaArmazenamento;
        private String marcaItem;
        private String estadoConservacao;
        private String observacaoItem;
        private String nomeEntregador;
        private String assinaturaOperadorCadastro;
        private String caminhoFotoEntrega;
        private String caminhoFotoItem;

        // Getters e Setters
        public Date getDataEntrega() { return dataEntrega; }
        public void setDataEntrega(Date dataEntrega) { this.dataEntrega = dataEntrega; }

        public String getCodigoAutenticacao() { return codigoAutenticacao; }
        public void setCodigoAutenticacao(String codigoAutenticacao) { this.codigoAutenticacao = codigoAutenticacao; }

        public String getProprietario() { return proprietario; }
        public void setProprietario(String proprietario) { this.proprietario = proprietario; }

        public String getProprietarioTelefone() { return proprietarioTelefone; }
        public void setProprietarioTelefone(String proprietarioTelefone) { this.proprietarioTelefone = proprietarioTelefone; }

        public String getProprietarioCpf() { return proprietarioCpf; }
        public void setProprietarioCpf(String proprietarioCpf) { this.proprietarioCpf = proprietarioCpf; }

        public String getProprietarioRg() { return proprietarioRg; }
        public void setProprietarioRg(String proprietarioRg) { this.proprietarioRg = proprietarioRg; }

        public String getItem() { return item; }
        public void setItem(String item) { this.item = item; }

        public int getNumeroRegistro() { return numeroRegistro; }
        public void setNumeroRegistro(int numeroRegistro) { this.numeroRegistro = numeroRegistro; }

        public int getNumeroLacre() { return numeroLacre; }
        public void setNumeroLacre(int numeroLacre) { this.numeroLacre = numeroLacre; }

        public String getResponsavel() { return responsavel; }
        public void setResponsavel(String responsavel) { this.responsavel = responsavel; }

        public Date getDataCadastroItem() { return dataCadastroItem; }
        public void setDataCadastroItem(Date dataCadastroItem) { this.dataCadastroItem = dataCadastroItem; }

        public String getTempoPermanencia() { return tempoPermanencia; }
        public void setTempoPermanencia(String tempoPermanencia) { this.tempoPermanencia = tempoPermanencia; }

        public String getLocalEncontrado() { return localEncontrado; }
        public void setLocalEncontrado(String localEncontrado) { this.localEncontrado = localEncontrado; }

        public String getTipoObjeto() { return tipoObjeto; }
        public void setTipoObjeto(String tipoObjeto) { this.tipoObjeto = tipoObjeto; }

        public String getCaixaArmazenamento() { return caixaArmazenamento; }
        public void setCaixaArmazenamento(String caixaArmazenamento) { this.caixaArmazenamento = caixaArmazenamento; }

        public String getMarcaItem() { return marcaItem; }
        public void setMarcaItem(String marcaItem) { this.marcaItem = marcaItem; }

        public String getEstadoConservacao() { return estadoConservacao; }
        public void setEstadoConservacao(String estadoConservacao) { this.estadoConservacao = estadoConservacao; }

        public String getObservacaoItem() { return observacaoItem; }
        public void setObservacaoItem(String observacaoItem) { this.observacaoItem = observacaoItem; }

        public String getNomeEntregador() { return nomeEntregador; }
        public void setNomeEntregador(String nomeEntregador) { this.nomeEntregador = nomeEntregador; }

        public String getAssinaturaOperadorCadastro() { return assinaturaOperadorCadastro; }
        public void setAssinaturaOperadorCadastro(String assinaturaOperadorCadastro) { this.assinaturaOperadorCadastro = assinaturaOperadorCadastro; }

        public String getCaminhoFotoEntrega() { return caminhoFotoEntrega; }
        public void setCaminhoFotoEntrega(String caminhoFotoEntrega) { this.caminhoFotoEntrega = caminhoFotoEntrega; }

        public String getCaminhoFotoItem() { return caminhoFotoItem; }
        public void setCaminhoFotoItem(String caminhoFotoItem) { this.caminhoFotoItem = caminhoFotoItem; }
    }

    public static class RequisicaoRelatorio {
        private Date dataRequisicao;
        private String codigoRequisicao;
        private String cliente;
        private String telefone;
        private String categoriaObjeto;
        private String descricao;
        private boolean encontrado;
        private String itemEncontrado;
        private String numeroRegistroItem;
        private String numeroLacre;
        private String responsavelCadastro;
        private String assinaturaOperador;
        private String caminhoFotoItem;

        public Date getDataRequisicao() { return dataRequisicao; }
        public void setDataRequisicao(Date dataRequisicao) { this.dataRequisicao = dataRequisicao; }

        public String getCodigoRequisicao() { return codigoRequisicao; }
        public void setCodigoRequisicao(String codigoRequisicao) { this.codigoRequisicao = codigoRequisicao; }

        public String getCliente() { return cliente; }
        public void setCliente(String cliente) { this.cliente = cliente; }

        public String getTelefone() { return telefone; }
        public void setTelefone(String telefone) { this.telefone = telefone; }

        public String getCategoriaObjeto() { return categoriaObjeto; }
        public void setCategoriaObjeto(String categoriaObjeto) { this.categoriaObjeto = categoriaObjeto; }

        public String getDescricao() { return descricao; }
        public void setDescricao(String descricao) { this.descricao = descricao; }

        public boolean isEncontrado() { return encontrado; }
        public void setEncontrado(boolean encontrado) { this.encontrado = encontrado; }

        public String getItemEncontrado() { return itemEncontrado; }
        public void setItemEncontrado(String itemEncontrado) { this.itemEncontrado = itemEncontrado; }

        public String getNumeroRegistroItem() { return numeroRegistroItem; }
        public void setNumeroRegistroItem(String numeroRegistroItem) { this.numeroRegistroItem = numeroRegistroItem; }

        public String getNumeroLacre() { return numeroLacre; }
        public void setNumeroLacre(String numeroLacre) { this.numeroLacre = numeroLacre; }

        public String getResponsavelCadastro() { return responsavelCadastro; }
        public void setResponsavelCadastro(String responsavelCadastro) { this.responsavelCadastro = responsavelCadastro; }

        public String getAssinaturaOperador() { return assinaturaOperador; }
        public void setAssinaturaOperador(String assinaturaOperador) { this.assinaturaOperador = assinaturaOperador; }

        public String getCaminhoFotoItem() { return caminhoFotoItem; }
        public void setCaminhoFotoItem(String caminhoFotoItem) { this.caminhoFotoItem = caminhoFotoItem; }
    }

    public static class EncaminhamentoRelatorio {
        private Date dataEnvio;
        private Date dataInventario;
        private Date dataCadastroItem;
        private String tempoPermanencia;
        private String item;
        private int numeroRegistro;
        private int numeroLacre;
        private String destino;
        private String localEncontrado;
        private String tipoObjeto;
        private String caixaArmazenamento;
        private String responsavelEncaminhamento;
        private String caminhoFotoItem;

        public Date getDataEnvio() { return dataEnvio; }
        public void setDataEnvio(Date dataEnvio) { this.dataEnvio = dataEnvio; }

        public Date getDataInventario() { return dataInventario; }
        public void setDataInventario(Date dataInventario) { this.dataInventario = dataInventario; }

        public Date getDataCadastroItem() { return dataCadastroItem; }
        public void setDataCadastroItem(Date dataCadastroItem) { this.dataCadastroItem = dataCadastroItem; }

        public String getTempoPermanencia() { return tempoPermanencia; }
        public void setTempoPermanencia(String tempoPermanencia) { this.tempoPermanencia = tempoPermanencia; }

        public String getItem() { return item; }
        public void setItem(String item) { this.item = item; }

        public int getNumeroRegistro() { return numeroRegistro; }
        public void setNumeroRegistro(int numeroRegistro) { this.numeroRegistro = numeroRegistro; }

        public int getNumeroLacre() { return numeroLacre; }
        public void setNumeroLacre(int numeroLacre) { this.numeroLacre = numeroLacre; }

        public String getDestino() { return destino; }
        public void setDestino(String destino) { this.destino = destino; }

        public String getLocalEncontrado() { return localEncontrado; }
        public void setLocalEncontrado(String localEncontrado) { this.localEncontrado = localEncontrado; }

        public String getTipoObjeto() { return tipoObjeto; }
        public void setTipoObjeto(String tipoObjeto) { this.tipoObjeto = tipoObjeto; }

        public String getCaixaArmazenamento() { return caixaArmazenamento; }
        public void setCaixaArmazenamento(String caixaArmazenamento) { this.caixaArmazenamento = caixaArmazenamento; }

        public String getResponsavelEncaminhamento() { return responsavelEncaminhamento; }
        public void setResponsavelEncaminhamento(String responsavelEncaminhamento) { this.responsavelEncaminhamento = responsavelEncaminhamento; }

        public String getCaminhoFotoItem() { return caminhoFotoItem; }
        public void setCaminhoFotoItem(String caminhoFotoItem) { this.caminhoFotoItem = caminhoFotoItem; }
    }

    // --- Getters e Setters principais ---

    public Date getDataInicio() { return dataInicio; }
    public void setDataInicio(Date dataInicio) { this.dataInicio = dataInicio; }

    public Date getDataFim() { return dataFim; }
    public void setDataFim(Date dataFim) { this.dataFim = dataFim; }

    public Date getDataGeracao() { return dataGeracao; }
    public void setDataGeracao(Date dataGeracao) { this.dataGeracao = dataGeracao; }

    public String getProtocoloRelatorio() { return protocoloRelatorio; }
    public void setProtocoloRelatorio(String protocoloRelatorio) { this.protocoloRelatorio = protocoloRelatorio; }

    public String getPeriodoDescricao() { return periodoDescricao; }
    public void setPeriodoDescricao(String periodoDescricao) { this.periodoDescricao = periodoDescricao; }

    public String getTempoPeriodo() { return tempoPeriodo; }
    public void setTempoPeriodo(String tempoPeriodo) { this.tempoPeriodo = tempoPeriodo; }

    public TipoRelatorio getTipoRelatorio() { return tipoRelatorio; }
    public void setTipoRelatorio(TipoRelatorio tipoRelatorio) { this.tipoRelatorio = tipoRelatorio; }

    public List<ItemRelatorio> getItensCadastrados() { return itensCadastrados; }
    public void setItensCadastrados(List<ItemRelatorio> itensCadastrados) {
        this.itensCadastrados = itensCadastrados;
        this.totalItens = itensCadastrados != null ? itensCadastrados.size() : 0;
    }

    public List<EntregaRelatorio> getEntregas() { return entregas; }
    public void setEntregas(List<EntregaRelatorio> entregas) {
        this.entregas = entregas;
        this.totalEntregas = entregas != null ? entregas.size() : 0;
    }

    public List<RequisicaoRelatorio> getRequisicoes() { return requisicoes; }
    public void setRequisicoes(List<RequisicaoRelatorio> requisicoes) {
        this.requisicoes = requisicoes;
        this.totalRequisicoes = requisicoes != null ? requisicoes.size() : 0;
    }

    public List<EncaminhamentoRelatorio> getEncaminhamentos() { return encaminhamentos; }
    public void setEncaminhamentos(List<EncaminhamentoRelatorio> encaminhamentos) {
        this.encaminhamentos = encaminhamentos;
        this.totalEncaminhamentos = encaminhamentos != null ? encaminhamentos.size() : 0;
    }

    public int getTotalItens() { return totalItens; }
    public int getTotalEntregas() { return totalEntregas; }
    public int getTotalRequisicoes() { return totalRequisicoes; }
    public int getTotalEncaminhamentos() { return totalEncaminhamentos; }

    public int getTotalItensPendentes() { return totalItensPendentes; }
    public void setTotalItensPendentes(int totalItensPendentes) { this.totalItensPendentes = totalItensPendentes; }

    public int getTotalItensDevolvidos() { return totalItensDevolvidos; }
    public void setTotalItensDevolvidos(int totalItensDevolvidos) { this.totalItensDevolvidos = totalItensDevolvidos; }

    public int getTotalItensFinalizados() { return totalItensFinalizados; }
    public void setTotalItensFinalizados(int totalItensFinalizados) { this.totalItensFinalizados = totalItensFinalizados; }
}
