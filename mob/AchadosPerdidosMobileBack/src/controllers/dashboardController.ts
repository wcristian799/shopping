// controllers/dashboardController.ts
import { Request, Response } from "express";
import dashboardRepository from "../repositories/dashboardRepository";
import itemRepository from "../repositories/itemRepository";

export async function obterEstatisticasGerais(req: Request, res: Response) {
    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const estatisticas = await dashboardRepository.obterEstatisticasGerais();
        return res.status(200).json(estatisticas);
    } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterItensPorCategoria(req: Request, res: Response) {
    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const dados = await dashboardRepository.obterItensPorCategoria();
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter itens por categoria:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterItensPorLocal(req: Request, res: Response) {
    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const dados = await dashboardRepository.obterItensPorLocal();
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter itens por local:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterEntregasPorPeriodo(req: Request, res: Response) {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: "Datas de início e fim são obrigatórias" });
    }

    try {
        const dados = await dashboardRepository.obterEntregasPorPeriodo(
            dataInicio as string,
            dataFim as string
        );
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter entregas por período:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterRequisicoesPorStatus(req: Request, res: Response) {
    try {
        const dados = await dashboardRepository.obterRequisicoesPorStatus();
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter requisições por status:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterItensMaisPerdidos(req: Request, res: Response) {
    const { limite } = req.query;
    const limiteNum = limite ? parseInt(limite as string) : 10;

    try {
        const dados = await dashboardRepository.obterItensMaisPerdidos(limiteNum);
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter itens mais perdidos:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterItensVencidosNaoEncaminhados(req: Request, res: Response) {
    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const dados = await dashboardRepository.obterItensVencidosNaoEncaminhados();
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter itens vencidos não encaminhados:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterItensPorMes(req: Request, res: Response) {
    const { ano } = req.query;
    const anoNum = ano ? parseInt(ano as string) : new Date().getFullYear();

    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const dados = await dashboardRepository.obterItensPorMes(anoNum);
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter itens por mês:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterEntregasPorMes(req: Request, res: Response) {
    const { ano } = req.query;
    const anoNum = ano ? parseInt(ano as string) : new Date().getFullYear();

    try {
        const dados = await dashboardRepository.obterEntregasPorMes(anoNum);
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter entregas por mês:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function obterResumoParaRelatorio(req: Request, res: Response) {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: "Datas de início e fim são obrigatórias" });
    }

    try {
        await itemRepository.sincronizarSituacoesPorPrazo();
        const dados = await dashboardRepository.obterResumoParaRelatorio(
            dataInicio as string,
            dataFim as string
        );
        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter resumo para relatório:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
