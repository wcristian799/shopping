package controller;

import dao.*;
import model.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ItemPerdidoController {
    private ItemPerdidoDao itemPerdidoDao;
    private ItemEletronicoDao itemEletronicoDao;
    private ItemVestuarioDao itemVestuarioDao;
    private TipoObjetoDao tipoObjetoDao;

    public ItemPerdidoController() {
        this.itemPerdidoDao = new ItemPerdidoDao();
        this.itemEletronicoDao = new ItemEletronicoDao();
        this.itemVestuarioDao = new ItemVestuarioDao();
        this.tipoObjetoDao = new TipoObjetoDao();
    }

    // ==================== MÉTODOS PRINCIPAIS ====================

    /**
     * Cadastra item genérico
     * @param nome Nome do item
     * @param marca Marca do item
     * @param numeroLacre Número do lacre
     * @param estadoConservacao Estado de conservação
     * @param observacao Observações
     * @param nomeEntregador Nome de quem entregou o item
     * @param usuarioResponsavelId ID do usuário que está cadastrando
     * @param localId ID do local onde foi encontrado
     * @param tipoId ID do tipo de objeto
     * @param caixaId ID da caixa de armazenamento (opcional)
     * @return ID do item cadastrado ou -1 em caso de erro
     */
    public int cadastrarItemGenerico(String nome, String marca, int numeroLacre, String estadoConservacao,
                                     String observacao, String nomeEntregador, int usuarioResponsavelId,
                                     int localId, int tipoId, Integer caixaId) {
        return cadastrarItemGenerico(nome, marca, numeroLacre, estadoConservacao, observacao, nomeEntregador,
                usuarioResponsavelId, localId, tipoId, caixaId, null, null);
    }

    public int cadastrarItemGenerico(String nome, String marca, int numeroLacre, String estadoConservacao,
                                     String observacao, String nomeEntregador, int usuarioResponsavelId,
                                     int localId, int tipoId, Integer caixaId, Integer operadorId,
                                     String assinaturaOperador) {
        int numeroRegistro = itemPerdidoDao.obterProximoNumeroRegistro();

        ItemPerdido item = new ItemPerdido();
        item.setNumeroRegistro(numeroRegistro);
        item.setNome(nome);
        item.setMarca(marca);
        item.setNumeroLacre(numeroLacre);
        item.setEstadoConservacao(estadoConservacao);
        item.setObservacao(observacao);
        item.setNomeEntregador(nomeEntregador);
        item.setLocalId(localId);
        item.setSituacaoId(1);
        item.setUsuarioResponsavelId(usuarioResponsavelId);
        item.setOperadorId(operadorId);
        item.setAssinaturaOperador(assinaturaOperador);
        item.setTipoId(tipoId);
        item.setCaixaId(caixaId);

        return itemPerdidoDao.inserirItem(item);
    }

    /**
     * Cadastra item eletrônico
     */
    public int cadastrarItemEletronico(String nome, String marca, int numeroLacre, String estadoConservacao,
                                       String observacao, String nomeEntregador, int usuarioResponsavelId,
                                       int localId, int tipoId, Integer caixaId, String modelo) {
        return cadastrarItemEletronico(nome, marca, numeroLacre, estadoConservacao, observacao, nomeEntregador,
                usuarioResponsavelId, localId, tipoId, caixaId, modelo, null, null);
    }

    public int cadastrarItemEletronico(String nome, String marca, int numeroLacre, String estadoConservacao,
                                       String observacao, String nomeEntregador, int usuarioResponsavelId,
                                       int localId, int tipoId, Integer caixaId, String modelo, Integer operadorId,
                                       String assinaturaOperador) {
        int itemId = cadastrarItemGenerico(nome, marca, numeroLacre, estadoConservacao, observacao,
                nomeEntregador, usuarioResponsavelId, localId, tipoId, caixaId, operadorId, assinaturaOperador);
        if (itemId > 0) {
            ItemEletronico itemEletronico = new ItemEletronico();
            itemEletronico.setModelo(modelo);
            itemEletronico.setItemId(itemId);
            int resultado = itemEletronicoDao.inserirItemEletronico(itemEletronico);
            return (resultado > 0) ? itemId : -1;
        }
        return -1;
    }

    /**
     * Cadastra item de vestuário
     */
    public int cadastrarItemVestuario(String nome, String marca, int numeroLacre, String estadoConservacao,
                                      String observacao, String nomeEntregador, int usuarioResponsavelId,
                                      int localId, int tipoId, Integer caixaId, String cor, String tamanho) {
        return cadastrarItemVestuario(nome, marca, numeroLacre, estadoConservacao, observacao, nomeEntregador,
                usuarioResponsavelId, localId, tipoId, caixaId, cor, tamanho, null, null);
    }

    public int cadastrarItemVestuario(String nome, String marca, int numeroLacre, String estadoConservacao,
                                      String observacao, String nomeEntregador, int usuarioResponsavelId,
                                      int localId, int tipoId, Integer caixaId, String cor, String tamanho,
                                      Integer operadorId, String assinaturaOperador) {
        int itemId = cadastrarItemGenerico(nome, marca, numeroLacre, estadoConservacao, observacao,
                nomeEntregador, usuarioResponsavelId, localId, tipoId, caixaId, operadorId, assinaturaOperador);
        if (itemId > 0) {
            ItemVestuario itemVestuario = new ItemVestuario();
            itemVestuario.setCor(cor);
            itemVestuario.setTamanho(tamanho);
            itemVestuario.setItemId(itemId);
            int resultado = itemVestuarioDao.inserirItemVestuario(itemVestuario);
            return (resultado > 0) ? itemId : -1;
        }
        return -1;
    }

    // ==================== MÉTODOS EXISTENTES (SEM ALTERAÇÕES) ====================

    public void salvarImagemItem(int itemId, String caminho) {
        itemPerdidoDao.salvarImagemItem(itemId, caminho);
    }

    public List<ItemPerdido> listarItens() {
        return itemPerdidoDao.listarItens();
    }

    public List<ItemPerdido> buscarItens(String termo) {
        return itemPerdidoDao.buscarItens(termo);
    }

    public List<TipoObjeto> listarTipos() {
        return tipoObjetoDao.listarTipos();
    }

    public boolean atualizarSituacao(int itemId, int situacaoId) {
        return itemPerdidoDao.atualizarSituacao(itemId, situacaoId);
    }

    public ItemPerdido buscarItemPorId(int id) {
        return itemPerdidoDao.buscarPorId(id);
    }

    public int getItemIdPorNumeroRegistro(int numeroRegistro) {
        return itemPerdidoDao.getItemIdPorNumeroRegistro(numeroRegistro);
    }

    public boolean desativarItem(int itemId) {
        return itemPerdidoDao.desativarItem(itemId);
    }

    public List<ItemPerdido> listarItensPendentesPorTipos(List<Integer> tipoIds) {
        return itemPerdidoDao.listarPendentesPorTipos(tipoIds);
    }

    public List<ItemPerdido> buscarItensParecidos(String tipoNome, String descricao) {
        Integer tipoId = null;
        if (tipoNome != null && !tipoNome.trim().isEmpty()) {
            tipoId = tipoObjetoDao.buscarIdPorNome(tipoNome);
        }
        return itemPerdidoDao.buscarItensParecidos(tipoId, descricao);
    }

    public int atualizarSituacoesVencidasComContagem() {
        try {
            ItemPerdidoDao dao = new ItemPerdidoDao();
            return dao.atualizarSituacoesVencidasComContagem();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    public void atualizarSituacoesVencidas() {
        try {
            ItemPerdidoDao dao = new ItemPerdidoDao();
            dao.atualizarSituacoesVencidas();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
