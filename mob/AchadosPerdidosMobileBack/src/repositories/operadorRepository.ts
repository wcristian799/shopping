import { pool } from "../database/database";
import { DadosOperador, Operador } from "../models/operador";
import { ResultSetHeader } from "mysql2";

function somenteDigitos(valor: string): string {
    return (valor || "").replace(/\D/g, "");
}

async function listarOperadores(): Promise<Operador[]> {
    const sql = `SELECT * FROM operadores WHERE ativo = 1 ORDER BY nome_completo`;
    const [rows] = await pool.query<Operador[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<Operador | null> {
    const sql = `SELECT * FROM operadores WHERE id = ? AND ativo = 1`;
    const [rows] = await pool.query<Operador[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorCpf(cpf: string): Promise<Operador | null> {
    const sql = `SELECT * FROM operadores WHERE cpf = ? AND ativo = 1`;
    const [rows] = await pool.query<Operador[]>(sql, [somenteDigitos(cpf)]);
    return rows.length ? rows[0] : null;
}

async function inserirOperador(dados: DadosOperador): Promise<number> {
    const sql = `
        INSERT INTO operadores (nome_completo, cpf, data_nascimento)
        VALUES (?, ?, ?)
    `;

    const [result] = await pool.query<ResultSetHeader>(sql, [
        dados.nome_completo.trim(),
        somenteDigitos(dados.cpf),
        dados.data_nascimento
    ]);

    return result.insertId;
}

async function validarCpfOperador(operadorId: number, cpf: string): Promise<boolean> {
    const operador = await buscarPorId(operadorId);
    return !!operador && somenteDigitos(operador.cpf) === somenteDigitos(cpf);
}

export default {
    listarOperadores,
    buscarPorId,
    buscarPorCpf,
    inserirOperador,
    validarCpfOperador
};
