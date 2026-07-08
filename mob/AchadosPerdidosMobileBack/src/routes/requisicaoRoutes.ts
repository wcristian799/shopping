// routes/requisicaoRoutes.ts
import { Router } from "express";
import { 
    listarRequisicoesPendentes,
    listarTodasRequisicoes,
    buscarRequisicaoPorId,
    buscarRequisicoesParecidas,
    cadastrarRequisicao,
    associarItemEncontrado
} from "../controllers/requisicaoController";
import { middleware } from "./jwtMiddleware";

const rotaRequisicao = Router();

// Rotas públicas (cadastro de requisição não precisa de login)
rotaRequisicao.post("/", cadastrarRequisicao);

// Rotas que precisam de autenticação
rotaRequisicao.get("/parecidas", middleware, buscarRequisicoesParecidas);
rotaRequisicao.get("/pendentes", middleware, listarRequisicoesPendentes);
rotaRequisicao.get("/todas", middleware, listarTodasRequisicoes);
rotaRequisicao.get("/:id", middleware, buscarRequisicaoPorId);
rotaRequisicao.put("/:id/encontrado", middleware, associarItemEncontrado);

export default rotaRequisicao;
