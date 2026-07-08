// controllers/localController.ts
import { Request, Response } from "express";
import localRepository from "../repositories/localRepository";

export async function listarLocais(req: Request, res: Response) {
    try {
        const locais = await localRepository.listarLocais();
        return res.status(200).json(locais);
    } catch (error) {
        console.error("Erro ao listar locais:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarLocalPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const local = await localRepository.buscarPorId(parseInt(id));
        if (!local) {
            return res.status(404).json({ erro: "Local não encontrado" });
        }
        return res.status(200).json(local);
    } catch (error) {
        console.error("Erro ao buscar local:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function criarLocal(req: Request, res: Response) {
    const { nome } = req.body;

    if (!nome || nome.trim() === "") {
        return res.status(400).json({ erro: "Nome do local é obrigatório" });
    }

    try {
        const insertId = await localRepository.inserirLocal(nome);
        return res.status(201).json({
            mensagem: "Local criado com sucesso",
            id: insertId,
            nome
        });
    } catch (error) {
        console.error("Erro ao criar local:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function desativarLocal(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const sucesso = await localRepository.desativarLocal(parseInt(id));
        if (sucesso) {
            return res.status(200).json({ mensagem: "Local desativado com sucesso" });
        } else {
            return res.status(404).json({ erro: "Local não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao desativar local:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}