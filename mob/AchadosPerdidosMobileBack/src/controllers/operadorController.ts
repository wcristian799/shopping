import { Request, Response } from "express";
import operadorRepository from "../repositories/operadorRepository";

function somenteDigitos(valor: string): string {
    return (valor || "").replace(/\D/g, "");
}

export async function listarOperadores(req: Request, res: Response) {
    try {
        const operadores = await operadorRepository.listarOperadores();
        return res.status(200).json(operadores);
    } catch (error) {
        console.error("Erro ao listar operadores:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function criarOperador(req: Request, res: Response) {
    const { nome_completo, cpf, data_nascimento } = req.body;

    if (!nome_completo || !cpf || !data_nascimento) {
        return res.status(400).json({ erro: "Campos obrigatórios: nome_completo, cpf, data_nascimento" });
    }

    const cpfNormalizado = somenteDigitos(cpf);
    if (cpfNormalizado.length !== 11) {
        return res.status(400).json({ erro: "CPF inválido" });
    }

    try {
        const existente = await operadorRepository.buscarPorCpf(cpfNormalizado);
        if (existente) {
            return res.status(400).json({ erro: "Já existe um operador cadastrado com esse CPF" });
        }

        const id = await operadorRepository.inserirOperador({
            nome_completo,
            cpf: cpfNormalizado,
            data_nascimento
        });

        return res.status(201).json({
            mensagem: "Operador criado com sucesso",
            id
        });
    } catch (error) {
        console.error("Erro ao criar operador:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function validarOperador(req: Request, res: Response) {
    const { operador_id, cpf } = req.body;

    if (!operador_id || !cpf) {
        return res.status(400).json({ erro: "operador_id e cpf são obrigatórios" });
    }

    try {
        const valido = await operadorRepository.validarCpfOperador(Number(operador_id), cpf);
        if (!valido) {
            return res.status(400).json({ erro: "CPF não confere com o operador selecionado" });
        }

        return res.status(200).json({ mensagem: "Operador validado com sucesso" });
    } catch (error) {
        console.error("Erro ao validar operador:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
