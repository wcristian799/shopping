// models/usuario.ts
import { RowDataPacket } from "mysql2";

export type Usuario = RowDataPacket & {
    id: number;
    nome: string;
    email: string;
    senha: string;
    nivel_acesso_id: number;
    ativo: boolean;
    data_cadastro: Date;
}

export type NivelAcesso = RowDataPacket & {
    id: number;
    nome: string;
}

export type DadosLogin = {
    email: string;
    senha: string;
}

export type DadosCadastroUsuario = {
    nome: string;
    email: string;
    senha: string;
    nivel_acesso_id: number;
}