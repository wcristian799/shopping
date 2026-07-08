import { pool } from "../database/database";
import { ItemPerdido, ItemPerdidoComFoto, DadosItemGenerico } from "../models/item";
import { ResultSetHeader } from "mysql2";

async function sincronizarSituacoesPorPrazo(): Promise<void> {
    const sql = `
        UPDATE itens_perdidos ip
        INNER JOIN tipos_objeto t ON ip.tipo_id = t.id
        SET ip.situacao_id = CASE
            WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias THEN 3
            WHEN DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 THEN 2
            ELSE ip.situacao_id
        END
        WHERE
            ip.situacao_id IN (1, 2)
            AND t.prazo_dias IS NOT NULL
            AND t.prazo_dias > 0
            AND (
                (DATEDIFF(CURRENT_DATE, ip.data_registro) >= t.prazo_dias AND ip.situacao_id <> 3)
                OR (DATEDIFF(CURRENT_DATE, ip.data_registro) = t.prazo_dias - 1 AND ip.situacao_id <> 2)
            )
    `;

    await pool.query(sql);
}

async function listarItens(): Promise<ItemPerdidoComFoto[]> {
    await sincronizarSituacoesPorPrazo();
    const sql = `
        SELECT ip.*, o.nome_completo AS operador_nome, i.caminho AS caminho_foto
        FROM itens_perdidos ip
        LEFT JOIN operadores o ON o.id = ip.operador_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens i ON i.id = ii.imagem_id
        WHERE ip.ativo = 1
        ORDER BY ip.data_registro DESC
    `;
    const [rows] = await pool.query<ItemPerdidoComFoto[]>(sql);
    return rows;
}

async function buscarPorId(id: number): Promise<ItemPerdidoComFoto | null> {
    await sincronizarSituacoesPorPrazo();
    const sql = `
        SELECT ip.*, o.nome_completo AS operador_nome, i.caminho AS caminho_foto
        FROM itens_perdidos ip
        LEFT JOIN operadores o ON o.id = ip.operador_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens i ON i.id = ii.imagem_id
        WHERE ip.id = ? AND ip.ativo = 1
    `;
    const [rows] = await pool.query<ItemPerdidoComFoto[]>(sql, [id]);
    return rows.length ? rows[0] : null;
}

async function buscarPorNumeroRegistro(numero: number): Promise<ItemPerdido | null> {
    await sincronizarSituacoesPorPrazo();
    const sql = `SELECT * FROM itens_perdidos WHERE numero_registro = ? AND ativo = 1`;
    const [rows] = await pool.query<ItemPerdido[]>(sql, [numero]);
    return rows.length ? rows[0] : null;
}

async function buscarItens(termo: string): Promise<ItemPerdidoComFoto[]> {
    await sincronizarSituacoesPorPrazo();
    const sql = `
        SELECT ip.*, o.nome_completo AS operador_nome, i.caminho AS caminho_foto
        FROM itens_perdidos ip
        LEFT JOIN operadores o ON o.id = ip.operador_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens i ON i.id = ii.imagem_id
        WHERE ip.ativo = 1 
          AND (ip.nome LIKE ? OR ip.marca LIKE ? OR ip.observacao LIKE ? OR ip.nome_entregador LIKE ?)
        ORDER BY ip.data_registro DESC
    `;
    const termoBusca = `%${termo}%`;
    const [rows] = await pool.query<ItemPerdidoComFoto[]>(sql, [termoBusca, termoBusca, termoBusca, termoBusca]);
    return rows;
}

async function buscarItensParecidos(tipoId: number | null, descricao: string): Promise<ItemPerdido[]> {
    await sincronizarSituacoesPorPrazo();

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
        SELECT ip.*, o.nome_completo AS operador_nome
        FROM itens_perdidos ip
        LEFT JOIN operadores o ON o.id = ip.operador_id
        WHERE ip.situacao_id IN (1, 2, 3)
    `;

    const params: Array<number | string> = [];
    if (tipoId) {
        sql += ` AND ip.tipo_id = ?`;
        params.push(tipoId);
    }

    sql += ` AND (${termos
        .map(() => `(LOWER(ip.nome) LIKE ? OR LOWER(COALESCE(ip.marca, '')) LIKE ? OR LOWER(COALESCE(ip.observacao, '')) LIKE ?)`)
        .join(" OR ")}) ORDER BY ip.data_registro DESC LIMIT 10`;

    termos.forEach((termo) => {
        const like = `%${termo}%`;
        params.push(like, like, like);
    });

    const [rows] = await pool.query<ItemPerdido[]>(sql, params);
    return rows;
}

async function obterProximoNumeroRegistro(): Promise<number> {
    const sql = `SELECT MAX(numero_registro) as ultimo FROM itens_perdidos`;
    const [rows] = await pool.query<any[]>(sql);
    return (rows[0]?.ultimo || 0) + 1;
}

async function inserirItem(item: DadosItemGenerico): Promise<number> {
    const numero_registro = await obterProximoNumeroRegistro();

    const sql = `
        INSERT INTO itens_perdidos 
        (numero_registro, nome, marca, numero_lacre, estado_conservacao, 
         observacao, nome_entregador, local_id, situacao_id, usuario_responsavel_id, operador_id,
         assinatura_operador, tipo_id, caixa_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query<ResultSetHeader>(sql, [
        numero_registro,
        item.nome,
        item.marca || null,
        item.numero_lacre,
        item.estado_conservacao,
        item.observacao || null,
        item.nome_entregador || null,
        item.local_id,
        item.usuario_responsavel_id,
        item.operador_id || null,
        item.assinatura_operador || null,
        item.tipo_id,
        item.caixa_id || null
    ]);

    return result.insertId;
}

async function atualizarSituacao(id: number, situacao_id: number): Promise<boolean> {
    const sql = `UPDATE itens_perdidos SET situacao_id = ? WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [situacao_id, id]);
    return result.affectedRows > 0;
}

async function desativarItem(id: number): Promise<boolean> {
    const sql = `UPDATE itens_perdidos SET ativo = 0 WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, [id]);
    return result.affectedRows > 0;
}

export default {
    listarItens,
    buscarPorId,
    buscarPorNumeroRegistro,
    buscarItens,
    buscarItensParecidos,
    obterProximoNumeroRegistro,
    inserirItem,
    sincronizarSituacoesPorPrazo,
    atualizarSituacao,
    desativarItem
};
