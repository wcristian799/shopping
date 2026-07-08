package dao;

import model.Proprietario;
import util.ConexaoDB;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProprietarioDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirProprietario(Proprietario proprietario) {
        String sql = "INSERT INTO proprietarios (nome, telefone, cpf, rg) VALUES (?, ?, ?, ?)";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, proprietario.getNome());
            stmt.setString(2, proprietario.getTelefone());
            stmt.setString(3, proprietario.getCpf());
            stmt.setString(4, proprietario.getRg());
            stmt.executeUpdate();
            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (Exception e) {
            System.out.println("Erro ao inserir proprietário: " + e.getMessage());
        }
        return -1;
    }

    public List<Proprietario> listarProprietarios() {
        List<Proprietario> proprietarios = new ArrayList<>();
        String sql = "SELECT * FROM proprietarios WHERE ativo = 1 ORDER BY nome";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Proprietario p = new Proprietario();
                p.setId(rs.getInt("id"));
                p.setNome(rs.getString("nome"));
                p.setTelefone(rs.getString("telefone"));
                p.setCpf(rs.getString("cpf"));
                p.setRg(rs.getString("rg"));
                p.setAtivo(rs.getBoolean("ativo"));
                proprietarios.add(p);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar proprietários: " + e.getMessage());
        }
        return proprietarios;
    }

    public Proprietario buscarPorCpf(String cpf) {
        String sql = "SELECT * FROM proprietarios WHERE cpf = ? AND ativo = 1";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Proprietario p = new Proprietario();
                p.setId(rs.getInt("id"));
                p.setNome(rs.getString("nome"));
                p.setTelefone(rs.getString("telefone"));
                p.setCpf(rs.getString("cpf"));
                p.setRg(rs.getString("rg"));
                p.setAtivo(rs.getBoolean("ativo"));
                return p;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar proprietário: " + e.getMessage());
        }
        return null;
    }

    public Proprietario buscarPorId(int id) {
        String sql = "SELECT * FROM proprietarios WHERE id = ? AND ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                Proprietario p = new Proprietario();
                p.setId(rs.getInt("id"));
                p.setNome(rs.getString("nome"));
                p.setTelefone(rs.getString("telefone"));
                p.setCpf(rs.getString("cpf"));
                p.setRg(rs.getString("rg"));
                p.setAtivo(rs.getBoolean("ativo"));
                return p;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar proprietário por ID: " + e.getMessage());
        }
        return null;
    }
}
