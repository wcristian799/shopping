// routes/tipoRoutes.ts
import { Router } from "express";
import { 
    listarTipos,
    buscarTipoPorId,
    criarTipo
} from "../controllers/tipoController";
import { middleware } from "./jwtMiddleware";

const rotaTipo = Router();

rotaTipo.use(middleware);

rotaTipo.get("/", listarTipos);
rotaTipo.get("/:id", buscarTipoPorId);
rotaTipo.post("/", criarTipo);

export default rotaTipo;