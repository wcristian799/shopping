// models/situacao.ts
import { RowDataPacket } from "mysql2";

export type SituacaoObjeto = RowDataPacket & {
    id: number;
    nome: string; // "No prazo", "Vence hoje", "Vencido", "Devolvido", "Finalizado"
}