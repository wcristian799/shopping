package model;

import java.util.Date;

public class RequisicaoCliente {
    private int id;
    private String codigoRequisicao;
    private String nomeCliente;
    private String telefone;
    private String categoriaObjeto;
    private String descricao;
    private String responsavelCadastro;
    private Integer operadorId;
    private String assinaturaOperador;
    private Integer numeroLacre;
    private Date dataRequisicao;
    private boolean encontrado;
    private Integer itemId;
    private boolean ativo;

    public RequisicaoCliente() {}

    public RequisicaoCliente(int id, String codigoRequisicao, String nomeCliente, String telefone,
                             String categoriaObjeto, String descricao, String responsavelCadastro,
                             Date dataRequisicao, boolean encontrado, Integer itemId, boolean ativo) {
        this.id = id;
        this.codigoRequisicao = codigoRequisicao;
        this.nomeCliente = nomeCliente;
        this.telefone = telefone;
        this.categoriaObjeto = categoriaObjeto;
        this.descricao = descricao;
        this.responsavelCadastro = responsavelCadastro;
        this.dataRequisicao = dataRequisicao;
        this.encontrado = encontrado;
        this.itemId = itemId;
        this.ativo = ativo;
    }

    // Getters e Setters existentes...
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCodigoRequisicao() { return codigoRequisicao; }
    public void setCodigoRequisicao(String codigoRequisicao) { this.codigoRequisicao = codigoRequisicao; }

    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getCategoriaObjeto() { return categoriaObjeto; }
    public void setCategoriaObjeto(String categoriaObjeto) { this.categoriaObjeto = categoriaObjeto; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getResponsavelCadastro() { return responsavelCadastro; }
    public void setResponsavelCadastro(String responsavelCadastro) { this.responsavelCadastro = responsavelCadastro; }

    public Integer getOperadorId() { return operadorId; }
    public void setOperadorId(Integer operadorId) { this.operadorId = operadorId; }

    public String getAssinaturaOperador() { return assinaturaOperador; }
    public void setAssinaturaOperador(String assinaturaOperador) { this.assinaturaOperador = assinaturaOperador; }

    public Integer getNumeroLacre() { return numeroLacre; }
    public void setNumeroLacre(Integer numeroLacre) { this.numeroLacre = numeroLacre; }

    public Date getDataRequisicao() { return dataRequisicao; }
    public void setDataRequisicao(Date dataRequisicao) { this.dataRequisicao = dataRequisicao; }

    public boolean isEncontrado() { return encontrado; }
    public void setEncontrado(boolean encontrado) { this.encontrado = encontrado; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
