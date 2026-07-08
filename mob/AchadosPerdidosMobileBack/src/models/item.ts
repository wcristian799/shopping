// models/item.ts
import { RowDataPacket } from "mysql2";

export type ItemPerdido = RowDataPacket & {
    id: number;
    numero_registro: number;
    nome: string;
    marca: string | null;
    data_registro: Date;
    numero_lacre: number;
    estado_conservacao: 'preservado' | 'desgastado' | 'danificado';
    observacao: string | null;
    nome_entregador: string | null
    local_id: number;
    situacao_id: number;
    usuario_responsavel_id: number;
    operador_id: number | null;
    operador_nome?: string | null;
    assinatura_operador: string | null;
    tipo_id: number;
    caixa_id: number | null;
    ativo: boolean;
}

// Para quando fizer JOIN com imagens (igual seu Java)
export type ItemPerdidoComFoto = ItemPerdido & {
    caminho_foto: string | null;
}

export type DadosItemGenerico = {
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
}
