// routes/proprietarioRoutes.ts
import { Router } from "express";
import { 
    listarProprietarios,
    buscarProprietarioPorId,
    buscarProprietarioPorCpf,
    criarProprietario,
    atualizarProprietario,
    desativarProprietario
} from "../controllers/proprietarioController";
import { middleware } from "./jwtMiddleware";

const rotaProprietario = Router();

rotaProprietario.use(middleware);

rotaProprietario.get("/", listarProprietarios);
rotaProprietario.get("/cpf/:cpf", buscarProprietarioPorCpf);
rotaProprietario.get("/:id", buscarProprietarioPorId);
rotaProprietario.post("/", criarProprietario);
rotaProprietario.put("/:id", atualizarProprietario);
rotaProprietario.delete("/:id", desativarProprietario);

export default rotaProprietario;