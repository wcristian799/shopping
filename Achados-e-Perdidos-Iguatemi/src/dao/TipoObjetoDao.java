package dao;

import model.TipoObjeto;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TipoObjetoDao {
    private ConexaoDB conexao = new ConexaoDB();

    public List<TipoObjeto> listarTipos() {
        List<TipoObjeto> tipos = new ArrayList<>();
        String sql = "SELECT * FROM tipos_objeto ORDER BY nome";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                TipoObjeto t = new TipoObjeto();
                t.setId(rs.getInt("id"));
                t.setNome(rs.getString("nome"));
                t.setPrazoDias(rs.getInt("prazo_dias"));
                tipos.add(t);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar tipos: " + e.getMessage());
        }
        return tipos;
    }

    public TipoObjeto buscarPorId(int id) {
        String sql = "SELECT * FROM tipos_objeto WHERE id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                TipoObjeto t = new TipoObjeto();
                t.setId(rs.getInt("id"));
                t.setNome(rs.getString("nome"));
                t.setPrazoDias(rs.getInt("prazo_dias"));
                return t;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar tipo: " + e.getMessage());
        }
        return null;
    }

    public int inserirTipo(TipoObjeto tipo) {
        String sql = "INSERT INTO tipos_objeto (nome, prazo_dias) VALUES (?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, tipo.getNome());
            stmt.setInt(2, tipo.getPrazoDias());  // ← Agora envia o prazo_dias

            int rows = stmt.executeUpdate();
            if (rows == 0) {
                System.err.println("Nenhuma linha inserida para tipo: " + tipo.getNome());
                return -1;
            }

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            System.err.println("Erro ao inserir tipo '" + tipo.getNome() + "' com prazo " + tipo.getPrazoDias() + ": " + e.getMessage());
            e.printStackTrace();  // Mostra o erro real no console
        }
        return -1;
    }

    public Integer buscarIdPorNome(String nome) {
        String sql = "SELECT id FROM tipos_objeto WHERE nome = ?";
        try (Connection conn = conexao.conectar(); // sua conexão
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, nome);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("id");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
