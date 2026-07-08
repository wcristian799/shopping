// controllers/itemController.ts
import { Request, Response } from "express";
import itemRepository from "../repositories/itemRepository";
import itemEletronicoRepository from "../repositories/itemEletronicoRepository";
import itemVestuarioRepository from "../repositories/itemVestuarioRepository";
import { DadosItemGenerico } from "../models/item";
import { DadosItemEletronico } from "../models/item-eletronico";
import { DadosItemVestuario } from "../models/item-vestuario";

export async function listarItens(req: Request, res: Response) {
    try {
        const itens = await itemRepository.listarItens();
        return res.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao listar itens:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarItemPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const item = await itemRepository.buscarPorId(parseInt(id));
        if (!item) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }
        return res.status(200).json(item);
    } catch (error) {
        console.error("Erro ao buscar item:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarItemPorNumeroRegistro(req: Request, res: Response) {
    const { numero } = req.params;

    try {
        const item = await itemRepository.buscarPorNumeroRegistro(parseInt(numero));
        if (!item) {
            return res.status(404).json({ erro: "Item não encontrado" });
        }
        return res.status(200).json(item);
    } catch (error) {
        console.error("Erro ao buscar item:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarItens(req: Request, res: Response) {
    const { termo } = req.query;

    if (!termo) {
        return res.status(400).json({ erro: "Termo de busca é obrigatório" });
    }

    try {
        const itens = await itemRepository.buscarItens(termo as string);
        return res.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao buscar itens:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function cadastrarItemGenerico(req: Request, res: Response) {
    const dados: DadosItemGenerico = req.body;
    const usuario_id = (req as any).payload?.id;
    console.log('📥 Recebido no backend:', JSON.stringify(dados, null, 2));
    if (!usuario_id) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    // Validação dos campos obrigatórios
    if (!dados.nome || !dados.numero_lacre || !dados.estado_conservacao || !dados.local_id || !dados.tipo_id) {
        return res.status(400).json({
            erro: "Campos obrigatórios: nome, numero_lacre, estado_conservacao, local_id, tipo_id"
        });
    }

    try {
        // Só usa o ID do token se o frontend NÃO enviou um responsável
        if (!dados.usuario_responsavel_id) {
            dados.usuario_responsavel_id = usuario_id;
        }
        
        const itemId = await itemRepository.inserirItem(dados);

        return res.status(201).json({
            mensagem: "Item cadastrado com sucesso",
            item_id: itemId
        });
    } catch (err: any) {
        console.error("Erro ao cadastrar item:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function cadastrarItemEletronico(req: Request, res: Response) {
    const dados: DadosItemEletronico = req.body;
    const usuario_id = (req as any).payload?.id;

    if (!usuario_id) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!dados.modelo) {
        return res.status(400).json({ erro: "Modelo é obrigatório para itens eletrônicos" });
    }

    try {
        // Só usa o ID do token se o frontend NÃO enviou um responsável
        if (!dados.usuario_responsavel_id) {
            dados.usuario_responsavel_id = usuario_id;
        }
        
        const itemId = await itemEletronicoRepository.inserirItemEletronico(dados);

        return res.status(201).json({
            mensagem: "Item eletrônico cadastrado com sucesso",
            item_id: itemId
        });
    } catch (err: any) {
        console.error("Erro ao cadastrar item eletrônico:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function cadastrarItemVestuario(req: Request, res: Response) {
    const dados: DadosItemVestuario = req.body;
    const usuario_id = (req as any).payload?.id;

    if (!usuario_id) {
        return res.status(401).json({ erro: "Usuário não autenticado" });
    }

    if (!dados.cor || !dados.tamanho) {
        return res.status(400).json({ erro: "Cor e tamanho são obrigatórios para itens de vestuário" });
    }

    try {
        // Só usa o ID do token se o frontend NÃO enviou um responsável
        if (!dados.usuario_responsavel_id) {
            dados.usuario_responsavel_id = usuario_id;
        }
        
        const itemId = await itemVestuarioRepository.inserirItemVestuario(dados);

        return res.status(201).json({
            mensagem: "Item de vestuário cadastrado com sucesso",
            item_id: itemId
        });
    } catch (err: any) {
        console.error("Erro ao cadastrar item de vestuário:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function atualizarSituacao(req: Request, res: Response) {
    const { id } = req.params;
    const { situacao_id } = req.body;

    if (!situacao_id) {
        return res.status(400).json({ erro: "Situação é obrigatória" });
    }

    try {
        const sucesso = await itemRepository.atualizarSituacao(parseInt(id), situacao_id);
        if (sucesso) {
            return res.status(200).json({ mensagem: "Situação atualizada com sucesso" });
        } else {
            return res.status(404).json({ erro: "Item não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao atualizar situação:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function desativarItem(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const sucesso = await itemRepository.desativarItem(parseInt(id));
        if (sucesso) {
            return res.status(200).json({ mensagem: "Item desativado com sucesso" });
        } else {
            return res.status(404).json({ erro: "Item não encontrado" });
        }
    } catch (error) {
        console.error("Erro ao desativar item:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarItensParecidos(req: Request, res: Response) {
    const { descricao, tipo_id } = req.query;

    if (!descricao) {
        return res.status(400).json({ erro: "descricao é obrigatória" });
    }

    try {
        const itens = await itemRepository.buscarItensParecidos(
            tipo_id ? parseInt(tipo_id as string) : null,
            descricao as string
        );
        return res.status(200).json(itens);
    } catch (error) {
        console.error("Erro ao buscar itens parecidos:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function sincronizarSituacoes(req: Request, res: Response) {
    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        return res.status(200).json({ mensagem: "Situações sincronizadas com sucesso" });
    } catch (error) {
        console.error("Erro ao sincronizar situações:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
