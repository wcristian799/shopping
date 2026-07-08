// routes/localRoutes.ts
import { Router } from "express";
import { 
    listarLocais,
    buscarLocalPorId,
    criarLocal,
    desativarLocal
} from "../controllers/localController";
import { middleware } from "./jwtMiddleware";

const rotaLocal = Router();

rotaLocal.use(middleware);

rotaLocal.get("/", listarLocais);
rotaLocal.get("/:id", buscarLocalPorId);
rotaLocal.post("/", criarLocal);
rotaLocal.delete("/:id", desativarLocal);

export default rotaLocal;