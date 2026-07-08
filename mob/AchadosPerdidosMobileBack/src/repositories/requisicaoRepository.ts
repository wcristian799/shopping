import { pool } from "../database/database";
import { RequisicaoCliente, DadosRequisicao } from "../models/requisicao";
import { ResultSetHeader } from "mysql2";

function gerarCodigoRequisicao(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

async function listarRequisicoesPendentes(): Promise<RequisicaoCliente[]> {
    const sql = `
        SELECT rc.*, o.nome_completo AS operador_nome
        FROM requisicoes_cliente rc
        LEFT JOIN operadores o ON o.id = rc.operador_id
        WHERE rc.encontrado = 0 AND rc.ativo = 1 
        ORDER BY rc.data_requisicao DESC
    `;
    const [rows] = await pool.query<RequisicaoCliente[]>(sql);
    return rows;
}

async function listarTodasRequisicoes(): Promise<RequisicaoCliente[]> {
    const sql = `
        SELECT rc.*, o.nome_completo AS operador_nome
        FROM requisicoes_cliente rc
        LEFT JOIN operadores o ON o.id = rc.operador_id
        WHERE rc.ativo = 1 
        ORDER BY rc.data_requisicao DESC
    `;
    const [rows] = await pool.query<RequisicaoCliente[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<RequisicaoCliente | null> {
    const sql = `
        SELECT rc.*, o.nome_completo AS operador_nome
        FROM requisicoes_cliente rc
        LEFT JOIN operadores o ON o.id = rc.operador_id
        WHERE rc.id = ? AND rc.ativo = 1
    `;
    const [rows] = await pool.query<RequisicaoCliente[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function inserirRequisicao(dados: DadosRequisicao): Promise<number> {
    const codigoRequisicao = gerarCodigoRequisicao();
    const sql = `
        INSERT INTO requisicoes_cliente
        (codigo_requisicao, nome_cliente, telefone, categoria_objeto, descricao, responsavel_cadastro, operador_id, assinatura_operador)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(sql, [
        codigoRequisicao,
        dados.nome_cliente,
        dados.telefone,
        dados.categoria_objeto || null,
        dados.descricao,
        dados.responsavel_cadastro || null,
        dados.operador_id || null,
        dados.assinatura_operador || null
    ]);
    return result.insertId;
}

async function associarItemEncontrado(requisicaoId: number, itemId: number): Promise<boolean> {
    const sql = `
        UPDATE requisicoes_cliente 
        SET item_id = ?, encontrado = 1 
        WHERE id = ? AND encontrado = 0
    `;
    const [result] = await pool.query<ResultSetHeader>(sql, [itemId, requisicaoId]);
    return result.affectedRows > 0;
}

async function buscarRequisicoesParecidas(categoria: string | null, descricao: string): Promise<RequisicaoCliente[]> {
    if (!descricao || !descricao.trim()) {
        return [];
    }

    const palavras = descricao
        .toLowerCase()
        .split(/\s+/)
        .map((palavra) => palavra.trim())
        .filter((palavra) => palavra.length >= 3 && !/\d/.test(palavra));

    const termos = palavras.length ? palavras : [descricao.toLowerCase().trim()];

    let sql = `
        SELECT rc.*, o.nome_completo AS operador_nome
        FROM requisicoes_cliente rc
        LEFT JOIN operadores o ON o.id = rc.operador_id
        WHERE rc.encontrado = 0 AND rc.ativo = 1 AND (
            ${termos.map(() => `LOWER(rc.descricao) LIKE ?`).join(" OR ")}
        )
    `;

    const params: string[] = termos.map((termo) => `%${termo}%`);

    if (categoria && categoria.trim()) {
        sql += ` ORDER BY CASE WHEN rc.categoria_objeto = ? THEN 0 ELSE 1 END, rc.data_requisicao DESC LIMIT 10`;
        params.push(categoria);
    } else {
        sql += ` ORDER BY rc.data_requisicao DESC LIMIT 10`;
    }

    const [rows] = await pool.query<RequisicaoCliente[]>(sql, params);
    return rows;
}

export default {
    listarRequisicoesPendentes,
    listarTodasRequisicoes,
    buscarPorId,
    inserirRequisicao,
    associarItemEncontrado,
    buscarRequisicoesParecidas
};
