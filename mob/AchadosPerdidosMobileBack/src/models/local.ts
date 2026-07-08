// models/local.ts
import { RowDataPacket } from "mysql2";

export type LocalShopping = RowDataPacket & {
    id: number;
    nome: string;
    ativo: boolean;
}