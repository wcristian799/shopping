// models/item-eletronico.ts
import { RowDataPacket } from "mysql2";

export type ItemEletronico = RowDataPacket & {
    id: number;
    modelo: string;
    item_id: number;
}

export type DadosItemEletronico = {
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
    modelo: string;
}
