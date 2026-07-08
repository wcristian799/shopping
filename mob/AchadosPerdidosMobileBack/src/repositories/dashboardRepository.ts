// repositories/dashboardRepository.ts
import { pool } from "../database/database";
import { RowDataPacket } from "mysql2";

// Definição do tipo ItemPerdidoComFoto
export type ItemPerdidoComFoto = RowDataPacket & {
    id: number;
    numero_registro: number;
    nome: string;
    marca: string | null;
    data_registro: Date;
    numero_lacre: number;
    estado_conservacao: string;
    observacao: string | null;
    local_id: number;
    situacao_id: number;
    usuario_responsavel_id: number;
    tipo_id: number;
    caixa_id: number | null;
    ativo: boolean;
    caminho_foto?: string | null;
};

export type EstatisticasGerais = {
    total_itens: number;
    total_itens_no_prazo: number;
    total_itens_vence_hoje: number;
    total_itens_vencidos: number;
    total_itens_devolvidos: number;
    total_itens_finalizados: number;
    total_entregas: number;
    total_requisicoes: number;
    total_requisicoes_atendidas: number;
    total_encaminhamentos: number;
}

export type ItemPorCategoria = RowDataPacket & {
    categoria: string;
    quantidade: number;
}

export type ItemPorLocal = RowDataPacket & {
    local: string;
    quantidade: number;
}

export type EntregaPorDia = RowDataPacket & {
    data: string;
    quantidade: number;
}

export type RequisicaoPorStatus = RowDataPacket & {
    status: string;
    quantidade: number;
}

export type TopItem = RowDataPacket & {
    item_id: number;
    nome: string;
    quantidade: number;
}

