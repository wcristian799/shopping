// repositories/imagemRepository.ts
import { pool } from "../database/database";
import { Imagem, ImagemItem, ImagemEntrega } from "../models/imagem";
import { ResultSetHeader } from "mysql2";

async function salvarImagem(caminho: string): Promise<number> {
    const sql = `INSERT INTO imagens (caminho) VALUES (?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [caminho]);
    return result.insertId;
}

async function associarImagemItem(imagemId: number, itemId: number): Promise<boolean> {
    const sql = `INSERT INTO imagens_item (imagem_id, item_id) VALUES (?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [imagemId, itemId]);
    return result.affectedRows > 0;
}

async function associarImagemEntrega(imagemId: number, entregaId: number): Promise<boolean> {
    const sql = `INSERT INTO imagens_entrega (imagem_id, entrega_id) VALUES (?, ?)`;
    const [result] = await pool.query<ResultSetHeader>(sql, [imagemId, entregaId]);
    return result.affectedRows > 0;
}

async function buscarImagensPorItemId(itemId: number): Promise<Imagem[]> {
    const sql = `
        SELECT i.* 
        FROM imagens i
        JOIN imagens_item ii ON ii.imagem_id = i.id
        WHERE ii.item_id = ?
        ORDER BY i.data_upload DESC
    `;
    const [rows] = await pool.query<Imagem[]>(sql, [itemId]);
    return rows;
}

async function buscarImagensPorEntregaId(entregaId: number): Promise<Imagem[]> {
    const sql = `
        SELECT i.* 
        FROM imagens i
        JOIN imagens_entrega ie ON ie.imagem_id = i.id
        WHERE ie.entrega_id = ?
        ORDER BY i.data_upload DESC
    `;
    const [rows] = await pool.query<Imagem[]>(sql, [entregaId]);
    return rows;
}

export default {
    salvarImagem,
    associarImagemItem,
    associarImagemEntrega,
    buscarImagensPorItemId,
    buscarImagensPorEntregaId
}