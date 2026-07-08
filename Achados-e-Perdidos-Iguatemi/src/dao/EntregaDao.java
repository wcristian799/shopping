package dao;

import model.Entrega;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EntregaDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirEntrega(Entrega entrega) {
        Connection conn = null;
        try {
            conn = conexao.conectar();
            conn.setAutoCommit(false);

            String sql = "INSERT INTO entregas (data_entrega, codigo_autenticacao, tipo_registro, proprietario_id, item_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setDate(1, new java.sql.Date(entrega.getDataEntrega().getTime()));
            stmt.setString(2, entrega.getCodigoAutenticacao());
            stmt.setString(3, entrega.getTipoRegistro());
            stmt.setInt(4, entrega.getProprietarioId());
            stmt.setInt(5, entrega.getItemId());
            stmt.setInt(6, entrega.getUsuarioId());
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            int entregaId = -1;
            if (rs.next()) {
                entregaId = rs.getInt(1);
            }

            String sqlUpdate = "UPDATE itens_perdidos SET situacao_id = 4 WHERE id = ?";
            PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdate);
            stmtUpdate.setInt(1, entrega.getItemId());
            stmtUpdate.executeUpdate();

            conn.commit();
            return entregaId;
        } catch (Exception e) {
            try {
                if (conn != null) conn.rollback();
            } catch (Exception ex) {
                System.out.println("Erro ao fazer rollback: " + ex.getMessage());
            }
            System.out.println("Erro ao inserir entrega: " + e.getMessage());
            return -1;
        } finally {
            try {
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (Exception e) {
                System.out.println("Erro ao fechar conexão: " + e.getMessage());
            }
        }
    }

    public List<Entrega> listarEntregas() {
        List<Entrega> entregas = new ArrayList<>();
        String sql = "SELECT * FROM entregas WHERE ativo = 1 ORDER BY data_entrega DESC";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Entrega e = new Entrega();
                e.setId(rs.getInt("id"));
                e.setDataEntrega(rs.getDate("data_entrega"));
                e.setCodigoAutenticacao(rs.getString("codigo_autenticacao"));
                e.setTipoRegistro(rs.getString("tipo_registro"));
                e.setProprietarioId(rs.getInt("proprietario_id"));
                e.setItemId(rs.getInt("item_id"));
                e.setUsuarioId(rs.getInt("usuario_id"));
                e.setAtivo(rs.getBoolean("ativo"));
                entregas.add(e);
            }
        } catch (Exception ex) {
            System.out.println("Erro ao listar entregas: " + ex.getMessage());
        }
        return entregas;
    }
    public void salvarFotoEntrega(int entregaId, String caminho) {
        String sql = "INSERT INTO imagens (caminho) VALUES (?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, caminho);
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                int imagemId = rs.getInt(1);
                String sqlAssoc = "INSERT INTO imagens_entrega (imagem_id, entrega_id) VALUES (?, ?)";
                try (PreparedStatement stmtAssoc = conn.prepareStatement(sqlAssoc)) {
                    stmtAssoc.setInt(1, imagemId);
                    stmtAssoc.setInt(2, entregaId);
                    stmtAssoc.executeUpdate();
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao salvar foto da entrega: " + e.getMessage());
        }
    }
    public String getCaminhoFotoEntrega(int entregaId) {
        String sql = "SELECT i.caminho " +
                "FROM imagens i " +
                "INNER JOIN imagens_entrega ie ON i.id = ie.imagem_id " +
                "WHERE ie.entrega_id = ? " +
                "LIMIT 1";  // assume uma foto por entrega, ou remova o LIMIT se tiver várias

        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, entregaId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getString("caminho");
            }
        } catch (SQLException e) {
            System.err.println("Erro ao buscar caminho da foto de entrega: " + e.getMessage());
            e.printStackTrace();
        }
        return null;  // ou "" se preferir
    }
}