async function obterEstatisticasGerais(): Promise<EstatisticasGerais> {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM itens_perdidos WHERE ativo = 1) AS total_itens,
            (SELECT COUNT(*) FROM itens_perdidos WHERE situacao_id = 1 AND ativo = 1) AS total_itens_no_prazo,
            (SELECT COUNT(*) FROM itens_perdidos WHERE situacao_id = 2 AND ativo = 1) AS total_itens_vence_hoje,
            (SELECT COUNT(*) FROM itens_perdidos WHERE situacao_id = 3 AND ativo = 1) AS total_itens_vencidos,
            (SELECT COUNT(*) FROM itens_perdidos WHERE situacao_id = 4 AND ativo = 1) AS total_itens_devolvidos,
            (SELECT COUNT(*) FROM itens_perdidos WHERE situacao_id = 5 AND ativo = 1) AS total_itens_finalizados,
            (SELECT COUNT(*) FROM entregas WHERE ativo = 1) AS total_entregas,
            (SELECT COUNT(*) FROM requisicoes_cliente WHERE ativo = 1) AS total_requisicoes,
            (SELECT COUNT(*) FROM requisicoes_cliente WHERE encontrado = 1 AND ativo = 1) AS total_requisicoes_atendidas,
            (SELECT COUNT(*) FROM itens_destinados WHERE ativo = 1) AS total_encaminhamentos
    `;
    
    const [rows] = await pool.query<any[]>(sql);
    return rows[0] as EstatisticasGerais;
}

async function obterItensPorCategoria(): Promise<ItemPorCategoria[]> {
    const sql = `
        SELECT t.nome AS categoria, COUNT(ip.id) AS quantidade
        FROM itens_perdidos ip
        JOIN tipos_objeto t ON t.id = ip.tipo_id
        WHERE ip.ativo = 1
        GROUP BY t.id, t.nome
        ORDER BY quantidade DESC
    `;
    const [rows] = await pool.query<ItemPorCategoria[]>(sql);
    return rows;
}

async function obterItensPorLocal(): Promise<ItemPorLocal[]> {
    const sql = `
        SELECT l.nome AS local, COUNT(ip.id) AS quantidade
        FROM itens_perdidos ip
        JOIN locais_shopping l ON l.id = ip.local_id
        WHERE ip.ativo = 1
        GROUP BY l.id, l.nome
        ORDER BY quantidade DESC
    `;
    const [rows] = await pool.query<ItemPorLocal[]>(sql);
    return rows;
}

async function obterEntregasPorPeriodo(dataInicio: string, dataFim: string): Promise<EntregaPorDia[]> {
    const sql = `
        SELECT DATE(data_entrega) AS data, COUNT(*) AS quantidade
        FROM entregas
        WHERE data_entrega BETWEEN ? AND ? AND ativo = 1
        GROUP BY DATE(data_entrega)
        ORDER BY data
    `;
    const [rows] = await pool.query<EntregaPorDia[]>(sql, [dataInicio, dataFim]);
    return rows;
}

async function obterRequisicoesPorStatus(): Promise<RequisicaoPorStatus[]> {
    const sql = `
        SELECT 
            CASE 
                WHEN encontrado = 1 THEN 'Atendidas'
                ELSE 'Pendentes'
            END AS status,
            COUNT(*) AS quantidade
        FROM requisicoes_cliente
        WHERE ativo = 1
        GROUP BY encontrado
    `;
    const [rows] = await pool.query<RequisicaoPorStatus[]>(sql);
    return rows;
}

async function obterItensMaisPerdidos(limite: number = 10): Promise<TopItem[]> {
    const sql = `
        SELECT ip.id AS item_id, ip.nome, COUNT(*) AS quantidade
        FROM itens_perdidos ip
        WHERE ip.ativo = 1
        GROUP BY ip.id, ip.nome
        ORDER BY quantidade DESC
        LIMIT ?
    `;
    const [rows] = await pool.query<TopItem[]>(sql, [limite]);
    return rows;
}

async function obterItensVencidosNaoEncaminhados(): Promise<ItemPerdidoComFoto[]> {
    const sql = `
        SELECT ip.*, i.caminho AS caminho_foto
        FROM itens_perdidos ip
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens i ON i.id = ii.imagem_id
        WHERE ip.situacao_id = 3 
          AND ip.ativo = 1
          AND NOT EXISTS (
              SELECT 1 FROM itens_destinados idest 
              WHERE idest.item_id = ip.id AND idest.ativo = 1
          )
        ORDER BY ip.data_registro
    `;
    const [rows] = await pool.query<ItemPerdidoComFoto[]>(sql);
    return rows;
}

async function obterItensPorMes(ano: number): Promise<any[]> {
    const sql = `
        SELECT 
            MONTH(data_registro) AS mes,
            COUNT(*) AS quantidade
        FROM itens_perdidos
        WHERE YEAR(data_registro) = ? AND ativo = 1
        GROUP BY MONTH(data_registro)
        ORDER BY mes
    `;
    const [rows] = await pool.query<any[]>(sql, [ano]);
    return rows;
}

async function obterEntregasPorMes(ano: number): Promise<any[]> {
    const sql = `
        SELECT 
            MONTH(data_entrega) AS mes,
            COUNT(*) AS quantidade
        FROM entregas
        WHERE YEAR(data_entrega) = ? AND ativo = 1
        GROUP BY MONTH(data_entrega)
        ORDER BY mes
    `;
    const [rows] = await pool.query<any[]>(sql, [ano]);
    return rows;
}

async function obterResumoParaRelatorio(dataInicio: string, dataFim: string): Promise<any> {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM itens_perdidos 
             WHERE data_registro BETWEEN ? AND ? AND ativo = 1) AS itens_periodo,
            (SELECT COUNT(*) FROM entregas 
             WHERE data_entrega BETWEEN ? AND ? AND ativo = 1) AS entregas_periodo,
            (SELECT COUNT(*) FROM requisicoes_cliente 
             WHERE data_requisicao BETWEEN ? AND ? AND ativo = 1) AS requisicoes_periodo,
            (SELECT COUNT(*) FROM itens_destinados 
             WHERE data_envio BETWEEN ? AND ? AND ativo = 1) AS encaminhamentos_periodo
    `;
    
    const [rows] = await pool.query<any[]>(sql, [
        dataInicio, dataFim,
        dataInicio, dataFim,
        dataInicio, dataFim,
        dataInicio, dataFim
    ]);
    
    return rows[0];
}

export default {
    obterEstatisticasGerais,
    obterItensPorCategoria,
    obterItensPorLocal,
    obterEntregasPorPeriodo,
    obterRequisicoesPorStatus,
    obterItensMaisPerdidos,
    obterItensVencidosNaoEncaminhados,
    obterItensPorMes,
    obterEntregasPorMes,
    obterResumoParaRelatorio
}