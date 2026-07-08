package model;

public class ItemEletronico {
    private int id;
    private String modelo;
    private int itemId;

    public ItemEletronico() {}

    public ItemEletronico(int id, String modelo, int itemId) {
        this.id = id;
        this.modelo = modelo;
        this.itemId = itemId;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }
}
