// repositories/itemEletronicoRepository.ts
import { pool } from "../database/database";
import { ItemEletronico, DadosItemEletronico } from "../models/item-eletronico";
import { ResultSetHeader } from "mysql2";
import itemRepository from "./itemRepository";

async function inserirItemEletronico(dados: DadosItemEletronico): Promise<number> {
    // Primeiro insere o item genérico
    const itemId = await itemRepository.inserirItem({
        nome: dados.nome,
        marca: dados.marca,
        numero_lacre: dados.numero_lacre,
        estado_conservacao: dados.estado_conservacao,
        observacao: dados.observacao,
        nome_entregador: dados.nome_entregador,
        local_id: dados.local_id,
        tipo_id: dados.tipo_id,
        caixa_id: dados.caixa_id,
        usuario_responsavel_id: dados.usuario_responsavel_id,
        operador_id: dados.operador_id,
        assinatura_operador: dados.assinatura_operador
    });

    if (itemId) {
        // Depois insere os dados específicos de eletrônico
        const sql = `INSERT INTO itens_eletronicos (modelo, item_id) VALUES (?, ?)`;
        await pool.query<ResultSetHeader>(sql, [dados.modelo, itemId]);
    }

    return itemId;
}

async function buscarPorItemId(itemId: number): Promise<ItemEletronico | null> {
    const sql = `SELECT * FROM itens_eletronicos WHERE item_id = ?`;
    const [rows] = await pool.query<ItemEletronico[]>(sql, [itemId]);
    return rows.length ? rows[0] : null;
}

export default {
    inserirItemEletronico,
    buscarPorItemId
}
