package model;

import java.util.Date;

public class Usuario {
    private int id;
    private String nome;
    private String email;
    private String senha;
    private int nivelAcessoId;
    private boolean ativo;
    private Date dataCadastro;

    public Usuario() {}

    public Usuario(int id, String nome, String email, String senha, int nivelAcessoId, boolean ativo, Date dataCadastro) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.nivelAcessoId = nivelAcessoId;
        this.ativo = ativo;
        this.dataCadastro = dataCadastro;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public int getNivelAcessoId() {
        return nivelAcessoId;
    }

    public void setNivelAcessoId(int nivelAcessoId) {
        this.nivelAcessoId = nivelAcessoId;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public Date getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Date dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
}
