import { Request, Response } from "express";
import { pool } from "../database/database";
import itemRepository from "../repositories/itemRepository";
import { RowDataPacket } from "mysql2";
import * as ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

type TipoRelatorio =
    | "ITENS_CADASTRADOS"
    | "ITENS_DEVOLVIDOS"
    | "ITENS_REQUISITADOS"
    | "ITENS_ENCAMINHADOS"
    | "TODOS";

type RelatorioResumo = {
    totalItens: number;
    totalEntregas: number;
    totalRequisicoes: number;
    totalEncaminhamentos: number;
    totalItensPendentes: number;
    totalItensDevolvidos: number;
    totalItensFinalizados: number;
};

type ItemRelatorio = {
    id: number;
    numeroRegistro: number;
    nome: string;
    marca: string;
    dataRegistro: Date;
    numeroLacre: number;
    estadoConservacao: string;
    observacao: string;
    situacao: string;
    localEncontrado: string;
    tipoObjeto: string;
    caixaArmazenamento: string;
    responsavelCadastro: string;
    nomeEntregador: string;
    assinaturaOperador: string;
    operadorNome: string;
    tempoPermanencia: string;
    usuarioResponsavelId: number;
    caminhoFoto: string | null;
    dataDevolucao: Date | null;
    proprietarioNome: string;
    proprietarioTelefone: string;
    proprietarioCpf: string;
    proprietarioRg: string;
    codigoAutenticacaoEntrega: string;
    fotoEntrega: string | null;
    dataEncaminhamento: Date | null;
    destinoFinal: string;
    dataInventario: Date | null;
};

type EntregaRelatorio = {
    dataEntrega: Date;
    codigoAutenticacao: string;
    proprietario: string;
    proprietarioTelefone: string;
    proprietarioCpf: string;
    proprietarioRg: string;
    item: string;
    numeroRegistro: number;
    numeroLacre: number;
    responsavel: string;
    dataCadastroItem: Date | null;
    tempoPermanencia: string;
    localEncontrado: string;
    tipoObjeto: string;
    caixaArmazenamento: string;
    marcaItem: string;
    estadoConservacao: string;
    observacaoItem: string;
    nomeEntregador: string;
    assinaturaOperadorCadastro: string;
    caminhoFotoEntrega: string | null;
    caminhoFotoItem: string | null;
};

type RequisicaoRelatorio = {
    id: number;
    dataRequisicao: Date;
    codigoRequisicao: string;
    cliente: string;
    telefone: string;
    categoriaObjeto: string;
    descricao: string;
    encontrado: boolean;
    itemEncontrado: string;
    numeroRegistroItem: string;
    numeroLacre: string;
    responsavelCadastro: string;
    assinaturaOperador: string;
    operadorNome: string;
    caminhoFotoItem: string | null;
};

type EncaminhamentoRelatorio = {
    dataEnvio: Date;
    dataInventario: Date | null;
    dataCadastroItem: Date | null;
    tempoPermanencia: string;
    item: string;
    numeroRegistro: number;
    numeroLacre: number;
    destino: string;
    localEncontrado: string;
    tipoObjeto: string;
    caixaArmazenamento: string;
    responsavelEncaminhamento: string;
    caminhoFotoItem: string | null;
};

export type RelatorioPeriodo = {
    dataInicio: Date;
    dataFim: Date;
    dataGeracao: Date;
    protocoloRelatorio: string;
    periodoDescricao: string;
    tempoPeriodo: string;
    tipoRelatorio: TipoRelatorio;
    itens: ItemRelatorio[];
    itensCadastrados: ItemRelatorio[];
    entregas: EntregaRelatorio[];
    requisicoes: RequisicaoRelatorio[];
    encaminhamentos: EncaminhamentoRelatorio[];
    resumo: RelatorioResumo;
};

type ItemRelatorioRow = RowDataPacket & {
    id: number;
    numero_registro: number;
    nome: string;
    marca: string | null;
    data_registro: Date;
    numero_lacre: number;
    estado_conservacao: string;
    observacao: string | null;
    situacao_nome: string | null;
    local_encontrado: string | null;
    tipo_objeto: string | null;
    caixa_armazenamento: string | null;
    responsavel_cadastro: string | null;
    nome_entregador: string | null;
    assinatura_operador: string | null;
    operador_nome: string | null;
    usuario_responsavel_id: number;
    caminho_foto: string | null;
    data_devolucao: Date | null;
    proprietario_nome: string | null;
    proprietario_telefone: string | null;
    proprietario_cpf: string | null;
    proprietario_rg: string | null;
    codigo_autenticacao_entrega: string | null;
    foto_entrega: string | null;
    data_encaminhamento: Date | null;
    destino_final: string | null;
    data_inventario: Date | null;
};

type EntregaRelatorioRow = RowDataPacket & {
    data_entrega: Date;
    codigo_autenticacao: string;
    proprietario: string | null;
    proprietario_telefone: string | null;
    proprietario_cpf: string | null;
    proprietario_rg: string | null;
    item: string | null;
    numero_registro: number | null;
    numero_lacre: number | null;
    responsavel: string | null;
    data_cadastro_item: Date | null;
    local_encontrado: string | null;
    tipo_objeto: string | null;
    caixa_armazenamento: string | null;
    marca_item: string | null;
    estado_conservacao: string | null;
    observacao_item: string | null;
    nome_entregador: string | null;
    assinatura_operador_cadastro: string | null;
    caminho_foto_entrega: string | null;
    caminho_foto_item: string | null;
};

type RequisicaoRelatorioRow = RowDataPacket & {
    id: number;
    data_requisicao: Date;
    codigo_requisicao: string;
    cliente: string;
    telefone: string;
    categoria_objeto: string | null;
    descricao: string;
    encontrado: number | boolean;
    item_encontrado: string | null;
    numero_registro_item: number | null;
    numero_lacre: number | null;
    responsavel_cadastro: string | null;
    assinatura_operador: string | null;
    operador_nome: string | null;
    caminho_foto_item: string | null;
};

type EncaminhamentoRelatorioRow = RowDataPacket & {
    data_envio: Date;
    data_inventario: Date | null;
    data_cadastro_item: Date | null;
    item: string | null;
    numero_registro: number | null;
    numero_lacre: number | null;
    destino: string | null;
    local_encontrado: string | null;
    tipo_objeto: string | null;
    caixa_armazenamento: string | null;
    responsavel_encaminhamento: string | null;
    caminho_foto_item: string | null;
};

const DESCRICOES_TIPO: Record<TipoRelatorio, string> = {
    ITENS_CADASTRADOS: "Itens Cadastrados",
    ITENS_DEVOLVIDOS: "Itens Devolvidos",
    ITENS_REQUISITADOS: "Requisições de Clientes",
    ITENS_ENCAMINHADOS: "Itens Encaminhados",
    TODOS: "Relatório Completo"
};

function normalizarData(data?: Date | null): Date | null {
    if (!data) {
        return null;
    }

    return data instanceof Date ? data : new Date(data);
}

