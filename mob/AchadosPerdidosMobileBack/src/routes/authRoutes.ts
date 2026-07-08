// routes/authRoutes.ts
import { Router } from "express";
import { login, cadastrarUsuario } from "../controllers/authController";

const rotaAuth = Router();

rotaAuth.post("/login", login);
rotaAuth.post("/cadastro", cadastrarUsuario);

export default rotaAuth;