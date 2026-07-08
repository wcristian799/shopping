// controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import authRepository from "../repositories/authRepository";
import usuarioRepository from "../repositories/usuarioRepository";
import { validarSenha, gerarSenha } from "../utils/senha";
import { createJWT } from "../utils/jwt";

export async function login(req: Request, res: Response, next: NextFunction) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    if (email.trim() === "" || senha.trim() === "") {
        return res.status(400).json({ erro: "Email e senha não podem estar vazios" });
    }

    try {
        const usuario = await authRepository.validarLogin(email);

        if (!usuario) {
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        const senhaValida = await validarSenha(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Credenciais inválidas" });
        }

        // Remover senha do objeto
        const { senha: _, ...usuarioSemSenha } = usuario;

        // Criar token
        const token = createJWT(usuarioSemSenha);

        return res.status(200).json({
            token,
            usuario: usuarioSemSenha
        });

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function cadastrarUsuario(req: Request, res: Response, next: NextFunction) {
    const { nome, email, senha, nivel_acesso_id } = req.body;

    if (!nome || !email || !senha || !nivel_acesso_id) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    if (nome.trim() === "" || email.trim() === "" || senha.trim() === "") {
        return res.status(400).json({ erro: "Nenhum campo pode estar vazio" });
    }

    try {
        // Verificar se email já existe
        const existente = await usuarioRepository.buscarPorEmail(email);
        if (existente) {
            return res.status(400).json({ erro: "Email já cadastrado" });
        }

        const senhaHash = await gerarSenha(senha);
        const dadosLogin = {
            nome,
            email,
            senha: senhaHash,
            nivel_acesso_id
        };

        const result = await authRepository.cadastrarUsuario(dadosLogin);
        if (!result) {
            throw new Error("Erro ao cadastrar usuário");
        }

        // Remover senha do objeto
        const { senha: _, ...usuarioSemSenha } = result;

        // Criar token
        const token = createJWT(usuarioSemSenha);

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            token,
            usuario: usuarioSemSenha
        });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}