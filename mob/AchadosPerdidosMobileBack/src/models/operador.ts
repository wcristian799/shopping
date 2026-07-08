import { RowDataPacket } from "mysql2";

export type Operador = RowDataPacket & {
    id: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: Date;
    ativo: boolean;
    data_cadastro: Date;
};

export type DadosOperador = {
    nome_completo: string;
    cpf: string;
    data_nascimento: string;
};
