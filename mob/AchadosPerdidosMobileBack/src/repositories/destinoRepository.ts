// repositories/destinoRepository.ts
import { pool } from "../database/database";
import { DestinoFinal, ItemDestinado, DadosEncaminhamento } from "../models/destino";
import { ResultSetHeader } from "mysql2";

async function listarDestinos(): Promise<DestinoFinal[]> {
    const sql = `SELECT * FROM destinos_finais WHERE ativo = 1 ORDER BY nome`;
    const [rows] = await pool.query<DestinoFinal[]>(sql);
    return rows;
}

async function buscarDestinoPorId(id: number): Promise<DestinoFinal | null> {
    const sql = `SELECT * FROM destinos_finais WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<DestinoFinal[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function listarItensDestinados(): Promise<ItemDestinado[]> {
    const sql = `SELECT * FROM itens_destinados WHERE ativo = 1 ORDER BY data_envio DESC`;
    const [rows] = await pool.query<ItemDestinado[]>(sql);
    return rows;
}

async function inserirEncaminhamento(dados: DadosEncaminhamento): Promise<number> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Inserir item destinado
        const sql = `
            INSERT INTO itens_destinados (data_envio, data_inventario, item_id, destino_id, responsavel_encaminhamento)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.query<ResultSetHeader>(sql, [
            dados.data_envio,
            dados.data_inventario || null,
            dados.item_id,
            dados.destino_id,
            dados.responsavel_encaminhamento || null
        ]);

        // 2. Atualizar situação do item para "Finalizado" (id 5)
        await connection.query(
            `UPDATE itens_perdidos SET situacao_id = 5 WHERE id = ?`,
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
    listarDestinos,
    buscarDestinoPorId,
    listarItensDestinados,
    inserirEncaminhamento
}
