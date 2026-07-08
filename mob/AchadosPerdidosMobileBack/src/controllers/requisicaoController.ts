// controllers/requisicaoController.ts
import { Request, Response } from "express";
import requisicaoRepository from "../repositories/requisicaoRepository";
import itemRepository from "../repositories/itemRepository";

export async function listarRequisicoesPendentes(req: Request, res: Response) {
    try {
        const requisicoes = await requisicaoRepository.listarRequisicoesPendentes();
        return res.status(200).json(requisicoes);
    } catch (error) {
        console.error("Erro ao listar requisições pendentes:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function listarTodasRequisicoes(req: Request, res: Response) {
    try {
        const requisicoes = await requisicaoRepository.listarTodasRequisicoes();
        return res.status(200).json(requisicoes);
    } catch (error) {
        console.error("Erro ao listar todas requisições:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarRequisicaoPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const requisicao = await requisicaoRepository.buscarPorId(parseInt(id));
        if (!requisicao) {
            return res.status(404).json({ erro: "Requisição não encontrada" });
        }
        return res.status(200).json(requisicao);
    } catch (error) {
        console.error("Erro ao buscar requisição:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function cadastrarRequisicao(req: Request, res: Response) {
    const {
        nome_cliente,
        telefone,
        categoria_objeto,
        descricao,
        responsavel_cadastro,
        operador_id,
        assinatura_operador
    } = req.body;

    if (!nome_cliente || !telefone || !descricao) {
        return res.status(400).json({ erro: "Campos obrigatórios: nome_cliente, telefone, descricao" });
    }

    if (nome_cliente.trim() === "" || telefone.trim() === "" || descricao.trim() === "") {
        return res.status(400).json({ erro: "Nenhum campo pode estar vazio" });
    }

    try {
        const dados = {
            nome_cliente,
            telefone,
            categoria_objeto,
            descricao,
            responsavel_cadastro: responsavel_cadastro || null,
            operador_id: operador_id || null,
            assinatura_operador: assinatura_operador || null
        };

        const requisicaoId = await requisicaoRepository.inserirRequisicao(dados);

        return res.status(201).json({
            mensagem: "Requisição cadastrada com sucesso",
            requisicao_id: requisicaoId
        });

    } catch (error) {
        console.error("Erro ao cadastrar requisição:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function associarItemEncontrado(req: Request, res: Response) {
    const { id } = req.params;
    const { item_id } = req.body;

    if (!item_id) {
        return res.status(400).json({ erro: "item_id é obrigatório" });
    }

    try {
        // Verificar se a requisição existe
        const requisicao = await requisicaoRepository.buscarPorId(parseInt(id));
        if (!requisicao) {
            return res.status(404).json({ erro: "Requisição não encontrada" });
        }

        if (requisicao.encontrado) {
            return res.status(400).json({ erro: "Esta requisição já foi marcada como encontrada" });
        }

        // Verificar se o item existe
        const item = await itemRepository.buscarPorId(item_id);
        if (!item) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }

        const sucesso = await requisicaoRepository.associarItemEncontrado(parseInt(id), item_id);

        if (sucesso) {
            return res.status(200).json({ mensagem: "Item associado com sucesso" });
        } else {
            return res.status(400).json({ erro: "Erro ao associar item" });
        }

    } catch (error) {
        console.error("Erro ao associar item:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarRequisicoesParecidas(req: Request, res: Response) {
    const { categoria_objeto, descricao } = req.query;

    if (!descricao) {
        return res.status(400).json({ erro: "descricao é obrigatória" });
    }

    try {
        const requisicoes = await requisicaoRepository.buscarRequisicoesParecidas(
            (categoria_objeto as string) || null,
            descricao as string
        );
        return res.status(200).json(requisicoes);
    } catch (error) {
        console.error("Erro ao buscar requisições parecidas:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
