package model;

public class ItemVestuario {
    private int id;
    private String cor;
    private String tamanho;
    private int itemId;

    public ItemVestuario() {}

    public ItemVestuario(int id, String cor, String tamanho, int itemId) {
        this.id = id;
        this.cor = cor;
        this.tamanho = tamanho;
        this.itemId = itemId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getTamanho() {
        return tamanho;
    }

    public void setTamanho(String tamanho) {
        this.tamanho = tamanho;
    }

    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }
}
