import { Router } from "express";
import { criarOperador, listarOperadores, validarOperador } from "../controllers/operadorController";
import { middleware } from "./jwtMiddleware";

const rotaOperador = Router();

rotaOperador.use(middleware);

rotaOperador.get("/", listarOperadores);
rotaOperador.post("/", criarOperador);
rotaOperador.post("/validar", validarOperador);

export default rotaOperador;
