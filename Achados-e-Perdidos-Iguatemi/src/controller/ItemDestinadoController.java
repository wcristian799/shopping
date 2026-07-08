package controller;

import dao.ItemDestinadoDao;
import dao.DestinoFinalDao;
import model.ItemDestinado;
import model.DestinoFinal;
import java.util.Date;
import java.util.List;

public class ItemDestinadoController {
    private ItemDestinadoDao itemDestinadoDao;
    private DestinoFinalDao destinoFinalDao;

    public ItemDestinadoController() {
        this.itemDestinadoDao = new ItemDestinadoDao();
        this.destinoFinalDao = new DestinoFinalDao();
    }

    public int encaminharItem(Date dataEnvio, Date dataInventario, int itemId, int destinoId, String responsavel) {
        ItemDestinado item = new ItemDestinado();
        item.setDataEnvio(dataEnvio);
        item.setDataInventario(dataInventario);
        item.setItemId(itemId);
        item.setDestinoId(destinoId);
        item.setResponsavelEncaminhamento(responsavel); // NOVO
        return itemDestinadoDao.inserirItemDestinado(item);
    }

    public List<ItemDestinado> listarItensDestinados() {
        return itemDestinadoDao.listarItensDestinados();
    }

    public List<DestinoFinal> listarDestinos() {
        return destinoFinalDao.listarDestinos();
    }
}
