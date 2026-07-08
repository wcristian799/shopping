package dao;

import model.ItemEletronico;
import util.ConexaoDB;
import java.sql.*;

public class ItemEletronicoDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirItemEletronico(ItemEletronico item) {
        String sql = "INSERT INTO itens_eletronicos (modelo, item_id) VALUES (?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, item.getModelo());
            stmt.setInt(2, item.getItemId());

            int affected = stmt.executeUpdate();
            if (affected > 0) {
                return item.getItemId();
            }
        } catch (Exception e) {
            System.out.println("Erro ao inserir item eletrônico: " + e.getMessage());
        }
        return -1;
    }

    public ItemEletronico buscarPorItemId(int itemId) {
        String sql = "SELECT * FROM itens_eletronicos WHERE item_id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, itemId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                ItemEletronico item = new ItemEletronico();
                item.setId(rs.getInt("id"));
                item.setModelo(rs.getString("modelo"));
                item.setItemId(rs.getInt("item_id"));
                return item;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar item eletrônico: " + e.getMessage());
        }
        return null;
    }
}