function formatarDataParaBR(data: Date): string {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
        return "-";
    }

    const dia = dataNormalizada.getDate().toString().padStart(2, "0");
    const mes = (dataNormalizada.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataNormalizada.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(data?: Date | null): string {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
        return "-";
    }

    const dia = dataNormalizada.getDate().toString().padStart(2, "0");
    const mes = (dataNormalizada.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataNormalizada.getFullYear();
    const horas = dataNormalizada.getHours().toString().padStart(2, "0");
    const minutos = dataNormalizada.getMinutes().toString().padStart(2, "0");

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

function formatarDataCompacta(data: Date): string {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
        return "";
    }

    const dia = dataNormalizada.getDate().toString().padStart(2, "0");
    const mes = (dataNormalizada.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataNormalizada.getFullYear();

    return `${ano}${mes}${dia}`;
}

function formatarDataISO(data: Date): string {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
        return "";
    }

    const dia = dataNormalizada.getDate().toString().padStart(2, "0");
    const mes = (dataNormalizada.getMonth() + 1).toString().padStart(2, "0");
    const ano = dataNormalizada.getFullYear();

    return `${ano}-${mes}-${dia}`;
}

function formatarTimestampCompacto(data: Date): string {
    const dataNormalizada = normalizarData(data);

    if (!dataNormalizada) {
        return "";
    }

    const ano = dataNormalizada.getFullYear();
    const mes = (dataNormalizada.getMonth() + 1).toString().padStart(2, "0");
    const dia = dataNormalizada.getDate().toString().padStart(2, "0");
    const horas = dataNormalizada.getHours().toString().padStart(2, "0");
    const minutos = dataNormalizada.getMinutes().toString().padStart(2, "0");
    const segundos = dataNormalizada.getSeconds().toString().padStart(2, "0");

    return `${ano}${mes}${dia}-${horas}${minutos}${segundos}`;
}

function normalizarTipoRelatorio(tipo: unknown): TipoRelatorio {
    const valor = typeof tipo === "string" ? tipo.toUpperCase() : "TODOS";
    const tiposValidos: TipoRelatorio[] = [
        "ITENS_CADASTRADOS",
        "ITENS_DEVOLVIDOS",
        "ITENS_REQUISITADOS",
        "ITENS_ENCAMINHADOS",
        "TODOS"
    ];

    return tiposValidos.includes(valor as TipoRelatorio)
        ? (valor as TipoRelatorio)
        : "TODOS";
}

function formatarPeriodo(dataInicio: Date, dataFim: Date): string {
    return `${formatarDataHora(dataInicio)} até ${formatarDataHora(dataFim)}`;
}

function calcularTempoPermanencia(inicio?: Date | null, fim?: Date | null): string {
    if (!inicio || !fim) {
        return "-";
    }

    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    const diferencaMillis = Math.max(0, fimDate.getTime() - inicioDate.getTime());
    const totalHoras = Math.floor(diferencaMillis / (1000 * 60 * 60));
    const dias = Math.floor(totalHoras / 24);
    const horas = totalHoras % 24;

    if (dias > 0) {
        return `${dias} dia(s) e ${horas} hora(s)`;
    }

    if (totalHoras > 0) {
        return `${totalHoras} hora(s)`;
    }

    return "Menos de 1 hora";
}

function gerarProtocoloRelatorio(tipo: TipoRelatorio, dataInicio: Date, dataFim: Date): string {
    const prefixo = tipo.replace("ITENS_", "").replace("TODOS", "GERAL");
    const gerado = formatarTimestampCompacto(new Date());
    const inicio = formatarDataCompacta(dataInicio);
    const fim = formatarDataCompacta(dataFim);
    return `REL-${prefixo}-${inicio}-${fim}-${gerado}`;
}

function aplicarFiltroTipoRelatorio(dados: RelatorioPeriodo, tipo: TipoRelatorio): RelatorioPeriodo {
    if (tipo === "TODOS") {
        return { ...dados, tipoRelatorio: tipo };
    }

    const itens = tipo === "ITENS_CADASTRADOS" ? dados.itens : [];
    const entregas = tipo === "ITENS_DEVOLVIDOS" ? dados.entregas : [];
    const requisicoes = tipo === "ITENS_REQUISITADOS" ? dados.requisicoes : [];
    const encaminhamentos = tipo === "ITENS_ENCAMINHADOS" ? dados.encaminhamentos : [];

    return {
        ...dados,
        tipoRelatorio: tipo,
        itens,
        itensCadastrados: itens,
        entregas,
        requisicoes,
        encaminhamentos,
        resumo: montarResumo(itens, entregas, requisicoes, encaminhamentos)
    };
}

function montarResumo(
    itens: ItemRelatorio[],
    entregas: EntregaRelatorio[],
    requisicoes: RequisicaoRelatorio[],
    encaminhamentos: EncaminhamentoRelatorio[]
): RelatorioResumo {
    const totalItensPendentes = itens.filter((item) =>
        !["Devolvido", "Finalizado"].includes(item.situacao)
    ).length;
    const totalItensDevolvidos = itens.filter((item) => item.situacao === "Devolvido").length;
    const totalItensFinalizados = itens.filter((item) => item.situacao === "Finalizado").length;

    return {
        totalItens: itens.length,
        totalEntregas: entregas.length,
        totalRequisicoes: requisicoes.length,
        totalEncaminhamentos: encaminhamentos.length,
        totalItensPendentes: itens.length ? totalItensPendentes : requisicoes.length,
        totalItensDevolvidos: itens.length ? totalItensDevolvidos : entregas.length,
        totalItensFinalizados: itens.length ? totalItensFinalizados : encaminhamentos.length
    };
}

function tituloRelatorio(tipo: TipoRelatorio): string {
    return DESCRICOES_TIPO[tipo];
}

function safe(valor?: string | null): string {
    if (!valor || !valor.trim()) {
        return "-";
    }

    return valor;
}

function formatarDataSomente(data?: Date | null): string {
    const dataNormalizada = normalizarData(data);
    return dataNormalizada ? formatarDataParaBR(dataNormalizada) : "-";
}

function resolverCaminhoFoto(caminhoRelativo?: string | null): string | null {
    if (!caminhoRelativo || !caminhoRelativo.trim()) {
        return null;
    }

    const diretorioProjeto = process.cwd();
    const caminhoNormalizado = caminhoRelativo.replace(/\//g, path.sep).replace(/\\/g, path.sep);
    const nomeArquivo = path.basename(caminhoNormalizado);

    const tentativas = [
        path.resolve(diretorioProjeto, caminhoNormalizado),
        path.resolve(diretorioProjeto, "src", caminhoNormalizado),
        path.resolve(diretorioProjeto, caminhoNormalizado.replace(/^src[\\/]/, "")),
        path.resolve(diretorioProjeto, "imagens", nomeArquivo),
        path.resolve(caminhoRelativo)
    ];

    for (const tentativa of tentativas) {
        if (fs.existsSync(tentativa) && fs.statSync(tentativa).isFile()) {
            return tentativa;
        }
    }

    return null;
}

function verificarFoto(caminhoFoto?: string | null): string {
    if (!caminhoFoto || !caminhoFoto.trim()) {
        return "Sem foto";
    }

    return resolverCaminhoFoto(caminhoFoto)
        ? caminhoFoto
        : `Arquivo não encontrado: ${caminhoFoto}`;
}

function adicionarCabecalhoTabelaExcel(worksheet: ExcelJS.Worksheet, titulos: string[]) {
    const headerRow = worksheet.addRow(titulos);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });
}

function aplicarBordasLinha(row: ExcelJS.Row) {
    row.eachCell((cell) => {
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
        cell.alignment = { vertical: "top", wrapText: true };
    });
}

