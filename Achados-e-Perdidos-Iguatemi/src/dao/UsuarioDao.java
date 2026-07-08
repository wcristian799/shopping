package dao;

import model.Usuario;
import util.ConexaoDB;
import util.SenhaUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDao {
    private ConexaoDB conexao = new ConexaoDB();

    public Usuario fazerLogin(String email, String senha) {
        String sql = "SELECT * FROM usuarios WHERE email = ? AND ativo = 1";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                String senhaHashed = rs.getString("senha");

                // Verifica se a senha digitada corresponde ao hash armazenado
                if (SenhaUtil.verificarSenha(senha, senhaHashed)) {
                    Usuario u = new Usuario();
                    u.setId(rs.getInt("id"));
                    u.setNome(rs.getString("nome"));
                    u.setEmail(rs.getString("email"));
                    u.setNivelAcessoId(rs.getInt("nivel_acesso_id"));
                    u.setAtivo(rs.getBoolean("ativo"));
                    u.setDataCadastro(rs.getTimestamp("data_cadastro"));
                    return u;
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao fazer login: " + e.getMessage());
        }
        return null;
    }

    public boolean inserirUsuario(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nome, email, senha, nivel_acesso_id) VALUES (?, ?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, usuario.getNome());
            stmt.setString(2, usuario.getEmail());

            // Gera o hash da senha
            String senhaHashed = SenhaUtil.hashSenha(usuario.getSenha());
            stmt.setString(3, senhaHashed);

            stmt.setInt(4, usuario.getNivelAcessoId());

            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao inserir usuário: " + e.getMessage());
            return false;
        }
    }

    public boolean alterarSenha(int id, String novaSenha) {
        String sql = "UPDATE usuarios SET senha = ? WHERE id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            // Hasheia a nova senha antes de salvar
            String senhaHashed = SenhaUtil.hashSenha(novaSenha);
            stmt.setString(1, senhaHashed);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao alterar senha: " + e.getMessage());
            return false;
        }
    }

    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios WHERE ativo = 1 ORDER BY nome";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNome(rs.getString("nome"));
                u.setEmail(rs.getString("email"));
                u.setNivelAcessoId(rs.getInt("nivel_acesso_id"));
                u.setAtivo(rs.getBoolean("ativo"));
                u.setDataCadastro(rs.getTimestamp("data_cadastro"));
                usuarios.add(u);
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar usuários: " + e.getMessage());
        }
        return usuarios;
    }

    public boolean desativarUsuario(int id) {
        String sql = "UPDATE usuarios SET ativo = 0 WHERE id = ?";
        try (Connection conn = conexao.conectar(); PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (Exception e) {
            System.out.println("Erro ao desativar usuário: " + e.getMessage());
            return false;
        }
    }

    // NOVO MÉTODO ADICIONADO
    public Usuario buscarPorId(int id) {
        String sql = "SELECT * FROM usuarios WHERE id = ? AND ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNome(rs.getString("nome"));
                u.setEmail(rs.getString("email"));
                u.setNivelAcessoId(rs.getInt("nivel_acesso_id"));
                u.setAtivo(rs.getBoolean("ativo"));
                u.setDataCadastro(rs.getTimestamp("data_cadastro"));
                return u;
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar usuário por ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }
}
