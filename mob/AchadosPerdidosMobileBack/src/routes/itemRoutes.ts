// routes/itemRoutes.ts
import { Router } from "express";
import { 
    listarItens,
    buscarItemPorId,
    buscarItemPorNumeroRegistro,
    buscarItens,
    buscarItensParecidos,
    cadastrarItemGenerico,
    cadastrarItemEletronico,
    cadastrarItemVestuario,
    atualizarSituacao,
    sincronizarSituacoes,
    desativarItem
} from "../controllers/itemController";
import { middleware } from "./jwtMiddleware";

const rotaItem = Router();

// Rotas públicas (consulta)
rotaItem.get("/", listarItens);
rotaItem.get("/buscar", buscarItens);
rotaItem.get("/parecidos", buscarItensParecidos);
rotaItem.get("/numero/:numero", buscarItemPorNumeroRegistro);
rotaItem.get("/:id", buscarItemPorId);

// Rotas que precisam de autenticação
rotaItem.post("/generico", middleware, cadastrarItemGenerico);
rotaItem.post("/eletronico", middleware, cadastrarItemEletronico);
rotaItem.post("/vestuario", middleware, cadastrarItemVestuario);
rotaItem.post("/sincronizar-situacoes", middleware, sincronizarSituacoes);
rotaItem.put("/:id/situacao", middleware, atualizarSituacao);
rotaItem.delete("/:id", middleware, desativarItem);

export default rotaItem;
