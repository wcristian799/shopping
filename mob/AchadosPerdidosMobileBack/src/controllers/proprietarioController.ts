// controllers/proprietarioController.ts
import { Request, Response } from "express";
import proprietarioRepository from "../repositories/proprietarioRepository";

export async function listarProprietarios(req: Request, res: Response) {
    try {
        const proprietarios = await proprietarioRepository.listarProprietarios();
        return res.status(200).json(proprietarios);
    } catch (error) {
        console.error("Erro ao listar proprietários:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarProprietarioPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const proprietario = await proprietarioRepository.buscarPorId(parseInt(id));
        if (!proprietario) {
            return res.status(404).json({ erro: "Proprietário não encontrado" });
        }
        return res.status(200).json(proprietario);
    } catch (error) {
        console.error("Erro ao buscar proprietário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function buscarProprietarioPorCpf(req: Request, res: Response) {
    const { cpf } = req.params;

    if (!cpf) {
        return res.status(400).json({ erro: "CPF é obrigatório" });
    }

    try {
        const proprietario = await proprietarioRepository.buscarPorCpf(cpf);
        if (!proprietario) {
            return res.status(404).json({ erro: "Proprietário não encontrado" });
        }
        return res.status(200).json(proprietario);
    } catch (error) {
        console.error("Erro ao buscar proprietário por CPF:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function criarProprietario(req: Request, res: Response) {
    const { nome, telefone, cpf, rg } = req.body;

    if (!nome || !telefone) {
        return res.status(400).json({ erro: "Nome e telefone são obrigatórios" });
    }

    if (nome.trim() === "" || telefone.trim() === "") {
        return res.status(400).json({ erro: "Nome e telefone não podem estar vazios" });
    }

    try {
        // Verificar se já existe com este CPF (se foi fornecido)
        if (cpf) {
            const existente = await proprietarioRepository.buscarPorCpf(cpf);
            if (existente) {
                return res.status(400).json({ 
                    erro: "Já existe um proprietário cadastrado com este CPF",
                    proprietario: existente
                });
            }
        }

        const dados = {
            nome,
            telefone,
            cpf: cpf || undefined,
            rg: rg || undefined
        };

        const proprietarioId = await proprietarioRepository.inserirProprietario(dados);

        return res.status(201).json({
            mensagem: "Proprietário cadastrado com sucesso",
            proprietario_id: proprietarioId,
            nome,
            telefone,
            cpf,
            rg
        });

    } catch (error) {
        console.error("Erro ao criar proprietário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function atualizarProprietario(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, telefone, cpf, rg } = req.body;

    if (!nome || !telefone) {
        return res.status(400).json({ erro: "Nome e telefone são obrigatórios" });
    }

    try {
        // Verificar se o proprietário existe
        const existente = await proprietarioRepository.buscarPorId(parseInt(id));
        if (!existente) {
            return res.status(404).json({ erro: "Proprietário não encontrado" });
        }

        // Se estiver alterando CPF, verificar se já não existe outro com este CPF
        if (cpf && cpf !== existente.cpf) {
            const cpfExistente = await proprietarioRepository.buscarPorCpf(cpf);
            if (cpfExistente && cpfExistente.id !== parseInt(id)) {
                return res.status(400).json({ erro: "CPF já cadastrado para outro proprietário" });
            }
        }

        // Como não temos um método de atualizar no repository, 
        // vamos criar um aqui mesmo
        const sql = `UPDATE proprietarios SET nome = ?, telefone = ?, cpf = ?, rg = ? WHERE id = ?`;
        await pool.query(sql, [nome, telefone, cpf || null, rg || null, id]);

        return res.status(200).json({
            mensagem: "Proprietário atualizado com sucesso",
            id: parseInt(id),
            nome,
            telefone,
            cpf,
            rg
        });

    } catch (error) {
        console.error("Erro ao atualizar proprietário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function desativarProprietario(req: Request, res: Response) {
    const { id } = req.params;

    try {
        // Verificar se o proprietário existe
        const existente = await proprietarioRepository.buscarPorId(parseInt(id));
        if (!existente) {
            return res.status(404).json({ erro: "Proprietário não encontrado" });
        }

        // Verificar se existem entregas associadas a este proprietário
        const sql = `SELECT COUNT(*) as total FROM entregas WHERE proprietario_id = ? AND ativo = 1`;
        const [rows] = await pool.query<any[]>(sql, [id]);
        
        if (rows[0].total > 0) {
            return res.status(400).json({ 
                erro: "Não é possível desativar este proprietário pois existem entregas associadas a ele"
            });
        }

        // Desativar o proprietário
        const sqlUpdate = `UPDATE proprietarios SET ativo = 0 WHERE id = ?`;
        await pool.query(sqlUpdate, [id]);

        return res.status(200).json({ 
            mensagem: "Proprietário desativado com sucesso" 
        });

    } catch (error) {
        console.error("Erro ao desativar proprietário:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

// Precisamos importar o pool aqui
import { pool } from "../database/database";