import { Request, Response } from "express";
import destinoRepository from "../repositories/destinoRepository";
import itemRepository from "../repositories/itemRepository";

export async function listarDestinos(req: Request, res: Response) {
    try {
        const destinos = await destinoRepository.listarDestinos();
        return res.status(200).json(destinos);
    } catch (error) {
        console.error("Erro ao listar destinos:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function listarItensDestinados(req: Request, res: Response) {
    try {
        const itens = await destinoRepository.listarItensDestinados();
        return res.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao listar itens destinados:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function encaminharItem(req: Request, res: Response) {
    const { data_envio, data_inventario, item_id, destino_id, responsavel_encaminhamento } = req.body;

    if (!data_envio || !item_id || !destino_id) {
        return res.status(400).json({ erro: "Campos obrigatórios: data_envio, item_id, destino_id" });
    }

    try {
        const item = await itemRepository.buscarPorId(item_id);
        if (!item) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }

        if (item.situacao_id === 5) {
            return res.status(400).json({ erro: "Este item já foi encaminhado/finalizado" });
        }

        const dadosEncaminhamento = {
            data_envio,
            data_inventario: data_inventario || null,
            item_id,
            destino_id,
            responsavel_encaminhamento: responsavel_encaminhamento || null
        };

        const encaminhamentoId = await destinoRepository.inserirEncaminhamento(dadosEncaminhamento);

        return res.status(201).json({
            mensagem: "Item encaminhado com sucesso",
            encaminhamento_id: encaminhamentoId
        });
    } catch (err: any) {
        if (err?.code === "ER_NO_REFERENCED_ROW_2" || err?.errno === 1452) {
            return res.status(400).json({
                erro: "destino_id inválido. Nenhum destino encontrado com esse ID."
            });
        }

        console.error("Erro ao encaminhar item:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
