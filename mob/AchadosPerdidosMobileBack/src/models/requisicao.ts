// models/requisicao.ts
import { RowDataPacket } from "mysql2";

export type RequisicaoCliente = RowDataPacket & {
    id: number;
    codigo_requisicao: string;
    nome_cliente: string;
    telefone: string;
    categoria_objeto: string | null;
    descricao: string;
    responsavel_cadastro: string | null;
    data_requisicao: Date;
    encontrado: boolean;
    item_id: number | null;
    operador_id: number | null;
    operador_nome?: string | null;
    assinatura_operador: string | null;
    ativo: boolean;
}

export type DadosRequisicao = {
    nome_cliente: string;
    telefone: string;
    categoria_objeto?: string;
    descricao: string;
    responsavel_cadastro?: string | null;
    operador_id?: number | null;
    assinatura_operador?: string | null;
}
