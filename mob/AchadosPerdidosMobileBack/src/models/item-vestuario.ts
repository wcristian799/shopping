// models/item-vestuario.ts
import { RowDataPacket } from "mysql2";

export type ItemVestuario = RowDataPacket & {
    id: number;
    cor: string;
    tamanho: 'PP' | 'P' | 'M' | 'G' | 'GG';
    item_id: number;
}

export type DadosItemVestuario = {
    nome: string;
    marca?: string;
    numero_lacre: number;
    estado_conservacao: 'preservado' | 'desgastado' | 'danificado';
    observacao?: string;
    nome_entregador?: string;
    local_id: number;
    tipo_id: number;
    caixa_id?: number | null;
    usuario_responsavel_id: number;
    operador_id?: number | null;
    assinatura_operador?: string | null;
    cor: string;
    tamanho: 'PP' | 'P' | 'M' | 'G' | 'GG';
}
