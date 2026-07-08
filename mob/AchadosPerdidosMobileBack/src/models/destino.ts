// models/destino.ts
import { RowDataPacket } from "mysql2";

export type DestinoFinal = RowDataPacket & {
    id: number;
    nome: string;
    ativo: boolean;
}

export type ItemDestinado = RowDataPacket & {
    id: number;
    data_envio: Date;
    data_inventario: Date | null;
    item_id: number;
    destino_id: number;
    responsavel_encaminhamento: string | null;
    ativo: boolean;
}

export type DadosEncaminhamento = {
    data_envio: Date;
    data_inventario?: Date | null;
    item_id: number;
    destino_id: number;
    responsavel_encaminhamento?: string | null;
}
