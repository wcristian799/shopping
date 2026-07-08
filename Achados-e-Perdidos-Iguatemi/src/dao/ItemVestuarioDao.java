package dao;

import model.ItemVestuario;
import util.ConexaoDB;
import java.sql.*;

public class ItemVestuarioDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirItemVestuario(ItemVestuario item) {
        String sql = "INSERT INTO itens_vestuario (cor, tamanho, item_id) VALUES (?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, item.getCor());
            stmt.setString(2, item.getTamanho());
            stmt.setInt(3, item.getItemId());

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                return item.getItemId();
            }
        } catch (Exception e) {
            System.out.println("Erro ao inserir item vestuário: " + e.getMessage());
        }
        return -1;
    }

    public ItemVestuario buscarPorItemId(int itemId) {
        String sql = "SELECT * FROM itens_vestuario WHERE item_id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, itemId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                ItemVestuario item = new ItemVestuario();
                item.setId(rs.getInt("id"));
                item.setCor(rs.getString("cor"));
                item.setTamanho(rs.getString("tamanho"));
                item.setItemId(rs.getInt("item_id"));
                return item;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar item vestuário: " + e.getMessage());
        }
        return null;
    }
}