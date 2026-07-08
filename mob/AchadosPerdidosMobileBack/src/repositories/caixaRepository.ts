// repositories/caixaRepository.ts
import { pool } from "../database/database";
import { CaixaArmazenamento } from "../models/caixa";
import { ResultSetHeader } from "mysql2";

async function listarCaixas(): Promise<CaixaArmazenamento[]> {
    const sql = `SELECT * FROM caixas_armazenamento WHERE ativo = 1 ORDER BY numero`;
    const [rows] = await pool.query<CaixaArmazenamento[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<CaixaArmazenamento | null> {
    const sql = `SELECT * FROM caixas_armazenamento WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<CaixaArmazenamento[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorNumero(numero: number): Promise<CaixaArmazenamento | null> {
    const sql = `SELECT * FROM caixas_armazenamento WHERE numero = ? AND ativo = 1`;
    const [rows] = await pool.query<CaixaArmazenamento[]>(sql, [numero]);
    return rows.length ? rows[0] : null;
}

async function inserirCaixa(numero: number, descricao: string): Promise<number> {
    const sql = `INSERT INTO caixas_armazenamento (numero, descricao) VALUES (?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [numero, descricao]);
    return result.insertId;
}

async function desativarCaixa(id: number): Promise<boolean> {
    const sql = `UPDATE caixas_armazenamento SET ativo = 0 WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
}

export default {
    listarCaixas,
    buscarPorId,
    buscarPorNumero,
    inserirCaixa,
    desativarCaixa
}