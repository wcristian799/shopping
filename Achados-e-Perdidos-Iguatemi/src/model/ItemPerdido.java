package model;

import java.util.Date;

public class ItemPerdido {
    private int id;
    private int numeroRegistro;
    private String nome;
    private String marca;
    private Date dataRegistro;
    private int numeroLacre;
    private String estadoConservacao;
    private String observacao;
    private String nomeEntregador;
    private String responsavelCadastro;
    private int localId;
    private int situacaoId;
    private int usuarioResponsavelId;
    private Integer operadorId;
    private String assinaturaOperador;
    private int tipoId;
    private Integer caixaId;
    private boolean ativo;

    public ItemPerdido() {}

    public ItemPerdido(int id, int numeroRegistro, String nome, String marca, Date dataRegistro, int numeroLacre,
                       String estadoConservacao, String observacao,  String nomeEntregador, int localId, int situacaoId,
                       int usuarioResponsavelId, int tipoId, Integer caixaId, boolean ativo) {
        this.id = id;
        this.numeroRegistro = numeroRegistro;
        this.nome = nome;
        this.marca = marca;
        this.dataRegistro = dataRegistro;
        this.numeroLacre = numeroLacre;
        this.estadoConservacao = estadoConservacao;
        this.observacao = observacao;
        this.nomeEntregador = nomeEntregador;

        this.localId = localId;
        this.situacaoId = situacaoId;
        this.usuarioResponsavelId = usuarioResponsavelId;
        this.tipoId = tipoId;
        this.caixaId = caixaId;
        this.ativo = ativo;
    }

    private String caminhoFoto;  // TEMPORÁRIO - vem do JOIN no DAO

    public String getResponsavelCadastro() { return responsavelCadastro; }
    public void setResponsavelCadastro(String responsavelCadastro) { this.responsavelCadastro = responsavelCadastro; }

    public Integer getOperadorId() { return operadorId; }
    public void setOperadorId(Integer operadorId) { this.operadorId = operadorId; }

    public String getAssinaturaOperador() { return assinaturaOperador; }
    public void setAssinaturaOperador(String assinaturaOperador) { this.assinaturaOperador = assinaturaOperador; }

    public String getNomeEntregador() { return nomeEntregador; }
    public void setNomeEntregador(String nomeEntregador) { this.nomeEntregador = nomeEntregador;}

        public String getCaminhoFoto() {
        return caminhoFoto;
    }

    public void setCaminhoFoto(String caminhoFoto) {
        this.caminhoFoto = caminhoFoto;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getNumeroRegistro() {
        return numeroRegistro;
    }

    public void setNumeroRegistro(int numeroRegistro) {
        this.numeroRegistro = numeroRegistro;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public Date getDataRegistro() {
        return dataRegistro;
    }

    public void setDataRegistro(Date dataRegistro) {
        this.dataRegistro = dataRegistro;
    }

    public int getNumeroLacre() {
        return numeroLacre;
    }

    public void setNumeroLacre(int numeroLacre) {
        this.numeroLacre = numeroLacre;
    }

    public String getEstadoConservacao() {
        return estadoConservacao;
    }

    public void setEstadoConservacao(String estadoConservacao) {
        this.estadoConservacao = estadoConservacao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public int getLocalId() {
        return localId;
    }

    public void setLocalId(int localId) {
        this.localId = localId;
    }

    public int getSituacaoId() {
        return situacaoId;
    }

    public void setSituacaoId(int situacaoId) {
        this.situacaoId = situacaoId;
    }

    public int getUsuarioResponsavelId() {
        return usuarioResponsavelId;
    }

    public void setUsuarioResponsavelId(int usuarioResponsavelId) {
        this.usuarioResponsavelId = usuarioResponsavelId;
    }

    public int getTipoId() {
        return tipoId;
    }

    public void setTipoId(int tipoId) {
        this.tipoId = tipoId;
    }

    public Integer getCaixaId() {
        return caixaId;
    }

    public void setCaixaId(Integer caixaId) {
        this.caixaId = caixaId;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
