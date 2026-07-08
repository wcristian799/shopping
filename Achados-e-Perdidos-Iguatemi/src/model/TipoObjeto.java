package model;

public class TipoObjeto {
    private int id;
    private String nome;
    private int prazoDias;

    public TipoObjeto() {}

    public TipoObjeto(int id, String nome, int prazoDias) {
        this.id = id;
        this.nome = nome;
        this.prazoDias = prazoDias;
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

    public int getPrazoDias() {
        return prazoDias;
    }

    public void setPrazoDias(int prazoDias) {
        this.prazoDias = prazoDias;
    }
}
