package controller;

import dao.EntregaDao;
import dao.ProprietarioDao;
import model.Entrega;
import model.Proprietario;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class EntregaController {
    private EntregaDao entregaDao;
    private ProprietarioDao proprietarioDao;

    public EntregaController() {
        this.entregaDao = new EntregaDao();
        this.proprietarioDao = new ProprietarioDao();
    }

    public int registrarEntrega(Date dataEntrega, String tipoRegistro, String nomeProprietario, String telefone,
                                String cpf, String rg, int itemId, int usuarioId) {
        if (nomeProprietario == null || nomeProprietario.trim().isEmpty() ||
                telefone == null || telefone.trim().isEmpty()) {
            return -1;
        }

        Proprietario proprietario = proprietarioDao.buscarPorCpf(cpf);
        int proprietarioId;

        if (proprietario == null) {
            proprietario = new Proprietario();
            proprietario.setNome(nomeProprietario);
            proprietario.setTelefone(telefone);
            proprietario.setCpf(cpf);
            proprietario.setRg(rg);
            proprietarioId = proprietarioDao.inserirProprietario(proprietario);
        } else {
            proprietarioId = proprietario.getId();
        }

        if (proprietarioId > 0) {
            String codigoAutenticacao = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            Entrega entrega = new Entrega();
            entrega.setDataEntrega(dataEntrega);
            entrega.setCodigoAutenticacao(codigoAutenticacao);
            entrega.setTipoRegistro(tipoRegistro);
            entrega.setProprietarioId(proprietarioId);
            entrega.setItemId(itemId);
            entrega.setUsuarioId(usuarioId);

            int entregaId = entregaDao.inserirEntrega(entrega);

            // NOVA LÓGICA: Finaliza automaticamente a requisição associada ao item devolvido
            if (entregaId > 0) {
                RequisicaoClienteController reqController = new RequisicaoClienteController();
                boolean requisicaoFechada = reqController.finalizarRequisicaoPorItemDevolvido(itemId);

                if (requisicaoFechada) {
                    System.out.println("Requisição associada ao item #" + itemId + " foi finalizada automaticamente após entrega #" + entregaId);
                    // Aqui você pode adicionar um retorno extra ou logar em arquivo/tela se quiser
                }
            }

            return entregaId;
        }

        return -1;
    }

    public void salvarFotoEntrega(int entregaId, String caminho) {
        entregaDao.salvarFotoEntrega(entregaId, caminho);
    }

    public List<Entrega> listarEntregas() {
        return entregaDao.listarEntregas();
    }

    public String getCaminhoFotoEntrega(int entregaId) {
        return entregaDao.getCaminhoFotoEntrega(entregaId);
    }

    public String buscarFotoDevolucaoPorItem(int numeroRegistro) {
        List<Entrega> entregas = listarEntregas();
        Entrega entrega = entregas.stream()
                .filter(e -> e.getItemId() == numeroRegistro) // ajuste se usar ID real
                .findFirst()
                .orElse(null);
        if (entrega != null) {
            return getCaminhoFotoEntrega(entrega.getId());
        }
        return null;
    }
}