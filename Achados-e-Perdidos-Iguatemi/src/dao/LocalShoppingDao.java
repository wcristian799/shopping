package dao;

import model.LocalShopping;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LocalShoppingDao {
    private ConexaoDB conexao = new ConexaoDB();

    public List<LocalShopping> listarLocais() {
        List<LocalShopping> locais = new ArrayList<>();
        String sql = "SELECT * FROM locais_shopping WHERE ativo = 1 ORDER BY nome";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                LocalShopping l = new LocalShopping();
                l.setId(rs.getInt("id"));
                l.setNome(rs.getString("nome"));
                l.setAtivo(rs.getBoolean("ativo"));
                locais.add(l);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar locais: " + e.getMessage());
        }
        return locais;
    }

    public int inserirLocal(LocalShopping local) {
        String sql = "INSERT INTO locais_shopping (nome) VALUES (?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, local.getNome());

            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    public boolean desativarLocal(int id) {
        String sql = "UPDATE locais_shopping SET ativo = 0 WHERE id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao desativar local: " + e.getMessage());
            return false;
        }
    }
}
