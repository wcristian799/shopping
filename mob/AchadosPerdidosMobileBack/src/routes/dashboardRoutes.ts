// routes/dashboardRoutes.ts
import { Router } from "express";
import { 
    obterEstatisticasGerais,
    obterItensPorCategoria,
    obterItensPorLocal,
    obterEntregasPorPeriodo,
    obterRequisicoesPorStatus,
    obterItensMaisPerdidos,
    obterItensVencidosNaoEncaminhados,
    obterItensPorMes,
    obterEntregasPorMes
} from "../controllers/dashboardController";
import { middleware } from "./jwtMiddleware";

const rotaDashboard = Router();

rotaDashboard.use(middleware);

rotaDashboard.get("/estatisticas", obterEstatisticasGerais);
rotaDashboard.get("/itens/categoria", obterItensPorCategoria);
rotaDashboard.get("/itens/local", obterItensPorLocal);
rotaDashboard.get("/itens/mais-perdidos", obterItensMaisPerdidos);
rotaDashboard.get("/itens/vencidos-nao-encaminhados", obterItensVencidosNaoEncaminhados);
rotaDashboard.get("/itens/por-mes", obterItensPorMes);
rotaDashboard.get("/entregas/por-periodo", obterEntregasPorPeriodo);
rotaDashboard.get("/entregas/por-mes", obterEntregasPorMes);
rotaDashboard.get("/requisicoes/por-status", obterRequisicoesPorStatus);

export default rotaDashboard;