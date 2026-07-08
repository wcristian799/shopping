package model;

import java.util.Date;

public class Entrega {
    private int id;
    private Date dataEntrega;
    private String codigoAutenticacao;
    private String tipoRegistro;
    private int proprietarioId;
    private int itemId;
    private int usuarioId;
    private boolean ativo;

    public Entrega() {}

    public Entrega(int id, Date dataEntrega, String codigoAutenticacao, String tipoRegistro,
                   int proprietarioId, int itemId, int usuarioId, boolean ativo) {
        this.id = id;
        this.dataEntrega = dataEntrega;
        this.codigoAutenticacao = codigoAutenticacao;
        this.tipoRegistro = tipoRegistro;
        this.proprietarioId = proprietarioId;
        this.itemId = itemId;
        this.usuarioId = usuarioId;
        this.ativo = ativo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getDataEntrega() {
        return dataEntrega;
    }

    public void setDataEntrega(Date dataEntrega) {
        this.dataEntrega = dataEntrega;
    }

    public String getCodigoAutenticacao() {
        return codigoAutenticacao;
    }

    public void setCodigoAutenticacao(String codigoAutenticacao) {
        this.codigoAutenticacao = codigoAutenticacao;
    }

    public String getTipoRegistro() {
        return tipoRegistro;
    }

    public void setTipoRegistro(String tipoRegistro) {
        this.tipoRegistro = tipoRegistro;
    }

    public int getProprietarioId() {
        return proprietarioId;
    }

    public void setProprietarioId(int proprietarioId) {
        this.proprietarioId = proprietarioId;
    }

    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
