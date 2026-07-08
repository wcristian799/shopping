// repositories/localRepository.ts
import { pool } from "../database/database";
import { LocalShopping } from "../models/local";
import { ResultSetHeader } from "mysql2";

async function listarLocais(): Promise<LocalShopping[]> {
    const sql = `SELECT * FROM locais_shopping WHERE ativo = 1 ORDER BY nome`;
    const [rows] = await pool.query<LocalShopping[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<LocalShopping | null> {
    const sql = `SELECT * FROM locais_shopping WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<LocalShopping[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function inserirLocal(nome: string): Promise<number> {
    const sql = `INSERT INTO locais_shopping (nome) VALUES (?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [nome]);
    return result.insertId;
}

async function desativarLocal(id: number): Promise<boolean> {
    const sql = `UPDATE locais_shopping SET ativo = 0 WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
}

export default {
    listarLocais,
    buscarPorId,
    inserirLocal,
    desativarLocal
}