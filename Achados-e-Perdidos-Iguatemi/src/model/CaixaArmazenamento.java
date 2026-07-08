package model;

public class CaixaArmazenamento {
    private int id;
    private int numero;
    private String descricao;
    private boolean ativo;

    public CaixaArmazenamento() {}

    public CaixaArmazenamento(int id, int numero, String descricao, boolean ativo) {
        this.id = id;
        this.numero = numero;
        this.descricao = descricao;
        this.ativo = ativo;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getNumero() {
        return numero;
    }

    public void setNumero(int numero) {
        this.numero = numero;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
