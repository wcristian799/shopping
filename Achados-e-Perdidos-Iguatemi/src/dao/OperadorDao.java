package dao;

import model.Operador;
import util.ConexaoDB;
import util.CpfUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class OperadorDao {
    private ConexaoDB conexao = new ConexaoDB();

    public int inserirOperador(Operador operador) {
        String sql = "INSERT INTO operadores (nome_completo, cpf, data_nascimento) VALUES (?, ?, ?)";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, operador.getNomeCompleto());
            stmt.setString(2, CpfUtil.somenteDigitos(operador.getCpf()));
            stmt.setDate(3, new java.sql.Date(operador.getDataNascimento().getTime()));
            stmt.executeUpdate();

            ResultSet rs = stmt.getGeneratedKeys();
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (Exception e) {
            System.out.println("Erro ao inserir operador: " + e.getMessage());
        }
        return -1;
    }

    public List<Operador> listarOperadores() {
        List<Operador> operadores = new ArrayList<>();
        String sql = "SELECT * FROM operadores WHERE ativo = 1 ORDER BY nome_completo";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                operadores.add(mapearOperador(rs));
            }
        } catch (Exception e) {
            System.out.println("Erro ao listar operadores: " + e.getMessage());
        }
        return operadores;
    }

    public Operador buscarPorId(int id) {
        String sql = "SELECT * FROM operadores WHERE id = ? AND ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapearOperador(rs);
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar operador por ID: " + e.getMessage());
        }
        return null;
    }

    public Operador buscarPorCpf(String cpf) {
        String sql = "SELECT * FROM operadores WHERE cpf = ? AND ativo = 1";
        try (Connection conn = conexao.conectar();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, CpfUtil.somenteDigitos(cpf));
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapearOperador(rs);
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar operador por CPF: " + e.getMessage());
        }
        return null;
    }

    public boolean validarCpfOperador(int operadorId, String cpfDigitado) {
        Operador operador = buscarPorId(operadorId);
        return operador != null && CpfUtil.somenteDigitos(operador.getCpf()).equals(CpfUtil.somenteDigitos(cpfDigitado));
    }

    private Operador mapearOperador(ResultSet rs) throws SQLException {
        Operador operador = new Operador();
        operador.setId(rs.getInt("id"));
        operador.setNomeCompleto(rs.getString("nome_completo"));
        operador.setCpf(rs.getString("cpf"));
        operador.setDataNascimento(rs.getDate("data_nascimento"));
        operador.setAtivo(rs.getBoolean("ativo"));
        operador.setDataCadastro(rs.getTimestamp("data_cadastro"));
        return operador;
    }
}
