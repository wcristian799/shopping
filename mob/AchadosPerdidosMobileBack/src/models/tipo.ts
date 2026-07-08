// models/tipo.ts
import { RowDataPacket } from "mysql2";

export type TipoObjeto = RowDataPacket & {
    id: number;
    nome: string;
    prazo_dias: number;
}