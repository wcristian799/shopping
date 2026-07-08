// repositories/proprietarioRepository.ts
import { pool } from "../database/database";
import { Proprietario, DadosProprietario } from "../models/proprietario";
import { ResultSetHeader } from "mysql2";

async function listarProprietarios(): Promise<Proprietario[]> {
    const sql = `SELECT * FROM proprietarios WHERE ativo = 1 ORDER BY nome`;
    const [rows] = await pool.query<Proprietario[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<Proprietario | null> {
    const sql = `SELECT * FROM proprietarios WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<Proprietario[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorCpf(cpf: string): Promise<Proprietario | null> {
    const sql = `SELECT * FROM proprietarios WHERE cpf = ? AND ativo = 1`;
    const [rows] = await pool.query<Proprietario[]>(sql, [cpf]);
    return rows.length ? rows[0] : null;
}

async function inserirProprietario(dados: DadosProprietario): Promise<number> {
    const sql = `INSERT INTO proprietarios (nome, telefone, cpf, rg) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [
        dados.nome,
        dados.telefone,
        dados.cpf || null,
        dados.rg || null
    ]);
    return result.insertId;
}

export default {
    listarProprietarios,
    buscarPorId,
    buscarPorCpf,
    inserirProprietario
}