// routes/entregaRoutes.ts
import { Router } from "express";
import { 
    listarEntregas,
    buscarEntregaPorId,
    buscarEntregaPorCodigo,
    registrarEntrega
} from "../controllers/entregaController";
import { middleware } from "./jwtMiddleware";

const rotaEntrega = Router();

rotaEntrega.use(middleware);

rotaEntrega.get("/", listarEntregas);
rotaEntrega.get("/codigo/:codigo", buscarEntregaPorCodigo);
rotaEntrega.get("/:id", buscarEntregaPorId);
rotaEntrega.post("/", registrarEntrega);

export default rotaEntrega;