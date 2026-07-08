// routes/destinoRoutes.ts
import { Router } from "express";
import { 
    listarDestinos,
    listarItensDestinados,
    encaminharItem
} from "../controllers/destinoController";
import { middleware } from "./jwtMiddleware";

const rotaDestino = Router();

rotaDestino.use(middleware);

rotaDestino.get("/", listarDestinos);
rotaDestino.get("/itens", listarItensDestinados);
rotaDestino.post("/encaminhar", encaminharItem);

export default rotaDestino;