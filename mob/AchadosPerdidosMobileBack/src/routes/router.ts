// routes/router.ts
import { Router } from "express";
import rotaAuth from "./authRoutes";
import rotaUsuario from "./usuarioRoutes";
import rotaProprietario from "./proprietarioRoutes";
import rotaLocal from "./localRoutes";
import rotaTipo from "./tipoRoutes";
import rotaCaixa from "./caixaRoutes";
import rotaOperador from "./operadorRoutes";
import rotaItem from "./itemRoutes";
import rotaEntrega from "./entregaRoutes";
import rotaDestino from "./destinoRoutes";
import rotaRequisicao from "./requisicaoRoutes";
import rotaImagem from "./imagemRoutes";
import rotaDashboard from "./dashboardRoutes";
import rotaRelatorio from "./relatorioRoutes";

const handlerRouter = Router();

// Rotas públicas
handlerRouter.use("/auth", rotaAuth);

// Rotas que podem ter partes públicas e privadas (a autenticação está dentro de cada rota)
handlerRouter.use("/usuarios", rotaUsuario);
handlerRouter.use("/proprietarios", rotaProprietario);
handlerRouter.use("/locais", rotaLocal);
handlerRouter.use("/tipos", rotaTipo);
handlerRouter.use("/caixas", rotaCaixa);
handlerRouter.use("/operadores", rotaOperador);
handlerRouter.use("/itens", rotaItem);
handlerRouter.use("/entregas", rotaEntrega);
handlerRouter.use("/destinos", rotaDestino);
handlerRouter.use("/requisicoes", rotaRequisicao);
handlerRouter.use("/imagens", rotaImagem);
handlerRouter.use("/dashboard", rotaDashboard);
handlerRouter.use("/relatorios", rotaRelatorio);

// Rota de teste
handlerRouter.get("/health", (req, res) => {
    res.json({ status: "OK", message: "API funcionando!" });
});

export default handlerRouter;
