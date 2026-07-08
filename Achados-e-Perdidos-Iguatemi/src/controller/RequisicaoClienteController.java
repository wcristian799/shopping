package controller;

import dao.RequisicaoClienteDao;
import model.RequisicaoCliente;
import java.util.List;

public class RequisicaoClienteController {
    private RequisicaoClienteDao requisicaoClienteDao;

    public RequisicaoClienteController() {
        this.requisicaoClienteDao = new RequisicaoClienteDao();
    }

    public boolean cadastrarRequisicao(String nomeCliente, String telefone, String categoriaObjeto,
                                       String descricao, String responsavelCadastro) {
        return cadastrarRequisicao(nomeCliente, telefone, categoriaObjeto, descricao, responsavelCadastro, null, null);
    }

    public boolean cadastrarRequisicao(String nomeCliente, String telefone, String categoriaObjeto,
                                       String descricao, String responsavelCadastro, Integer operadorId,
                                       String assinaturaOperador) {
        if (nomeCliente == null || nomeCliente.trim().isEmpty() ||
                telefone == null || telefone.trim().isEmpty() ||
                descricao == null || descricao.trim().isEmpty()) {
            return false;
        }

        RequisicaoCliente requisicao = new RequisicaoCliente();
        requisicao.setNomeCliente(nomeCliente);
        requisicao.setTelefone(telefone);
        requisicao.setCategoriaObjeto(categoriaObjeto);
        requisicao.setDescricao(descricao);
        requisicao.setResponsavelCadastro(responsavelCadastro); // NOVO
        requisicao.setOperadorId(operadorId);
        requisicao.setAssinaturaOperador(assinaturaOperador);

        return requisicaoClienteDao.inserirRequisicao(requisicao);
    }

    public List<RequisicaoCliente> listarRequisicoesPendentes() {
        return requisicaoClienteDao.listarRequisicoesPendentes();
    }

    public List<RequisicaoCliente> listarTodasRequisicoes() {
        return requisicaoClienteDao.listarTodasRequisicoes();
    }

    public boolean marcarComoEncontrado(int requisicaoId, int itemId) {
        return requisicaoClienteDao.marcarComoEncontrado(requisicaoId, itemId);
    }

    public boolean associarItemEncontrado(int requisicaoId, int itemId) {
        return requisicaoClienteDao.associarItemEncontrado(requisicaoId, itemId);
    }

    /**
     * Marca uma requisição como resolvida/finalizada
     * @param requisicaoId ID da requisição a ser atualizada
     * @return true se a atualização foi bem-sucedida
     */
    public boolean marcarComoResolvida(int requisicaoId) {
        return requisicaoClienteDao.marcarComoResolvida(requisicaoId);
    }

    /**
     * Finaliza automaticamente a(s) requisição(ões) associada(s) ao item quando ele é devolvido.
     * @param itemId ID do item que foi entregue/devolvido
     * @return true se encontrou e atualizou pelo menos uma requisição pendente
     */
    public boolean finalizarRequisicaoPorItemDevolvido(int itemId) {
        RequisicaoClienteDao dao = new RequisicaoClienteDao();

        // Busca todas as requisições (pendentes ou não) que referenciam esse item
        List<RequisicaoCliente> requisicoes = dao.buscarRequisicoesPorItem(itemId);

        boolean algumaAtualizada = false;

        for (RequisicaoCliente req : requisicoes) {
            // Só atualiza se ainda estiver pendente (encontrado = false)
            if (!req.isEncontrado()) {
                boolean sucesso = dao.marcarComoResolvida(req.getId());
                if (sucesso) {
                    algumaAtualizada = true;
                }
            }
        }

        return algumaAtualizada;
    }

    /**
     * MÉTODO MELHORADO - Busca requisições parecidas com tratamento da observação
     * para evitar falsos positivos com palavras muito comuns.
     */
    public List<RequisicaoCliente> buscarRequisicoesParecidas(String categoria, String observacao) {
        // Se não tem observação, retorna vazio
        if (observacao == null || observacao.trim().isEmpty()) {
            return List.of(); // Retorna lista vazia imutável (Java 9+)
        }

        // Remove palavras muito comuns que podem gerar falsos positivos
        // e normaliza o texto para minúsculas
        String observacaoLimpa = observacao.toLowerCase()
                .replaceAll("teste", "")
                .replaceAll("notificacao", "")
                .replaceAll("procura", "")
                .replaceAll("perdi", "")
                .replaceAll("encontrei", "")
                .replaceAll("achei", "")
                .replaceAll("vi", "")
                .replaceAll("vi um", "")
                .replaceAll("tinha", "")
                .replaceAll("tinha um", "")
                .replaceAll("\\s+", " ") // Remove espaços extras
                .trim();

        // Se depois de limpar ficou vazio ou muito curto, usa a original
        if (observacaoLimpa.isEmpty() || observacaoLimpa.length() < 3) {
            observacaoLimpa = observacao;
        }

        // Se a categoria for nula ou vazia, passa null para o DAO
        String categoriaParaBusca = (categoria == null || categoria.trim().isEmpty()) ? null : categoria;

        return requisicaoClienteDao.buscarParecidas(categoriaParaBusca, observacaoLimpa);
    }
}
