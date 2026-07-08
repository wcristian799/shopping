// models/entrega.ts
import { RowDataPacket } from "mysql2";

export type Entrega = RowDataPacket & {
    id: number;
    data_entrega: Date;
    codigo_autenticacao: string;
    tipo_registro: 'Procedimento padrão' | 'Registro adicional de evidência';
    proprietario_id: number;
    item_id: number;
    usuario_id: number;
    ativo: boolean;
}

export type DadosEntrega = {
    data_entrega: Date;
    tipo_registro: string;
    proprietario: {
        nome: string;
        telefone: string;
        cpf?: string;
        rg?: string;
    };
    item_id: number;
    usuario_id: number;
}