// controllers/caixaController.ts
import { Request, Response } from "express";
import caixaRepository from "../repositories/caixaRepository";

export async function listarCaixas(req: Request, res: Response) {
    try {
        const caixas = await caixaRepository.listarCaixas();
        return res.status(200).json(caixas);
    } catch (error) {
        console.error("Erro ao listar caixas:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarCaixaPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const caixa = await caixaRepository.buscarPorId(parseInt(id));
        if (!caixa) {
            return res.status(404).json({ erro: "Caixa não encontrada" });
        }
        return res.status(200).json(caixa);
    } catch (error) {
        console.error("Erro ao buscar caixa:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarCaixaPorNumero(req: Request, res: Response) {
    const { numero } = req.params;

    try {
        const caixa = await caixaRepository.buscarPorNumero(parseInt(numero));
        if (!caixa) {
            return res.status(404).json({ erro: "Caixa não encontrada" });
        }
        return res.status(200).json(caixa);
    } catch (error) {
        console.error("Erro ao buscar caixa:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function criarCaixa(req: Request, res: Response) {
    const { numero, descricao } = req.body;

    if (!numero || !descricao) {
        return res.status(400).json({ erro: "Número e descrição são obrigatórios" });
    }

    if (numero <= 0) {
        return res.status(400).json({ erro: "Número deve ser maior que zero" });
    }

    try {
        // Verificar se número já existe
        const existente = await caixaRepository.buscarPorNumero(numero);
        if (existente) {
            return res.status(400).json({ erro: "Já existe uma caixa com este número" });
        }

        const insertId = await caixaRepository.inserirCaixa(numero, descricao);
        return res.status(201).json({
            mensagem: "Caixa criada com sucesso",
            id: insertId,
            numero,
            descricao
        });
    } catch (error) {
        console.error("Erro ao criar caixa:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function desativarCaixa(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const sucesso = await caixaRepository.desativarCaixa(parseInt(id));
        if (sucesso) {
            return res.status(200).json({ mensagem: "Caixa desativada com sucesso" });
        } else {
            return res.status(404).json({ erro: "Caixa não encontrada" });
        }
    } catch (error) {
        console.error("Erro ao desativar caixa:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}