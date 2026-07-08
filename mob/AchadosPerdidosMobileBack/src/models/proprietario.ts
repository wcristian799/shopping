// models/proprietario.ts
import { RowDataPacket } from "mysql2";

export type Proprietario = RowDataPacket & {
    id: number;
    nome: string;
    telefone: string;
    cpf: string | null;
    rg: string | null;
    ativo: boolean;
}

export type DadosProprietario = {
    nome: string;
    telefone: string;
    cpf?: string;
    rg?: string;
}