export async function gerarRelatorioPeriodo(req: Request, res: Response) {
    const { dataInicio, dataFim, formato, tipo } = req.query;

    if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: "Datas de inicio e fim sao obrigatorias" });
    }

    if (!formato || (formato !== "excel" && formato !== "pdf")) {
        return res.status(400).json({ erro: "Formato deve ser 'excel' ou 'pdf'" });
    }

    try {
        await itemRepository.sincronizarSituacoesPorPrazo();

        const [anoInicio, mesInicio, diaInicio] = (dataInicio as string).split("-").map(Number);
        const [anoFim, mesFim, diaFim] = (dataFim as string).split("-").map(Number);
        const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0);
        const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);
        const tipoNormalizado = normalizarTipoRelatorio(tipo);

        if (formato === "pdf") {
            return await gerarPDFDesktop(inicio, fim, tipoNormalizado, res);
        }

        const dadosRelatorio = aplicarFiltroTipoRelatorio(
            await buscarDadosRelatorio(inicio, fim, tipoNormalizado),
            tipoNormalizado
        );

        if (formato === "excel") {
            return await gerarExcel(dadosRelatorio, res);
        }
    } catch (error) {
        console.error("Erro ao gerar relatorio:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

function encontrarJavaExecutavel(): string | null {
    const candidatos = [
        process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, "bin", "java.exe") : null,
        "C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.9.10-hotspot\\bin\\java.exe",
        "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.17.10-hotspot\\bin\\java.exe",
        "C:\\Program Files\\Eclipse Adoptium\\jre-17.0.17.10-hotspot\\bin\\java.exe"
    ].filter((valor): valor is string => Boolean(valor));

    for (const candidato of candidatos) {
        if (fs.existsSync(candidato)) {
            return candidato;
        }
    }

    return null;
}

function executarJava(args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const javaPath = encontrarJavaExecutavel();
        if (!javaPath) {
            reject(new Error("Java nao encontrado para gerar o PDF do desktop."));
            return;
        }

        const child = spawn(javaPath, args, {
            cwd,
            stdio: ["ignore", "pipe", "pipe"]
        });

        let stderr = "";
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(stderr.trim() || `Processo Java finalizou com codigo ${code}.`));
        });
    });
}

async function gerarPDFDesktop(
    dataInicio: Date,
    dataFim: Date,
    tipo: TipoRelatorio,
    res: Response
) {
    const raizWorkspace = path.resolve(__dirname, "../../../..");
    const pastaDesktop = process.env.DESKTOP_PROJECT_ROOT || path.join(raizWorkspace, "Achados-e-Perdidos-Iguatemi");
    const pastaClasses = process.env.DESKTOP_JAVA_CLASSES_DIR || path.join(raizWorkspace, "tools", "java-out");
    const pastaResources = path.join(pastaDesktop, "src", "resources");
    const libs = path.join(pastaDesktop, "src", "lib", "*");
    const mysqlConnector = process.env.DESKTOP_MYSQL_CONNECTOR || path.join(raizWorkspace, "mysql-connector-j-8.4.0.jar");
    const arquivoTemporario = path.join(
        os.tmpdir(),
        `relatorio-desktop-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
    );

    try {
        await executarJava(
            [
                "-Duser.timezone=America/Sao_Paulo",
                "-cp",
                `${pastaClasses};${pastaResources};${libs};${mysqlConnector}`,
                "DesktopReportCompare",
                formatarDataISO(dataInicio),
                formatarDataISO(dataFim),
                tipo,
                "",
                arquivoTemporario
            ],
            pastaDesktop
        );

        const buffer = await fs.promises.readFile(arquivoTemporario);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=relatorio_${Date.now()}.pdf`);
        res.status(200);
        return res.end(buffer);
    } finally {
        if (fs.existsSync(arquivoTemporario)) {
            await fs.promises.unlink(arquivoTemporario).catch(() => undefined);
        }
    }
}

