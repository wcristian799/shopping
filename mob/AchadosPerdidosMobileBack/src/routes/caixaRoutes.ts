// routes/caixaRoutes.ts
import { Router } from "express";
import { 
    listarCaixas,
    buscarCaixaPorId,
    buscarCaixaPorNumero,
    criarCaixa,
    desativarCaixa
} from "../controllers/caixaController";
import { middleware } from "./jwtMiddleware";

const rotaCaixa = Router();

rotaCaixa.use(middleware);

rotaCaixa.get("/", listarCaixas);
rotaCaixa.get("/numero/:numero", buscarCaixaPorNumero);
rotaCaixa.get("/:id", buscarCaixaPorId);
rotaCaixa.post("/", criarCaixa);
rotaCaixa.delete("/:id", desativarCaixa);

export default rotaCaixa;