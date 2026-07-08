// routes/relatorioRoutes.ts
import { Router } from "express";
import { 
    gerarRelatorioPeriodo,
    obterDadosParaRelatorio
} from "../controllers/relatorioController";
import { middleware } from "./jwtMiddleware";

const rotaRelatorio = Router();

rotaRelatorio.use(middleware);

rotaRelatorio.get("/gerar", gerarRelatorioPeriodo);
rotaRelatorio.get("/dados", obterDadosParaRelatorio);

export default rotaRelatorio;