async function buscarDadosRelatorio(
    dataInicio: Date,
    dataFim: Date,
    tipoRelatorio: TipoRelatorio
): Promise<RelatorioPeriodo> {
    const [itensRows] = await pool.query<ItemRelatorioRow[]>(`
        SELECT
            ip.id,
            ip.numero_registro,
            ip.nome,
            ip.marca,
            ip.data_registro,
            ip.numero_lacre,
            ip.estado_conservacao,
            ip.observacao,
            s.nome AS situacao_nome,
            l.nome AS local_encontrado,
            t.nome AS tipo_objeto,
            CASE
                WHEN c.id IS NULL THEN 'Nenhuma'
                ELSE CONCAT('Caixa ', c.numero, ' - ', COALESCE(c.descricao, 'Sem descricao'))
            END AS caixa_armazenamento,
            COALESCE(u.nome, 'Desconhecido') AS responsavel_cadastro,
            ip.nome_entregador,
            ip.assinatura_operador,
            COALESCE(o.nome_completo, '-') AS operador_nome,
            ip.usuario_responsavel_id,
            img_item.caminho AS caminho_foto,
            e.data_entrega AS data_devolucao,
            p.nome AS proprietario_nome,
            p.telefone AS proprietario_telefone,
            p.cpf AS proprietario_cpf,
            p.rg AS proprietario_rg,
            e.codigo_autenticacao AS codigo_autenticacao_entrega,
            img_entrega.caminho AS foto_entrega,
            idest.data_envio AS data_encaminhamento,
            df.nome AS destino_final,
            idest.data_inventario
        FROM itens_perdidos ip
        LEFT JOIN usuarios u ON u.id = ip.usuario_responsavel_id
        LEFT JOIN operadores o ON o.id = ip.operador_id
        LEFT JOIN locais_shopping l ON l.id = ip.local_id
        LEFT JOIN tipos_objeto t ON t.id = ip.tipo_id
        LEFT JOIN caixas_armazenamento c ON c.id = ip.caixa_id
        LEFT JOIN situacao_objeto s ON s.id = ip.situacao_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens img_item ON img_item.id = ii.imagem_id
        LEFT JOIN entregas e ON e.item_id = ip.id AND e.ativo = 1
        LEFT JOIN proprietarios p ON p.id = e.proprietario_id
        LEFT JOIN imagens_entrega ie ON ie.entrega_id = e.id
        LEFT JOIN imagens img_entrega ON img_entrega.id = ie.imagem_id
        LEFT JOIN itens_destinados idest ON idest.item_id = ip.id AND idest.ativo = 1
        LEFT JOIN destinos_finais df ON df.id = idest.destino_id
        WHERE ip.data_registro BETWEEN ? AND ? AND ip.ativo = 1
        ORDER BY ip.data_registro DESC
    `, [dataInicio, dataFim]);

    const [entregasRows] = await pool.query<EntregaRelatorioRow[]>(`
        SELECT
            e.data_entrega,
            e.codigo_autenticacao,
            p.nome AS proprietario,
            p.telefone AS proprietario_telefone,
            p.cpf AS proprietario_cpf,
            p.rg AS proprietario_rg,
            ip.nome AS item,
            ip.numero_registro,
            ip.numero_lacre,
            COALESCE(u.nome, 'Desconhecido') AS responsavel,
            ip.data_registro AS data_cadastro_item,
            l.nome AS local_encontrado,
            t.nome AS tipo_objeto,
            CASE
                WHEN c.id IS NULL THEN 'Nenhuma'
                ELSE CONCAT('Caixa ', c.numero, ' - ', COALESCE(c.descricao, 'Sem descricao'))
            END AS caixa_armazenamento,
            ip.marca AS marca_item,
            ip.estado_conservacao,
            ip.observacao AS observacao_item,
            ip.nome_entregador,
            ip.assinatura_operador AS assinatura_operador_cadastro,
            img_entrega.caminho AS caminho_foto_entrega,
            img_item.caminho AS caminho_foto_item
        FROM entregas e
        LEFT JOIN proprietarios p ON p.id = e.proprietario_id
        LEFT JOIN itens_perdidos ip ON ip.id = e.item_id
        LEFT JOIN usuarios u ON u.id = e.usuario_id
        LEFT JOIN locais_shopping l ON l.id = ip.local_id
        LEFT JOIN tipos_objeto t ON t.id = ip.tipo_id
        LEFT JOIN caixas_armazenamento c ON c.id = ip.caixa_id
        LEFT JOIN imagens_entrega ie ON ie.entrega_id = e.id
        LEFT JOIN imagens img_entrega ON img_entrega.id = ie.imagem_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens img_item ON img_item.id = ii.imagem_id
        WHERE e.data_entrega BETWEEN ? AND ? AND e.ativo = 1
        ORDER BY e.data_entrega DESC
    `, [dataInicio, dataFim]);

    const [requisicoesRows] = await pool.query<RequisicaoRelatorioRow[]>(`
        SELECT
            rc.id,
            rc.data_requisicao,
            rc.codigo_requisicao,
            rc.nome_cliente AS cliente,
            rc.telefone,
            rc.categoria_objeto,
            rc.descricao,
            rc.encontrado,
            ip.nome AS item_encontrado,
            ip.numero_registro AS numero_registro_item,
            ip.numero_lacre,
            rc.responsavel_cadastro,
            rc.assinatura_operador,
            COALESCE(o.nome_completo, '-') AS operador_nome,
            img_item.caminho AS caminho_foto_item
        FROM requisicoes_cliente rc
        LEFT JOIN itens_perdidos ip ON ip.id = rc.item_id
        LEFT JOIN operadores o ON o.id = rc.operador_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens img_item ON img_item.id = ii.imagem_id
        WHERE rc.data_requisicao BETWEEN ? AND ? AND rc.ativo = 1
        ORDER BY rc.data_requisicao DESC
    `, [dataInicio, dataFim]);

    const [encaminhamentosRows] = await pool.query<EncaminhamentoRelatorioRow[]>(`
        SELECT
            idest.data_envio,
            idest.data_inventario,
            ip.data_registro AS data_cadastro_item,
            ip.nome AS item,
            ip.numero_registro,
            ip.numero_lacre,
            df.nome AS destino,
            l.nome AS local_encontrado,
            t.nome AS tipo_objeto,
            CASE
                WHEN c.id IS NULL THEN 'Nenhuma'
                ELSE CONCAT('Caixa ', c.numero, ' - ', COALESCE(c.descricao, 'Sem descricao'))
            END AS caixa_armazenamento,
            COALESCE(idest.responsavel_encaminhamento, 'Não informado') AS responsavel_encaminhamento,
            img_item.caminho AS caminho_foto_item
        FROM itens_destinados idest
        LEFT JOIN itens_perdidos ip ON ip.id = idest.item_id
        LEFT JOIN destinos_finais df ON df.id = idest.destino_id
        LEFT JOIN locais_shopping l ON l.id = ip.local_id
        LEFT JOIN tipos_objeto t ON t.id = ip.tipo_id
        LEFT JOIN caixas_armazenamento c ON c.id = ip.caixa_id
        LEFT JOIN imagens_item ii ON ii.item_id = ip.id
        LEFT JOIN imagens img_item ON img_item.id = ii.imagem_id
        WHERE idest.data_envio BETWEEN ? AND ? AND idest.ativo = 1
        ORDER BY idest.data_envio DESC
    `, [dataInicio, dataFim]);

    const itens = itensRows.map((item) => {
        const dataFinal = item.data_devolucao ?? item.data_encaminhamento ?? dataFim;
        return {
            id: item.id,
            numeroRegistro: item.numero_registro,
            nome: item.nome,
            marca: item.marca ?? "-",
            dataRegistro: item.data_registro,
            numeroLacre: item.numero_lacre,
            estadoConservacao: item.estado_conservacao,
            observacao: item.observacao ?? "-",
            situacao: item.situacao_nome ?? getSituacaoNome(0),
            localEncontrado: item.local_encontrado ?? "-",
            tipoObjeto: item.tipo_objeto ?? "-",
            caixaArmazenamento: item.caixa_armazenamento ?? "Nenhuma",
            responsavelCadastro: item.responsavel_cadastro ?? "Desconhecido",
            nomeEntregador: item.nome_entregador ?? "Não informado",
            assinaturaOperador: item.assinatura_operador ?? "-",
            operadorNome: item.operador_nome ?? "-",
            tempoPermanencia: calcularTempoPermanencia(item.data_registro, dataFinal),
            usuarioResponsavelId: item.usuario_responsavel_id,
            caminhoFoto: item.caminho_foto ?? null,
            dataDevolucao: item.data_devolucao ?? null,
            proprietarioNome: item.proprietario_nome ?? "-",
            proprietarioTelefone: item.proprietario_telefone ?? "-",
            proprietarioCpf: item.proprietario_cpf ?? "-",
            proprietarioRg: item.proprietario_rg ?? "-",
            codigoAutenticacaoEntrega: item.codigo_autenticacao_entrega ?? "-",
            fotoEntrega: item.foto_entrega ?? null,
            dataEncaminhamento: item.data_encaminhamento ?? null,
            destinoFinal: item.destino_final ?? "-",
            dataInventario: item.data_inventario ?? null
        };
    });

    const entregas = entregasRows.map((entrega) => ({
        dataEntrega: entrega.data_entrega,
        codigoAutenticacao: entrega.codigo_autenticacao,
        proprietario: entrega.proprietario ?? "-",
        proprietarioTelefone: entrega.proprietario_telefone ?? "-",
        proprietarioCpf: entrega.proprietario_cpf ?? "-",
        proprietarioRg: entrega.proprietario_rg ?? "-",
        item: entrega.item ?? "-",
        numeroRegistro: entrega.numero_registro ?? 0,
        numeroLacre: entrega.numero_lacre ?? 0,
        responsavel: entrega.responsavel ?? "Desconhecido",
        dataCadastroItem: entrega.data_cadastro_item ?? null,
        tempoPermanencia: calcularTempoPermanencia(entrega.data_cadastro_item, entrega.data_entrega),
        localEncontrado: entrega.local_encontrado ?? "-",
        tipoObjeto: entrega.tipo_objeto ?? "-",
        caixaArmazenamento: entrega.caixa_armazenamento ?? "Nenhuma",
        marcaItem: entrega.marca_item ?? "-",
        estadoConservacao: entrega.estado_conservacao ?? "-",
        observacaoItem: entrega.observacao_item ?? "-",
        nomeEntregador: entrega.nome_entregador ?? "Não informado",
        assinaturaOperadorCadastro: entrega.assinatura_operador_cadastro ?? "-",
        caminhoFotoEntrega: entrega.caminho_foto_entrega ?? null,
        caminhoFotoItem: entrega.caminho_foto_item ?? null
    }));

    const requisicoes = requisicoesRows.map((req) => ({
        id: req.id,
        dataRequisicao: req.data_requisicao,
        codigoRequisicao: req.codigo_requisicao,
        cliente: req.cliente,
        telefone: req.telefone,
        categoriaObjeto: req.categoria_objeto ?? "-",
        descricao: req.descricao,
        encontrado: Boolean(req.encontrado),
        itemEncontrado: req.item_encontrado ?? "-",
        numeroRegistroItem: req.numero_registro_item ? String(req.numero_registro_item) : "-",
        numeroLacre: req.numero_lacre ? String(req.numero_lacre) : "-",
        responsavelCadastro: req.responsavel_cadastro ?? "Não informado",
        assinaturaOperador: req.assinatura_operador ?? "-",
        operadorNome: req.operador_nome ?? "-",
        caminhoFotoItem: req.caminho_foto_item ?? null
    }));

    const encaminhamentos = encaminhamentosRows.map((enc) => ({
        dataEnvio: enc.data_envio,
        dataInventario: enc.data_inventario ?? null,
        dataCadastroItem: enc.data_cadastro_item ?? null,
        tempoPermanencia: calcularTempoPermanencia(enc.data_cadastro_item, enc.data_envio),
        item: enc.item ?? "-",
        numeroRegistro: enc.numero_registro ?? 0,
        numeroLacre: enc.numero_lacre ?? 0,
        destino: enc.destino ?? "Desconhecido",
        localEncontrado: enc.local_encontrado ?? "-",
        tipoObjeto: enc.tipo_objeto ?? "-",
        caixaArmazenamento: enc.caixa_armazenamento ?? "Nenhuma",
        responsavelEncaminhamento: enc.responsavel_encaminhamento ?? "Não informado",
        caminhoFotoItem: enc.caminho_foto_item ?? null
    }));

    return {
        dataInicio,
        dataFim,
        dataGeracao: new Date(),
        protocoloRelatorio: gerarProtocoloRelatorio(tipoRelatorio, dataInicio, dataFim),
        periodoDescricao: formatarPeriodo(dataInicio, dataFim),
        tempoPeriodo: calcularTempoPermanencia(dataInicio, dataFim),
        tipoRelatorio,
        itens,
        itensCadastrados: itens,
        entregas,
        requisicoes,
        encaminhamentos,
        resumo: montarResumo(itens, entregas, requisicoes, encaminhamentos)
    };
}

