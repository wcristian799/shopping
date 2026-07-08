package controller;

import dao.UsuarioDao;
import model.Usuario;
import java.util.List;

public class UsuarioController {
    private UsuarioDao usuarioDao;

    public UsuarioController() {
        this.usuarioDao = new UsuarioDao();
    }

    public Usuario fazerLogin(String email, String senha) {
        if (email == null || email.trim().isEmpty() || senha == null || senha.trim().isEmpty()) {
            return null;
        }
        return usuarioDao.fazerLogin(email, senha);
    }

    public boolean cadastrarUsuario(String nome, String email, String senha, int nivelAcessoId) {
        if (nome == null || nome.trim().isEmpty() || email == null || email.trim().isEmpty() ||
            senha == null || senha.trim().isEmpty()) {
            return false;
        }
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(senha);
        usuario.setNivelAcessoId(nivelAcessoId);
        return usuarioDao.inserirUsuario(usuario);
    }

    public boolean alterarSenha(int usuarioId, String novaSenha) {
        if (novaSenha == null || novaSenha.trim().isEmpty()) {
            return false;
        }
        return usuarioDao.alterarSenha(usuarioId, novaSenha);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioDao.listarUsuarios();
    }

    public boolean desativarUsuario(int usuarioId) {
        return usuarioDao.desativarUsuario(usuarioId);
    }

    public Usuario buscarPorId(int id) {
        if (id <= 0) {
            return null;
        }
        return usuarioDao.buscarPorId(id);
    }
}
