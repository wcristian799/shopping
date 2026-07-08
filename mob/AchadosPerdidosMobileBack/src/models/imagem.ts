// models/imagem.ts
import { RowDataPacket } from "mysql2";

export type Imagem = RowDataPacket & {
    id: number;
    caminho: string;
    data_upload: Date;
}

export type ImagemItem = RowDataPacket & {
    id: number;
    imagem_id: number;
    item_id: number;
}

export type ImagemEntrega = RowDataPacket & {
    id: number;
    imagem_id: number;
    entrega_id: number;
}