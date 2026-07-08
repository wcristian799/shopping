// models/caixa.ts
import { RowDataPacket } from "mysql2";

export type CaixaArmazenamento = RowDataPacket & {
    id: number;
    numero: number;
    descricao: string;
    ativo: boolean;
}