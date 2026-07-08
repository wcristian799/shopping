package model;

import java.util.Date;

public class ItemDestinado {
    private int id;
    private Date dataEnvio;
    private Date dataInventario;
    private int itemId;
    private int destinoId;
    private String responsavelEncaminhamento; // NOVO
    private boolean ativo;

    public ItemDestinado() {}

    public ItemDestinado(int id, Date dataEnvio, Date dataInventario, int itemId, int destinoId,
                         String responsavelEncaminhamento, boolean ativo) {
        this.id = id;
        this.dataEnvio = dataEnvio;
        this.dataInventario = dataInventario;
        this.itemId = itemId;
        this.destinoId = destinoId;
        this.responsavelEncaminhamento = responsavelEncaminhamento;
        this.ativo = ativo;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Date getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(Date dataEnvio) { this.dataEnvio = dataEnvio; }

    public Date getDataInventario() { return dataInventario; }
    public void setDataInventario(Date dataInventario) { this.dataInventario = dataInventario; }

    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public int getDestinoId() { return destinoId; }
    public void setDestinoId(int destinoId) { this.destinoId = destinoId; }

    // NOVO
    public String getResponsavelEncaminhamento() { return responsavelEncaminhamento; }
    public void setResponsavelEncaminhamento(String responsavelEncaminhamento) { this.responsavelEncaminhamento = responsavelEncaminhamento; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}