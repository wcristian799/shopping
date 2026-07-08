package dao;

import model.DestinoFinal;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DestinoFinalDao {
    private ConexaoDB conexao = new ConexaoDB();

    public List<DestinoFinal> listarDestinos() {
        List<DestinoFinal> destinos = new ArrayList<>();
        String sql = "SELECT * FROM destinos_finais WHERE ativo = 1 ORDER BY nome";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                DestinoFinal d = new DestinoFinal();
                d.setId(rs.getInt("id"));
                d.setNome(rs.getString("nome"));
                d.setAtivo(rs.getBoolean("ativo"));
                destinos.add(d);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar destinos: " + e.getMessage());
        }
        return destinos;
    }

    public DestinoFinal buscarPorId(int id) {
        String sql = "SELECT * FROM destinos_finais WHERE id = ?";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                DestinoFinal d = new DestinoFinal();
                d.setId(rs.getInt("id"));
                d.setNome(rs.getString("nome"));
                return d;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar destino por ID: " + e.getMessage());
        }
        return null;
    }
}