async function gerarExcel(dados: RelatorioPeriodo, res: Response) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Achados e Perdidos Iguatemi";

    const resumoSheet = workbook.addWorksheet("Resumo");
    resumoSheet.mergeCells("A1:F1");
    resumoSheet.getCell("A1").value = `RELATÓRIO - ${tituloRelatorio(dados.tipoRelatorio).toUpperCase()}`;
    resumoSheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1E3A8A" } };
    resumoSheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

    resumoSheet.getCell("A3").value = "PERÍODO DO RELATÓRIO";
    resumoSheet.getCell("A3").font = { bold: true, color: { argb: "FFFFFFFF" } };
    resumoSheet.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };

    resumoSheet.getCell("A4").value = "Data Início:";
    resumoSheet.getCell("B4").value = formatarDataSomente(dados.dataInicio);
    resumoSheet.getCell("C4").value = "Data Fim:";
    resumoSheet.getCell("D4").value = formatarDataSomente(dados.dataFim);
    resumoSheet.getCell("A5").value = "Protocolo:";
    resumoSheet.getCell("B5").value = dados.protocoloRelatorio;
    resumoSheet.getCell("C5").value = "Tempo analisado:";
    resumoSheet.getCell("D5").value = dados.tempoPeriodo;
    resumoSheet.getCell("A6").value = "Gerado em:";
    resumoSheet.getCell("B6").value = formatarDataHora(dados.dataGeracao);

    resumoSheet.getCell("A9").value = "RESUMO ESTATÍSTICO";
    resumoSheet.getCell("A9").font = { bold: true, color: { argb: "FFFFFFFF" } };
    resumoSheet.getCell("A9").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };

    adicionarCabecalhoTabelaExcel(resumoSheet, ["Indicador", "Quantidade"]);

    const indicadores: Array<[string, number]> = [];
    if (dados.itensCadastrados) indicadores.push(["Total de Itens Cadastrados:", dados.resumo.totalItens]);
    if (dados.entregas) indicadores.push(["Total de Devoluções:", dados.resumo.totalEntregas]);
    if (dados.requisicoes) indicadores.push(["Total de Requisições:", dados.resumo.totalRequisicoes]);
    if (dados.encaminhamentos) indicadores.push(["Total de Encaminhamentos:", dados.resumo.totalEncaminhamentos]);
    indicadores.push(["Itens Pendentes:", dados.resumo.totalItensPendentes]);
    indicadores.push(["Itens Devolvidos:", dados.resumo.totalItensDevolvidos]);
    indicadores.push(["Itens Finalizados:", dados.resumo.totalItensFinalizados]);

    indicadores.forEach(([label, valor]) => {
        const row = resumoSheet.addRow([label, valor]);
        aplicarBordasLinha(row);
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD8E4FE" } };
    });

    resumoSheet.addRow([]);
    resumoSheet.addRow([`Relatório gerado em: ${formatarDataHora(new Date())}`]);

    resumoSheet.spliceRows(10, 0, []);
    resumoSheet.spliceRows(20, 0, []);

    const criarAbaItens = () => {
        const sheet = workbook.addWorksheet("Itens Cadastrados");
        sheet.mergeCells(1, 1, 1, 27);
        sheet.getCell(1, 1).value = "ITENS CADASTRADOS - HISTÓRICO COMPLETO";
        sheet.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        sheet.addRow([]);
        adicionarCabecalhoTabelaExcel(sheet, [
            "Nº Registro", "Nome", "Marca", "Data Cadastro", "Nº Lacre",
            "Estado", "Observação", "Local", "Categoria", "Caixa",
            "Situação", "Responsável Cadastro", "Entregue por", "Assinatura Operador", "Tempo Permanência",
            "Data Devolução", "Proprietário", "Tel. Proprietário", "CPF", "RG",
            "Código Autenticação", "Foto Cadastro", "Foto Entrega",
            "Data Encaminhamento", "Data Inventário", "Destino Final"
        ]);

        if (!dados.itensCadastrados.length) {
            sheet.addRow(["Nenhum item cadastrado no período."]);
            return;
        }

        dados.itensCadastrados.forEach((item) => {
            const row = sheet.addRow([
                item.numeroRegistro,
                item.nome,
                safe(item.marca),
                formatarDataHora(item.dataRegistro),
                item.numeroLacre,
                safe(item.estadoConservacao),
                safe(item.observacao),
                safe(item.localEncontrado),
                safe(item.tipoObjeto),
                safe(item.caixaArmazenamento),
                safe(item.situacao),
                safe(item.responsavelCadastro),
                safe(item.nomeEntregador),
                safe(item.assinaturaOperador),
                safe(item.tempoPermanencia),
                item.dataDevolucao ? formatarDataHora(item.dataDevolucao) : "-",
                safe(item.proprietarioNome),
                safe(item.proprietarioTelefone),
                safe(item.proprietarioCpf),
                safe(item.proprietarioRg),
                safe(item.codigoAutenticacaoEntrega),
                verificarFoto(item.caminhoFoto),
                verificarFoto(item.fotoEntrega),
                item.dataEncaminhamento ? formatarDataHora(item.dataEncaminhamento) : "-",
                item.dataInventario ? formatarDataHora(item.dataInventario) : "-",
                safe(item.destinoFinal)
            ]);
            aplicarBordasLinha(row);
        });
    };

    const criarAbaEntregas = (nomeAba: string) => {
        const sheet = workbook.addWorksheet(nomeAba);
        sheet.mergeCells(1, 1, 1, 22);
        sheet.getCell(1, 1).value = "DEVOLUÇÕES REALIZADAS - INFORMAÇÕES COMPLETAS";
        sheet.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        sheet.addRow([]);
        adicionarCabecalhoTabelaExcel(sheet, [
            "Data Entrega", "Data Cadastro", "Tempo Permanência", "Código", "Proprietário", "Telefone", "CPF", "RG",
            "Nº Registro", "Item", "Marca", "Nº Lacre", "Estado", "Local/Posto", "Categoria", "Caixa",
            "Entregue por", "Assinatura Operador", "Responsável Entrega", "Observação", "Foto Item", "Foto Entrega"
        ]);

        if (!dados.entregas.length) {
            sheet.addRow(["Nenhuma devolução realizada no período."]);
            return;
        }

        dados.entregas.forEach((entrega) => {
            const row = sheet.addRow([
                formatarDataHora(entrega.dataEntrega),
                entrega.dataCadastroItem ? formatarDataHora(entrega.dataCadastroItem) : "-",
                safe(entrega.tempoPermanencia),
                safe(entrega.codigoAutenticacao),
                safe(entrega.proprietario),
                safe(entrega.proprietarioTelefone),
                safe(entrega.proprietarioCpf),
                safe(entrega.proprietarioRg),
                entrega.numeroRegistro,
                safe(entrega.item),
                safe(entrega.marcaItem),
                entrega.numeroLacre,
                safe(entrega.estadoConservacao),
                safe(entrega.localEncontrado),
                safe(entrega.tipoObjeto),
                safe(entrega.caixaArmazenamento),
                safe(entrega.nomeEntregador),
                safe(entrega.assinaturaOperadorCadastro),
                safe(entrega.responsavel),
                safe(entrega.observacaoItem),
                verificarFoto(entrega.caminhoFotoItem),
                verificarFoto(entrega.caminhoFotoEntrega)
            ]);
            aplicarBordasLinha(row);
        });
    };

    const criarAbaRequisicoes = () => {
        const sheet = workbook.addWorksheet("Requisições");
        sheet.mergeCells(1, 1, 1, 12);
        sheet.getCell(1, 1).value = "REQUISIÇÕES DE CLIENTES NO PERÍODO";
        sheet.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        sheet.addRow([]);
        adicionarCabecalhoTabelaExcel(sheet, [
            "Código", "Data", "Cliente", "Telefone", "Categoria", "Descrição", "Status",
            "Registro Item", "Nº Lacre", "Responsável", "Assinatura Operador", "Foto do Item"
        ]);

        if (!dados.requisicoes.length) {
            sheet.addRow(["Nenhuma requisição registrada no período."]);
            return;
        }

        dados.requisicoes.forEach((req) => {
            const row = sheet.addRow([
                safe(req.codigoRequisicao),
                formatarDataHora(req.dataRequisicao),
                safe(req.cliente),
                safe(req.telefone),
                safe(req.categoriaObjeto),
                safe(req.descricao),
                req.encontrado ? "Encontrado" : "Pendente",
                safe(req.numeroRegistroItem),
                safe(req.numeroLacre),
                safe(req.responsavelCadastro),
                safe(req.assinaturaOperador),
                verificarFoto(req.caminhoFotoItem)
            ]);
            aplicarBordasLinha(row);
        });
    };

    const criarAbaEncaminhamentos = () => {
        const sheet = workbook.addWorksheet("Encaminhamentos");
        sheet.mergeCells(1, 1, 1, 13);
        sheet.getCell(1, 1).value = "ENCAMINHAMENTOS REALIZADOS - INFORMAÇÕES COMPLETAS";
        sheet.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        sheet.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        sheet.addRow([]);
        adicionarCabecalhoTabelaExcel(sheet, [
            "Data Envio", "Data Inventário", "Data Cadastro", "Tempo Permanência", "Nº Registro",
            "Item", "Nº Lacre", "Local/Posto", "Categoria", "Caixa", "Destino", "Responsável", "Foto do Item"
        ]);

        if (!dados.encaminhamentos.length) {
            sheet.addRow(["Nenhum encaminhamento realizado no período."]);
            return;
        }

        dados.encaminhamentos.forEach((enc) => {
            const row = sheet.addRow([
                formatarDataHora(enc.dataEnvio),
                enc.dataInventario ? formatarDataHora(enc.dataInventario) : "-",
                enc.dataCadastroItem ? formatarDataHora(enc.dataCadastroItem) : "-",
                safe(enc.tempoPermanencia),
                enc.numeroRegistro,
                safe(enc.item),
                enc.numeroLacre,
                safe(enc.localEncontrado),
                safe(enc.tipoObjeto),
                safe(enc.caixaArmazenamento),
                safe(enc.destino),
                safe(enc.responsavelEncaminhamento),
                verificarFoto(enc.caminhoFotoItem)
            ]);
            aplicarBordasLinha(row);
        });
    };

    switch (dados.tipoRelatorio) {
        case "ITENS_CADASTRADOS":
            if (dados.itensCadastrados.length) criarAbaItens();
            break;
        case "ITENS_DEVOLVIDOS":
            if (dados.entregas.length) criarAbaEntregas("Itens Devolvidos");
            break;
        case "ITENS_REQUISITADOS":
            if (dados.requisicoes.length) criarAbaRequisicoes();
            break;
        case "ITENS_ENCAMINHADOS":
            if (dados.encaminhamentos.length) criarAbaEncaminhamentos();
            break;
        case "TODOS":
            if (dados.itensCadastrados.length) criarAbaItens();
            if (dados.entregas.length) criarAbaEntregas("Entregas");
            if (dados.requisicoes.length) criarAbaRequisicoes();
            if (dados.encaminhamentos.length) criarAbaEncaminhamentos();
            break;
    }

    workbook.worksheets.forEach((sheet) => {
        for (let i = 1; i <= 30; i += 1) {
            sheet.getColumn(i).width = Math.max(sheet.getColumn(i).width || 10, 16);
        }
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
}

const PDF_AZUL_ESCURO = "#1E3A8A";
const PDF_AZUL_CLARO = "#EFF6FF";
const PDF_CINZA_CLARO = "#F8FAFC";
const PDF_BORDA = "#E2E8F0";
const PDF_TEXTO = "#334155";
const FOTO_LARGURA = 110;
const FOTO_ALTURA = 80;

function adicionarTituloSecaoPDF(doc: PDFKit.PDFDocument, titulo: string) {
    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(PDF_AZUL_ESCURO).text(titulo);
    doc.moveDown(0.3);
}

function adicionarMetricaPDF(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    largura: number,
    altura: number,
    label: string,
    valor: string
) {
    doc.save();
    doc.roundedRect(x, y, largura, altura, 4).fillAndStroke(PDF_CINZA_CLARO, PDF_BORDA);
    doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(8).text(label, x + 8, y + 8, {
        width: largura - 16
    });
    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(10).text(safe(valor), x + 8, y + 22, {
        width: largura - 16
    });
    doc.restore();
}

function criarFotoCellPDF(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    largura: number,
    altura: number,
    label: string,
    caminhoFoto?: string | null
) {
    doc.rect(x, y, largura, altura).stroke(PDF_BORDA);
    if (label) {
        doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(7).text(label, x + 4, y + 4, {
            width: largura - 8,
            align: "center"
        });
    }

    const caminho = resolverCaminhoFoto(caminhoFoto);
    if (!caminho) {
        doc.fillColor("gray").font("Helvetica").fontSize(7).text("Sem foto", x, y + altura / 2 - 4, {
            width: largura,
            align: "center"
        });
        return;
    }

    try {
        doc.image(caminho, x + 4, y + 16, {
            fit: [Math.min(largura - 8, FOTO_LARGURA), Math.min(altura - 20, FOTO_ALTURA)],
            align: "center",
            valign: "center"
        });
    } catch {
        doc.fillColor("red").font("Helvetica").fontSize(6).text("Erro ao carregar", x, y + altura / 2 - 4, {
            width: largura,
            align: "center"
        });
    }
}

function adicionarLinhaInfoPDF(
    doc: PDFKit.PDFDocument,
    y: number,
    label: string,
    valor: string
): number {
    const labelX = 38;
    const valorX = 145;
    doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(8).text(label, labelX, y, {
        width: 100
    });
    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(8).text(safe(valor), valorX, y, {
        width: 220
    });
    return Math.max(doc.y, y + 14);
}

function adicionarHeaderTabelaPDF(
    doc: PDFKit.PDFDocument,
    y: number,
    headers: string[],
    widths: number[]
) {
    let x = 24;
    headers.forEach((header, index) => {
        doc.rect(x, y, widths[index], 22).fillAndStroke(PDF_AZUL_ESCURO, PDF_AZUL_ESCURO);
        doc.fillColor("white").font("Helvetica-Bold").fontSize(7).text(header, x + 2, y + 7, {
            width: widths[index] - 4,
            align: "center"
        });
        x += widths[index];
    });
}

function calcularAlturaLinhaTabelaPDF(
    doc: PDFKit.PDFDocument,
    valores: Array<string | null | undefined>,
    widths: number[],
    fotoColuna?: number
): number {
    let maxHeight = 28;

    valores.forEach((valor, index) => {
        const width = widths[index];
        if (fotoColuna === index) {
            const possuiFoto = typeof valor === "string" && valor.trim().length > 0;
            if (possuiFoto) {
                maxHeight = Math.max(maxHeight, 66);
            }
        } else {
            const textHeight = doc.heightOfString(safe(valor || "-"), {
                width: width - 6,
                align: "left"
            });
            maxHeight = Math.max(maxHeight, Math.max(28, textHeight + 8));
        }
    });

    return maxHeight;
}

function desenharLinhaTabelaPDF(
    doc: PDFKit.PDFDocument,
    y: number,
    valores: Array<string | null | undefined>,
    widths: number[],
    fotoColuna?: number
) : number {
    const alturaLinha = calcularAlturaLinhaTabelaPDF(doc, valores, widths, fotoColuna);
    let x = 24;

    valores.forEach((valor, index) => {
        const width = widths[index];
        doc.rect(x, y, width, alturaLinha).stroke(PDF_BORDA);
        if (fotoColuna === index) {
            criarFotoCellPDF(doc, x, y, width, alturaLinha, "", valor || null);
        } else {
            doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(7).text(safe(valor || "-"), x + 3, y + 4, {
                width: width - 6,
                height: Math.max(20, alturaLinha - 8)
            });
        }
        x += width;
    });

    return alturaLinha;
}

async function gerarPDF(dados: RelatorioPeriodo, res: Response) {
    const doc = new PDFDocument({
        margin: 24,
        size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio_${Date.now()}.pdf`);
    doc.pipe(res);

    const tipoDescricao = tituloRelatorio(dados.tipoRelatorio);
    const headerTop = 24;
    doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(18).text("ACHADOS E PERDIDOS IGUATEMI", 24, headerTop);
    doc.fontSize(12).text(tipoDescricao.toUpperCase(), 24, headerTop + 22);
    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(9).text(
        "Relatório operacional com evidências, movimentações e responsáveis.",
        24,
        headerTop + 40
    );

    doc.roundedRect(400, headerTop, 170, 60, 4).fillAndStroke(PDF_AZUL_CLARO, PDF_BORDA);
    doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(8).text("Protocolo", 408, headerTop + 8);
    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(8).text(safe(dados.protocoloRelatorio), 408, headerTop + 22, {
        width: 154
    });
    doc.text(`Gerado em: ${formatarDataHora(dados.dataGeracao)}`, 408, headerTop + 38, { width: 154 });

    adicionarTituloSecaoPDF(doc, "Resumo executivo");
    const periodoY = doc.y;
    [ 
        ["Início", formatarDataHora(dados.dataInicio)],
        ["Término", formatarDataHora(dados.dataFim)],
        ["Tempo analisado", safe(dados.tempoPeriodo)],
        ["Tipo", tipoDescricao]
    ].forEach(([label, valor], index) => {
        adicionarMetricaPDF(doc, 24 + index * 137, periodoY, 130, 48, label, valor);
    });

    const resumoY = periodoY + 60;
    [
        ["Itens cadastrados", String(dados.resumo.totalItens)],
        ["Devoluções", String(dados.resumo.totalEntregas)],
        ["Requisições", String(dados.resumo.totalRequisicoes)],
        ["Encaminhamentos", String(dados.resumo.totalEncaminhamentos)],
        ["Pendências", String(dados.resumo.totalItensPendentes)]
    ].forEach(([label, valor], index) => {
        adicionarMetricaPDF(doc, 24 + index * 110, resumoY, 102, 48, label, valor);
    });
    doc.y = resumoY + 60;

    adicionarTituloSecaoPDF(doc, "Ocorrência geral");
    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(9).text(
        `No período ${safe(dados.periodoDescricao)}, o posto registrou ${dados.resumo.totalItens} item(ns), ` +
        `${dados.resumo.totalEntregas} devolução(ões), ${dados.resumo.totalRequisicoes} requisição(ões) de cliente e ` +
        `${dados.resumo.totalEncaminhamentos} encaminhamento(s). As linhas abaixo consolidam protocolo, local/posto, ` +
        `responsáveis, evidências fotográficas e tempo de permanência quando houver movimentação.`,
        24,
        doc.y,
        { width: 548 }
    );
    doc.moveDown(1.3);

    if (dados.entregas.length) {
        adicionarTituloSecaoPDF(doc, "Relatório de devolução");
        dados.entregas.forEach((entrega) => {
            const cardHeight = 160;
            let cardTop = doc.y;
            if (cardTop + cardHeight > 730) {
                doc.addPage();
                cardTop = 24;
            }
            doc.rect(24, cardTop, 548, cardHeight).stroke(PDF_BORDA);
            doc.rect(24, cardTop, 350, cardHeight).stroke(PDF_BORDA);
            doc.rect(374, cardTop, 198, cardHeight).fillAndStroke(PDF_CINZA_CLARO, PDF_BORDA);

            doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(11).text(
                `Devolução ${safe(entrega.codigoAutenticacao)}`, 32, cardTop + 8
            );

            let infoY = cardTop + 28;
            [
                ["Protocolo", safe(entrega.codigoAutenticacao)],
                ["Início", formatarDataHora(entrega.dataCadastroItem)],
                ["Término", formatarDataHora(entrega.dataEntrega)],
                ["Tempo em guarda", safe(entrega.tempoPermanencia)],
                ["Posto/Local", safe(entrega.localEncontrado)],
                ["Item", `#${entrega.numeroRegistro} - ${safe(entrega.item)}`],
                ["Categoria", safe(entrega.tipoObjeto)],
                ["Lacre", String(entrega.numeroLacre)],
                ["Entregue por", safe(entrega.nomeEntregador)],
                ["Operador cadastro", safe(entrega.assinaturaOperadorCadastro)],
                ["Responsável entrega", safe(entrega.responsavel)],
                ["Proprietário", `${safe(entrega.proprietario)} | CPF: ${safe(entrega.proprietarioCpf)}`],
                ["Contato", `${safe(entrega.proprietarioTelefone)} | RG: ${safe(entrega.proprietarioRg)}`],
                ["Observação", safe(entrega.observacaoItem)]
            ].forEach(([label, valor]) => {
                infoY = adicionarLinhaInfoPDF(doc, infoY, label, valor);
            });

            doc.fillColor(PDF_AZUL_ESCURO).font("Helvetica-Bold").fontSize(10).text("Evidências", 374, cardTop + 8, {
                width: 198,
                align: "center"
            });
            criarFotoCellPDF(doc, 384, cardTop + 28, 86, 120, "Cadastro", entrega.caminhoFotoItem);
            criarFotoCellPDF(doc, 476, cardTop + 28, 86, 120, "Entrega", entrega.caminhoFotoEntrega);
            doc.y = cardTop + cardHeight + 10;
        });
    }

    if (dados.itensCadastrados.length) {
        doc.addPage();
        adicionarTituloSecaoPDF(doc, "Itens cadastrados e histórico");
        let y = doc.y;
        const headers = ["Registro", "Data", "Item", "Posto/Local", "Situação", "Operador", "Tempo", "Foto"];
        const widths = [42, 70, 100, 82, 60, 90, 60, 44];
        adicionarHeaderTabelaPDF(doc, y, headers, widths);
        y += 22;
        dados.itensCadastrados.forEach((item) => {
            const valores = [
                String(item.numeroRegistro),
                formatarDataHora(item.dataRegistro),
                `${safe(item.nome)}\nLacre: ${item.numeroLacre}`,
                `${safe(item.localEncontrado)}\n${safe(item.caixaArmazenamento)}`,
                safe(item.situacao),
                `${safe(item.responsavelCadastro)}\nAss.: ${safe(item.assinaturaOperador)}`,
                safe(item.tempoPermanencia),
                item.caminhoFoto
            ];
            const altura = calcularAlturaLinhaTabelaPDF(doc, valores, widths, 7);
            if (y + altura > 730) {
                doc.addPage();
                y = 24;
                adicionarHeaderTabelaPDF(doc, y, headers, widths);
                y += 22;
            }
            desenharLinhaTabelaPDF(doc, y, valores, widths, 7);
            y += altura;
        });
        doc.y = y + 10;
    }

    if (dados.requisicoes.length) {
        doc.addPage();
        adicionarTituloSecaoPDF(doc, "Requisições de clientes");
        let y = doc.y;
        const headers = ["Código", "Data", "Cliente", "Categoria", "Descrição", "Status", "Operador", "Foto"];
        const widths = [56, 70, 74, 78, 112, 54, 74, 44];
        adicionarHeaderTabelaPDF(doc, y, headers, widths);
        y += 22;
        dados.requisicoes.forEach((req) => {
            const valores = [
                safe(req.codigoRequisicao),
                formatarDataHora(req.dataRequisicao),
                `${safe(req.cliente)}\n${safe(req.telefone)}`,
                safe(req.categoriaObjeto),
                `${safe(req.descricao)}\nItem: ${safe(req.itemEncontrado)}\nRegistro: ${safe(req.numeroRegistroItem)} | Lacre: ${safe(req.numeroLacre)}`,
                req.encontrado ? "Encontrado" : "Pendente",
                `${safe(req.responsavelCadastro)}\nAss.: ${safe(req.assinaturaOperador)}`,
                req.caminhoFotoItem
            ];
            const altura = calcularAlturaLinhaTabelaPDF(doc, valores, widths, 7);
            if (y + altura > 730) {
                doc.addPage();
                y = 24;
                adicionarHeaderTabelaPDF(doc, y, headers, widths);
                y += 22;
            }
            desenharLinhaTabelaPDF(doc, y, valores, widths, 7);
            y += altura;
        });
        doc.y = y + 10;
    }

    if (dados.encaminhamentos.length) {
        doc.addPage();
        adicionarTituloSecaoPDF(doc, "Encaminhamentos");
        let y = doc.y;
        const headers = ["Envio", "Inventário", "Item", "Posto/Local", "Destino", "Responsável", "Tempo", "Foto"];
        const widths = [62, 62, 96, 84, 74, 72, 62, 44];
        adicionarHeaderTabelaPDF(doc, y, headers, widths);
        y += 22;
        dados.encaminhamentos.forEach((enc) => {
            const valores = [
                formatarDataHora(enc.dataEnvio),
                formatarDataHora(enc.dataInventario),
                `#${enc.numeroRegistro} - ${safe(enc.item)}\nLacre: ${enc.numeroLacre}`,
                `${safe(enc.localEncontrado)}\n${safe(enc.caixaArmazenamento)}`,
                safe(enc.destino),
                safe(enc.responsavelEncaminhamento),
                safe(enc.tempoPermanencia),
                enc.caminhoFotoItem
            ];
            const altura = calcularAlturaLinhaTabelaPDF(doc, valores, widths, 7);
            if (y + altura > 730) {
                doc.addPage();
                y = 24;
                adicionarHeaderTabelaPDF(doc, y, headers, widths);
                y += 22;
            }
            desenharLinhaTabelaPDF(doc, y, valores, widths, 7);
            y += altura;
        });
        doc.y = y + 10;
    }

    doc.fillColor(PDF_TEXTO).font("Helvetica").fontSize(8).text(
        `Documento gerado pelo sistema de Achados e Perdidos Iguatemi. Protocolo: ${safe(dados.protocoloRelatorio)}`,
        24,
        doc.page.height - 30,
        { width: 548, align: "right" }
    );

    doc.end();
}

function getSituacaoNome(situacaoId: number): string {
    switch (situacaoId) {
        case 1: return "No prazo";
        case 2: return "Vence hoje";
        case 3: return "Vencido";
        case 4: return "Devolvido";
        case 5: return "Finalizado";
        default: return "Desconhecida";
    }
}

export async function obterDadosParaRelatorio(req: Request, res: Response) {
    const { dataInicio, dataFim, tipo } = req.query;

    if (!dataInicio || !dataFim) {
        return res.status(400).json({ erro: "Datas de inicio e fim sao obrigatorias" });
    }

    try {
        await itemRepository.sincronizarSituacoesPorPrazo();

        const [anoInicio, mesInicio, diaInicio] = (dataInicio as string).split("-").map(Number);
        const [anoFim, mesFim, diaFim] = (dataFim as string).split("-").map(Number);
        const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0);
        const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);
        const tipoNormalizado = normalizarTipoRelatorio(tipo);

        const dados = aplicarFiltroTipoRelatorio(
            await buscarDadosRelatorio(inicio, fim, tipoNormalizado),
            tipoNormalizado
        );

        return res.status(200).json(dados);
    } catch (error) {
        console.error("Erro ao obter dados para relatorio:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}
