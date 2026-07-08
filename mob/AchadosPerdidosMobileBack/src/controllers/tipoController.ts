// controllers/tipoController.ts
import { Request, Response } from "express";
import tipoRepository from "../repositories/tipoRepository";

export async function listarTipos(req: Request, res: Response) {
    try {
        const tipos = await tipoRepository.listarTipos();
        return res.status(200).json(tipos);
    } catch (error) {
        console.error("Erro ao listar tipos:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarTipoPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const tipo = await tipoRepository.buscarPorId(parseInt(id));
        if (!tipo) {
            return res.status(404).json({ erro: "Tipo não encontrado" });
        }
        return res.status(200).json(tipo);
    } catch (error) {
        console.error("Erro ao buscar tipo:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function criarTipo(req: Request, res: Response) {
    const { nome, prazo_dias } = req.body;

    if (!nome || !prazo_dias) {
        return res.status(400).json({ erro: "Nome e prazo em dias são obrigatórios" });
    }

    if (nome.trim() === "" || prazo_dias <= 0) {
        return res.status(400).json({ erro: "Nome inválido ou prazo deve ser maior que zero" });
    }

    try {
        const insertId = await tipoRepository.inserirTipo(nome, prazo_dias);
        return res.status(201).json({
            mensagem: "Tipo criado com sucesso",
            id: insertId,
            nome,
            prazo_dias
        });
    } catch (error) {
        console.error("Erro ao criar tipo:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}