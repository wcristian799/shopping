// routes/usuarioRoutes.ts
import { Router } from "express";
import { 
    listarUsuarios, 
    buscarUsuarioPorId, 
    alterarSenha, 
    desativarUsuario 
} from "../controllers/usuarioController";
import { middleware } from "./jwtMiddleware";

const rotaUsuario = Router();

// Todas as rotas de usuário precisam de autenticação
rotaUsuario.use(middleware);

rotaUsuario.get("/", listarUsuarios);
rotaUsuario.get("/:id", buscarUsuarioPorId);
rotaUsuario.put("/:id/senha", alterarSenha);
rotaUsuario.delete("/:id", desativarUsuario);

export default rotaUsuario;