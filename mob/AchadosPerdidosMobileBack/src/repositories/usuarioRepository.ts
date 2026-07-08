// repositories/usuarioRepository.ts
import { pool } from "../database/database";
import { Usuario } from "../models/usuario";
import { ResultSetHeader } from "mysql2";

async function listarUsuarios(): Promise<Usuario[]> {
    const sql = `SELECT * FROM usuarios WHERE ativo = 1 ORDER BY nome`;
    const [rows] = await pool.query<Usuario[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<Usuario | null> {
    const sql = `SELECT * FROM usuarios WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<Usuario[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorEmail(email: string): Promise<Usuario | null> {
    const sql = `SELECT * FROM usuarios WHERE email = ? AND ativo = 1`;
    const [rows] = await pool.query<Usuario[]>(sql, [email]);
    return rows.length ? rows[0] : null;
}

async function alterarSenha(id: number, novaSenha: string): Promise<boolean> {
    const sql = `UPDATE usuarios SET senha = ? WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [novaSenha, id]);
    return result.affectedRows > 0;
}

async function desativarUsuario(id: number): Promise<boolean> {
    const sql = `UPDATE usuarios SET ativo = 0 WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
}

export default {
    listarUsuarios,
    buscarPorId,
    buscarPorEmail,
    alterarSenha,
    desativarUsuario
}