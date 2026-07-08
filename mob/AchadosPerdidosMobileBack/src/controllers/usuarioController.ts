// controllers/usuarioController.ts
import { Request, Response } from "express";
import usuarioRepository from "../repositories/usuarioRepository";
import { gerarSenha } from "../utils/senha";

export async function listarUsuarios(req: Request, res: Response) {
    try {
        const usuarios = await usuarioRepository.listarUsuarios();
        // Remover senha de cada usuário
        const usuariosSemSenha = usuarios.map(({ senha: _, ...rest }) => rest);
        return res.status(200).json(usuariosSemSenha);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const usuario = await usuarioRepository.buscarPorId(parseInt(id));
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const { senha: _, ...usuarioSemSenha } = usuario;
        return res.status(200).json(usuarioSemSenha);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function alterarSenha(req: Request, res: Response) {
    const { id } = req.params;
    const { senha_antiga, senha_nova } = req.body;

    if (!senha_antiga || !senha_nova) {
        return res.status(400).json({ erro: "Senha antiga e nova são obrigatórias" });
    }

    try {
        const usuario = await usuarioRepository.buscarPorId(parseInt(id));
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Aqui você precisaria validar a senha antiga
        // Como não temos acesso à senha antiga descriptografada, 
        // você precisaria de um método específico no repository

        const senhaHash = await gerarSenha(senha_nova);
        const sucesso = await usuarioRepository.alterarSenha(parseInt(id), senhaHash);

        if (sucesso) {
            return res.status(200).json({ mensagem: "Senha alterada com sucesso" });
        } else {
            return res.status(400).json({ erro: "Erro ao alterar senha" });
        }
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function desativarUsuario(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const sucesso = await usuarioRepository.desativarUsuario(parseInt(id));
        if (sucesso) {
            return res.status(200).json({ mensagem: "Usuário desativado com sucesso" });
        } else {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao desativar usuário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}