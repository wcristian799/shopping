// repositories/tipoRepository.ts
import { pool } from "../database/database";
import { TipoObjeto } from "../models/tipo";
import { ResultSetHeader } from "mysql2";

async function listarTipos(): Promise<TipoObjeto[]> {
    const sql = `SELECT * FROM tipos_objeto ORDER BY nome`;
    const [rows] = await pool.query<TipoObjeto[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<TipoObjeto | null> {
    const sql = `SELECT * FROM tipos_objeto WHERE id = ?`;
    const [rows] = await pool.query<TipoObjeto[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function inserirTipo(nome: string, prazo_dias: number): Promise<number> {
    const sql = `INSERT INTO tipos_objeto (nome, prazo_dias) VALUES (?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [nome, prazo_dias]);
    return result.insertId;
}

export default {
    listarTipos,
    buscarPorId,
    inserirTipo
}