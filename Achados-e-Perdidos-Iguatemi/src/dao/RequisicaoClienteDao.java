package dao;

import model.RequisicaoCliente;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RequisicaoClienteDao {
    private ConexaoDB conexao = new ConexaoDB();

    /**
     * Gera um código aleatório de 8 caracteres (letras maiúsculas e números)
     */
    private String gerarCodigoRequisicao() {
        String caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
        StringBuilder codigo = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * caracteres.length());
            codigo.append(caracteres.charAt(index));
        }
        return codigo.toString();
    }

    /**
     * Verifica se o código já existe no banco
     */
    private boolean codigoExiste(String codigo) {
        String sql = "SELECT COUNT(*) FROM requisicoes_cliente WHERE codigo_requisicao = ?";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, codigo);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        } catch (Exception e) {
            System.out.println("Erro ao verificar código: " + e.getMessage());
        }
        return false;
    }

    /**
     * Gera um código único (tenta até 5 vezes)
     */
    private String gerarCodigoUnico() {
        String codigo;
        int tentativas = 0;
        do {
            codigo = gerarCodigoRequisicao();
            tentativas++;
            if (tentativas > 5) {
                // Fallback: usar UUID reduzido
                codigo = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
        } while (codigoExiste(codigo));
        return codigo;
    }

    public boolean inserirRequisicao(RequisicaoCliente requisicao) {
        // Gerar código único automaticamente
        String codigo = gerarCodigoUnico();
        requisicao.setCodigoRequisicao(codigo);

        String sql = "INSERT INTO requisicoes_cliente (codigo_requisicao, nome_cliente, telefone, categoria_objeto, descricao, responsavel_cadastro, operador_id, assinatura_operador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, requisicao.getCodigoRequisicao());
            stmt.setString(2, requisicao.getNomeCliente());
            stmt.setString(3, requisicao.getTelefone());
            stmt.setString(4, requisicao.getCategoriaObjeto());
            stmt.setString(5, requisicao.getDescricao());
            stmt.setString(6, requisicao.getResponsavelCadastro());
            if (requisicao.getOperadorId() != null) {
                stmt.setInt(7, requisicao.getOperadorId());
            } else {
                stmt.setNull(7, Types.INTEGER);
            }
            stmt.setString(8, requisicao.getAssinaturaOperador());
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao inserir requisição: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public List<RequisicaoCliente> listarRequisicoesPendentes() {
        List<RequisicaoCliente> requisicoes = new ArrayList<>();
        String sql = "SELECT rc.*, ip.numero_lacre as numero_lacre " +
                "FROM requisicoes_cliente rc " +
                "LEFT JOIN itens_perdidos ip ON rc.item_id = ip.id " +
                "WHERE rc.encontrado = 0 AND rc.ativo = 1 " +
                "ORDER BY rc.data_requisicao DESC";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                RequisicaoCliente r = new RequisicaoCliente();
                r.setId(rs.getInt("id"));
                r.setCodigoRequisicao(rs.getString("codigo_requisicao"));
                r.setNomeCliente(rs.getString("nome_cliente"));
                r.setTelefone(rs.getString("telefone"));
                r.setCategoriaObjeto(rs.getString("categoria_objeto"));
                r.setDescricao(rs.getString("descricao"));
                r.setResponsavelCadastro(rs.getString("responsavel_cadastro"));
                r.setDataRequisicao(rs.getTimestamp("data_requisicao"));
                r.setEncontrado(rs.getBoolean("encontrado"));
                r.setItemId((Integer) rs.getObject("item_id"));
                r.setOperadorId((Integer) rs.getObject("operador_id"));
                r.setAssinaturaOperador(rs.getString("assinatura_operador"));
                r.setAtivo(rs.getBoolean("ativo"));
                r.setNumeroLacre((Integer) rs.getObject("numero_lacre"));
                requisicoes.add(r);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar requisições pendentes: " + e.getMessage());
            e.printStackTrace();
        }
        return requisicoes;
    }

    public List<RequisicaoCliente> listarTodasRequisicoes() {
        List<RequisicaoCliente> requisicoes = new ArrayList<>();
        String sql = "SELECT rc.*, ip.numero_lacre as numero_lacre " +
                "FROM requisicoes_cliente rc " +
                "LEFT JOIN itens_perdidos ip ON rc.item_id = ip.id " +
                "WHERE rc.ativo = 1 " +
                "ORDER BY rc.data_requisicao DESC";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                RequisicaoCliente r = new RequisicaoCliente();
                r.setId(rs.getInt("id"));
                r.setCodigoRequisicao(rs.getString("codigo_requisicao"));
                r.setNomeCliente(rs.getString("nome_cliente"));
                r.setTelefone(rs.getString("telefone"));
                r.setCategoriaObjeto(rs.getString("categoria_objeto"));
                r.setDescricao(rs.getString("descricao"));
                r.setResponsavelCadastro(rs.getString("responsavel_cadastro"));
                r.setDataRequisicao(rs.getTimestamp("data_requisicao"));
                r.setEncontrado(rs.getBoolean("encontrado"));
                r.setItemId((Integer) rs.getObject("item_id"));
                r.setOperadorId((Integer) rs.getObject("operador_id"));
                r.setAssinaturaOperador(rs.getString("assinatura_operador"));
                r.setAtivo(rs.getBoolean("ativo"));
                r.setNumeroLacre((Integer) rs.getObject("numero_lacre"));
                requisicoes.add(r);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar todas requisições: " + e.getMessage());
            e.printStackTrace();
        }
        return requisicoes;
    }

    public boolean associarItemEncontrado(int requisicaoId, int itemId) {
        String sql = "UPDATE requisicoes_cliente SET item_id = ?, encontrado = 1 WHERE id = ? AND encontrado = 0";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, itemId);
            stmt.setInt(2, requisicaoId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao associar item à requisição: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean marcarComoEncontrado(int requisicaoId, int itemId) {
        return associarItemEncontrado(requisicaoId, itemId);
    }

    public List<RequisicaoCliente> buscarRequisicoesPorItem(int itemId) {
        List<RequisicaoCliente> requisicoes = new ArrayList<>();
        String sql = "SELECT rc.*, ip.numero_lacre as numero_lacre " +
                "FROM requisicoes_cliente rc " +
                "LEFT JOIN itens_perdidos ip ON rc.item_id = ip.id " +
                "WHERE rc.item_id = ? AND rc.ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, itemId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                RequisicaoCliente r = new RequisicaoCliente();
                r.setId(rs.getInt("id"));
                r.setCodigoRequisicao(rs.getString("codigo_requisicao"));
                r.setNomeCliente(rs.getString("nome_cliente"));
                r.setTelefone(rs.getString("telefone"));
                r.setCategoriaObjeto(rs.getString("categoria_objeto"));
                r.setDescricao(rs.getString("descricao"));
                r.setResponsavelCadastro(rs.getString("responsavel_cadastro"));
                r.setDataRequisicao(rs.getTimestamp("data_requisicao"));
                r.setEncontrado(rs.getBoolean("encontrado"));
                r.setItemId((Integer) rs.getObject("item_id"));
                r.setOperadorId((Integer) rs.getObject("operador_id"));
                r.setAssinaturaOperador(rs.getString("assinatura_operador"));
                r.setAtivo(rs.getBoolean("ativo"));
                r.setNumeroLacre((Integer) rs.getObject("numero_lacre"));
                requisicoes.add(r);
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar requisições por item: " + e.getMessage());
            e.printStackTrace();
        }
        return requisicoes;
    }

    public boolean marcarComoResolvida(int requisicaoId) {
        String sql = "UPDATE requisicoes_cliente SET encontrado = 1 WHERE id = ? AND encontrado = 0";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, requisicaoId);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao marcar requisição como resolvida: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public List<RequisicaoCliente> buscarParecidas(String categoria, String observacao) {
        List<RequisicaoCliente> resultado = new ArrayList<>();

        if (observacao == null || observacao.trim().isEmpty()) {
            return resultado;
        }

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = conexao.conectar();
            String observacaoNormalizada = removerAcentos(observacao.toLowerCase());
            String[] palavras = observacaoNormalizada.split("\\s+");
            List<String> palavrasRelevantes = new ArrayList<>();

            for (String palavra : palavras) {
                palavra = palavra.trim();
                if (palavra.length() >= 3 && !palavra.matches(".*\\d.*")) {
                    palavrasRelevantes.add(palavra);
                }
            }

            if (palavrasRelevantes.isEmpty()) {
                palavrasRelevantes.add(observacaoNormalizada);
            }

            StringBuilder sql = new StringBuilder();
            sql.append("SELECT rc.*, ip.numero_lacre as numero_lacre ");
            sql.append("FROM requisicoes_cliente rc ");
            sql.append("LEFT JOIN itens_perdidos ip ON rc.item_id = ip.id ");
            sql.append("WHERE rc.encontrado = 0 AND (");

            for (int i = 0; i < palavrasRelevantes.size(); i++) {
                if (i > 0) sql.append(" OR ");
                sql.append("LOWER(rc.descricao) COLLATE utf8mb4_general_ci LIKE ?");
            }

            sql.append(") ORDER BY ");
            if (categoria != null && !categoria.isEmpty()) {
                sql.append("CASE WHEN rc.categoria_objeto = ? THEN 0 ELSE 1 END, ");
            }
            sql.append("rc.data_requisicao DESC LIMIT 10");

            stmt = conn.prepareStatement(sql.toString());
            int paramIndex = 1;

            for (String palavra : palavrasRelevantes) {
                stmt.setString(paramIndex++, "%" + palavra + "%");
            }

            if (categoria != null && !categoria.isEmpty()) {
                stmt.setString(paramIndex++, categoria);
            }

            rs = stmt.executeQuery();

            while (rs.next()) {
                RequisicaoCliente req = new RequisicaoCliente();
                req.setId(rs.getInt("id"));
                req.setCodigoRequisicao(rs.getString("codigo_requisicao"));
                req.setNomeCliente(rs.getString("nome_cliente"));
                req.setTelefone(rs.getString("telefone"));
                req.setCategoriaObjeto(rs.getString("categoria_objeto"));
                req.setDescricao(rs.getString("descricao"));
                req.setResponsavelCadastro(rs.getString("responsavel_cadastro"));
                req.setDataRequisicao(rs.getTimestamp("data_requisicao"));
                req.setEncontrado(rs.getBoolean("encontrado"));
                req.setItemId((Integer) rs.getObject("item_id"));
                req.setOperadorId((Integer) rs.getObject("operador_id"));
                req.setAssinaturaOperador(rs.getString("assinatura_operador"));
                req.setAtivo(rs.getBoolean("ativo"));
                req.setNumeroLacre((Integer) rs.getObject("numero_lacre"));
                resultado.add(req);
            }

        } catch (SQLException e) {
            System.err.println("Erro ao buscar requisições parecidas: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return resultado;
    }

    private String removerAcentos(String texto) {
        if (texto == null) return "";
        String textoNormalizado = java.text.Normalizer.normalize(texto, java.text.Normalizer.Form.NFD);
        return textoNormalizado.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
    }
}
