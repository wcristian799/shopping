package dao;

import model.CaixaArmazenamento;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CaixaArmazenamentoDao {
    private ConexaoDB conexao = new ConexaoDB();

    public List<CaixaArmazenamento> listarCaixas() {
        List<CaixaArmazenamento> caixas = new ArrayList<>();
        String sql = "SELECT * FROM caixas_armazenamento WHERE ativo = 1 ORDER BY numero";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                CaixaArmazenamento c = new CaixaArmazenamento();
                c.setId(rs.getInt("id"));
                c.setNumero(rs.getInt("numero"));
                c.setDescricao(rs.getString("descricao"));
                c.setAtivo(rs.getBoolean("ativo"));
                caixas.add(c);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar caixas: " + e.getMessage());
        }
        return caixas;
    }

    public int inserirCaixa(CaixaArmazenamento caixa) {
        String sql = "INSERT INTO caixas_armazenamento (numero, descricao) VALUES (?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, caixa.getNumero());
            stmt.setString(2, caixa.getDescricao());
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

    public boolean desativarCaixa(int id) {
        String sql = "UPDATE caixas_armazenamento SET ativo = 0 WHERE id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao desativar caixa: " + e.getMessage());
            return false;
        }
    }
}
