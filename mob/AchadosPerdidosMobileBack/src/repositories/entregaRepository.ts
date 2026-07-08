// repositories/entregaRepository.ts
import { pool } from "../database/database";
import { Entrega, DadosEntrega } from "../models/entrega";
import { ResultSetHeader } from "mysql2";
import proprietarioRepository from "./proprietarioRepository";

async function listarEntregas(): Promise<Entrega[]> {
    const sql = `SELECT * FROM entregas WHERE ativo = 1 ORDER BY data_entrega DESC`;
    const [rows] = await pool.query<Entrega[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<Entrega | null> {
    const sql = `SELECT * FROM entregas WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<Entrega[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorCodigo(codigo: string): Promise<Entrega | null> {
    const sql = `SELECT * FROM entregas WHERE codigo_autenticacao = ? AND ativo = 1`;
    const [rows] = await pool.query<Entrega[]>(sql, [codigo]);
    return rows.length ? rows[0] : null;
}

async function inserirEntrega(dados: DadosEntrega): Promise<number> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Verificar se proprietário já existe pelo CPF
        let proprietarioId: number;
        
        if (dados.proprietario.cpf) {
            const existente = await proprietarioRepository.buscarPorCpf(dados.proprietario.cpf);
            if (existente) {
                proprietarioId = existente.id;
            } else {
                proprietarioId = await proprietarioRepository.inserirProprietario(dados.proprietario);
            }
        } else {
            proprietarioId = await proprietarioRepository.inserirProprietario(dados.proprietario);
        }

        // 2. Gerar código de autenticação
        const codigoAutenticacao = Math.random().toString(36).substring(2, 10).toUpperCase();

        // 3. Inserir entrega
        const sqlEntrega = `
            INSERT INTO entregas 
            (data_entrega, codigo_autenticacao, tipo_registro, proprietario_id, item_id, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.query<ResultSetHeader>(sqlEntrega, [
            dados.data_entrega,
            codigoAutenticacao,
            dados.tipo_registro,
            proprietarioId,
            dados.item_id,
            dados.usuario_id
        ]);

        // 4. Atualizar situação do item para "Devolvido" (id 4)
        await connection.query(
            `UPDATE itens_perdidos SET situacao_id = 4 WHERE id = ?`,
            [dados.item_id]
        );

        await connection.query(
            `UPDATE requisicoes_cliente
             SET encontrado = 1
             WHERE item_id = ? AND ativo = 1`,
            [dados.item_id]
        );

        await connection.commit();
        return result.insertId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export default {
    listarEntregas,
    buscarPorId,
    buscarPorCodigo,
    inserirEntrega
}
