// controllers/entregaController.ts
import { Request, Response } from "express";
import entregaRepository from "../repositories/entregaRepository";
import itemRepository from "../repositories/itemRepository";

export async function listarEntregas(req: Request, res: Response) {
    try {
        const entregas = await entregaRepository.listarEntregas();
        return res.status(200).json(entregas);
    } catch (error) {
        console.error("Erro ao listar entregas:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarEntregaPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const entrega = await entregaRepository.buscarPorId(parseInt(id));
        if (!entrega) {
            return res.status(404).json({ erro: "Entrega não encontrada" });
        }
        return res.status(200).json(entrega);
    } catch (error) {
        console.error("Erro ao buscar entrega:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarEntregaPorCodigo(req: Request, res: Response) {
    const { codigo } = req.params;

    try {
        const entrega = await entregaRepository.buscarPorCodigo(codigo);
        if (!entrega) {
            return res.status(404).json({ erro: "Entrega não encontrada" });
        }
        return res.status(200).json(entrega);
    } catch (error) {
        console.error("Erro ao buscar entrega:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function registrarEntrega(req: Request, res: Response) {
    const { tipo_registro, proprietario, item_id } = req.body;
    const usuario_id = (req as any).payload?.id;

    if (!usuario_id) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!tipo_registro || !proprietario || !item_id) {
        return res.status(400).json({ erro: "Campos obrigatórios: tipo_registro, proprietario, item_id" });
    }

    if (!proprietario.nome || !proprietario.telefone) {
        return res.status(400).json({ erro: "Nome e telefone do proprietário são obrigatórios" });
    }

    try {
        // Verificar se o item existe e não foi entregue ainda
        const item = await itemRepository.buscarPorId(item_id);
        if (!item) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }

        if (item.situacao_id === 4) {
            return res.status(400).json({ erro: "Este item já foi entregue" });
        }

        const dadosEntrega = {
            data_entrega: new Date(),
            tipo_registro,
            proprietario,
            item_id,
            usuario_id
        };

        const entregaId = await entregaRepository.inserirEntrega(dadosEntrega);

        return res.status(201).json({
            mensagem: "Entrega registrada com sucesso",
            entrega_id: entregaId
        });

    } catch (err: any) {
        console.error("Erro ao registrar entrega:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}