// repositories/authRepository.ts
import { pool } from "../database/database";
import { Usuario, DadosCadastroUsuario } from "../models/usuario";
import { ResultSetHeader } from "mysql2";

async function validarLogin(email: string): Promise<Usuario | null> {
    const sql = `SELECT * FROM usuarios WHERE email = ? AND ativo = 1`;
    const [rows] = await pool.query<Usuario[]>(sql, [email]);
    return rows.length ? rows[0] : null;
}

async function cadastrarUsuario(dados: DadosCadastroUsuario): Promise<Usuario | null> {
    const sql = `INSERT INTO usuarios (nome, email, senha, nivel_acesso_id) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [
        dados.nome,
        dados.email,
        dados.senha,
        dados.nivel_acesso_id
    ]);

    if (result.insertId) {
        const usuario: Usuario = {
            id: result.insertId,
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            nivel_acesso_id: dados.nivel_acesso_id,
            ativo: true,
            data_cadastro: new Date()
        } as Usuario;
        return usuario;
    }
    return null;
}

export default {
    validarLogin,
    cadastrarUsuario
}