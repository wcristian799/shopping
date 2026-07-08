package dao;

import model.ItemDestinado;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ItemDestinadoDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirItemDestinado(ItemDestinado item) {
        Connection conn = null;
        try {
            conn = conexao.conectar();
            conn.setAutoCommit(false);

            String sql = "INSERT INTO itens_destinados (data_envio, data_inventario, item_id, destino_id, responsavel_encaminhamento) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setDate(1, new java.sql.Date(item.getDataEnvio().getTime()));
            if (item.getDataInventario() != null) {
                stmt.setDate(2, new java.sql.Date(item.getDataInventario().getTime()));
            } else {
                stmt.setNull(2, Types.DATE);
            }
            stmt.setInt(3, item.getItemId());
            stmt.setInt(4, item.getDestinoId());
            stmt.setString(5, item.getResponsavelEncaminhamento()); // NOVO
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            int itemDestinadoId = -1;
            if (rs.next()) {
                itemDestinadoId = rs.getInt(1);
            }

            String sqlUpdate = "UPDATE itens_perdidos SET situacao_id = 5 WHERE id = ?";
            PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdate);
            stmtUpdate.setInt(1, item.getItemId());
            stmtUpdate.executeUpdate();

            conn.commit();
            return itemDestinadoId;
        } catch (Exception e) {
            try {
                if (conn != null) conn.rollback();
            } catch (Exception ex) {
                System.out.println("Erro ao fazer rollback: " + ex.getMessage());
            }
            System.out.println("Erro ao inserir item destinado: " + e.getMessage());
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

    public List<ItemDestinado> listarItensDestinados() {
        List<ItemDestinado> itens = new ArrayList<>();
        String sql = "SELECT * FROM itens_destinados WHERE ativo = 1 ORDER BY data_envio DESC";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ItemDestinado item = new ItemDestinado();
                item.setId(rs.getInt("id"));
                item.setDataEnvio(rs.getDate("data_envio"));
                item.setDataInventario(rs.getDate("data_inventario"));
                item.setItemId(rs.getInt("item_id"));
                item.setDestinoId(rs.getInt("destino_id"));
                item.setResponsavelEncaminhamento(rs.getString("responsavel_encaminhamento")); // NOVO
                item.setAtivo(rs.getBoolean("ativo"));
                itens.add(item);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar itens destinados: " + e.getMessage());
        }
        return itens;
    }
}
