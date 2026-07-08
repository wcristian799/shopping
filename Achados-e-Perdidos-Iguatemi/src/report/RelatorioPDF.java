package report;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

public class RelatorioPDF {

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
    private final SimpleDateFormat dateOnlyFormat = new SimpleDateFormat("dd/MM/yyyy");

    private static final DeviceRgb AZUL_ESCURO = new DeviceRgb(30, 58, 138);
    private static final DeviceRgb AZUL_CLARO = new DeviceRgb(239, 246, 255);
    private static final DeviceRgb CINZA_CLARO = new DeviceRgb(248, 250, 252);
    private static final DeviceRgb BORDA = new DeviceRgb(226, 232, 240);
    private static final DeviceRgb TEXTO = new DeviceRgb(51, 65, 85);
    private static final float FOTO_LARGURA = 110;
    private static final float FOTO_ALTURA = 80;

    public void gerarPDF(RelatorioDTO relatorio, String caminhoArquivo) throws Exception {
        PdfWriter writer = new PdfWriter(new FileOutputStream(caminhoArquivo));
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(24, 24, 24, 24);

        PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");
        PdfFont normalFont = PdfFontFactory.createFont("Helvetica");

        adicionarCabecalho(document, relatorio, boldFont, normalFont);
        adicionarResumoExecutivo(document, relatorio, boldFont, normalFont);
        adicionarOcorrenciaGeral(document, relatorio, boldFont, normalFont);

        if (relatorio.getEntregas() != null && !relatorio.getEntregas().isEmpty()) {
            adicionarSecaoDevolucoes(document, relatorio, boldFont, normalFont);
        }

        if (relatorio.getItensCadastrados() != null && !relatorio.getItensCadastrados().isEmpty()) {
            adicionarSecaoItens(document, relatorio, boldFont, normalFont);
        }

        if (relatorio.getRequisicoes() != null && !relatorio.getRequisicoes().isEmpty()) {
            adicionarSecaoRequisicoes(document, relatorio, boldFont, normalFont);
        }

        if (relatorio.getEncaminhamentos() != null && !relatorio.getEncaminhamentos().isEmpty()) {
            adicionarSecaoEncaminhamentos(document, relatorio, boldFont, normalFont);
        }

        adicionarRodape(document, relatorio, normalFont);
        document.close();
    }

    private void adicionarCabecalho(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        String tipoRelatorio = relatorio.getTipoRelatorio() != null ?
                relatorio.getTipoRelatorio().getDescricao() : "Relatório Completo";

        Table header = new Table(UnitValue.createPercentArray(new float[]{68, 32}));
        header.setWidth(UnitValue.createPercentValue(100));
        header.setMarginBottom(12);

        Cell tituloCell = new Cell().setBorder(Border.NO_BORDER);
        tituloCell.add(new Paragraph("ACHADOS E PERDIDOS IGUATEMI")
                .setFont(boldFont)
                .setFontSize(18)
                .setFontColor(AZUL_ESCURO));
        tituloCell.add(new Paragraph(tipoRelatorio.toUpperCase())
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(TEXTO));
        tituloCell.add(new Paragraph("Relatório operacional com evidências, movimentações e responsáveis.")
                .setFont(normalFont)
                .setFontSize(9)
                .setFontColor(TEXTO));

        Cell metaCell = new Cell().setBorder(new SolidBorder(BORDA, 1)).setBackgroundColor(AZUL_CLARO).setPadding(8);
        metaCell.add(new Paragraph("Protocolo")
                .setFont(boldFont)
                .setFontSize(8)
                .setFontColor(AZUL_ESCURO));
        metaCell.add(new Paragraph(safe(relatorio.getProtocoloRelatorio()))
                .setFont(normalFont)
                .setFontSize(8)
                .setFontColor(TEXTO));
        metaCell.add(new Paragraph("Gerado em: " + dateFormat.format(relatorio.getDataGeracao() != null ? relatorio.getDataGeracao() : new Date()))
                .setFont(normalFont)
                .setFontSize(8)
                .setFontColor(TEXTO));

        header.addCell(tituloCell);
        header.addCell(metaCell);
        document.add(header);
    }

    private void adicionarResumoExecutivo(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Resumo executivo", boldFont);

        Table periodo = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}));
        periodo.setWidth(UnitValue.createPercentValue(100));
        periodo.setMarginBottom(10);
        adicionarMetrica(periodo, "Início", dateFormat.format(relatorio.getDataInicio()), boldFont, normalFont);
        adicionarMetrica(periodo, "Término", dateFormat.format(relatorio.getDataFim()), boldFont, normalFont);
        adicionarMetrica(periodo, "Tempo analisado", safe(relatorio.getTempoPeriodo()), boldFont, normalFont);
        adicionarMetrica(periodo, "Tipo", relatorio.getTipoRelatorio().getDescricao(), boldFont, normalFont);
        document.add(periodo);

        Table resumo = new Table(UnitValue.createPercentArray(new float[]{20, 20, 20, 20, 20}));
        resumo.setWidth(UnitValue.createPercentValue(100));
        resumo.setMarginBottom(12);
        adicionarMetrica(resumo, "Itens cadastrados", String.valueOf(relatorio.getTotalItens()), boldFont, normalFont);
        adicionarMetrica(resumo, "Devoluções", String.valueOf(relatorio.getTotalEntregas()), boldFont, normalFont);
        adicionarMetrica(resumo, "Requisições", String.valueOf(relatorio.getTotalRequisicoes()), boldFont, normalFont);
        adicionarMetrica(resumo, "Encaminhamentos", String.valueOf(relatorio.getTotalEncaminhamentos()), boldFont, normalFont);
        adicionarMetrica(resumo, "Pendências", String.valueOf(relatorio.getTotalItensPendentes()), boldFont, normalFont);
        document.add(resumo);
    }

    private void adicionarOcorrenciaGeral(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Ocorrência geral", boldFont);

        String texto = "No período " + safe(relatorio.getPeriodoDescricao()) +
                ", o posto registrou " + relatorio.getTotalItens() + " item(ns), " +
                relatorio.getTotalEntregas() + " devolução(ões), " +
                relatorio.getTotalRequisicoes() + " requisição(ões) de cliente e " +
                relatorio.getTotalEncaminhamentos() + " encaminhamento(s). " +
                "As linhas abaixo consolidam protocolo, local/posto, responsáveis, evidências fotográficas e tempo de permanência quando houver movimentação.";

        document.add(new Paragraph(texto)
                .setFont(normalFont)
                .setFontSize(9)
                .setFontColor(TEXTO)
                .setMarginBottom(12));
    }

    private void adicionarSecaoDevolucoes(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Relatório de devolução", boldFont);

        for (RelatorioDTO.EntregaRelatorio entrega : relatorio.getEntregas()) {
            Table card = new Table(UnitValue.createPercentArray(new float[]{64, 36}));
            card.setWidth(UnitValue.createPercentValue(100));
            card.setMarginBottom(10);

            Cell infoCell = new Cell().setBorder(new SolidBorder(BORDA, 1)).setPadding(8);
            infoCell.add(new Paragraph("Devolução " + safe(entrega.getCodigoAutenticacao()))
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(AZUL_ESCURO)
                    .setMarginBottom(6));

            Table info = new Table(UnitValue.createPercentArray(new float[]{28, 72}));
            info.setWidth(UnitValue.createPercentValue(100));
            adicionarLinhaInfo(info, "Protocolo", entrega.getCodigoAutenticacao(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Início", formatarDataHora(entrega.getDataCadastroItem()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Término", formatarDataHora(entrega.getDataEntrega()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Tempo em guarda", entrega.getTempoPermanencia(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Posto/Local", entrega.getLocalEncontrado(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Item", "#" + entrega.getNumeroRegistro() + " - " + safe(entrega.getItem()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Categoria", entrega.getTipoObjeto(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Lacre", String.valueOf(entrega.getNumeroLacre()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Entregue por", entrega.getNomeEntregador(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Operador cadastro", entrega.getAssinaturaOperadorCadastro(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Responsável entrega", entrega.getResponsavel(), boldFont, normalFont);
            adicionarLinhaInfo(info, "Proprietário", safe(entrega.getProprietario()) + " | CPF: " + safe(entrega.getProprietarioCpf()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Contato", safe(entrega.getProprietarioTelefone()) + " | RG: " + safe(entrega.getProprietarioRg()), boldFont, normalFont);
            adicionarLinhaInfo(info, "Observação", entrega.getObservacaoItem(), boldFont, normalFont);
            infoCell.add(info);

            Cell fotosCell = new Cell().setBorder(new SolidBorder(BORDA, 1)).setPadding(8).setBackgroundColor(CINZA_CLARO);
            fotosCell.add(new Paragraph("Evidências")
                    .setFont(boldFont)
                    .setFontSize(10)
                    .setFontColor(AZUL_ESCURO)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(6));
            Table fotos = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
            fotos.setWidth(UnitValue.createPercentValue(100));
            fotos.addCell(criarFotoCell("Cadastro", entrega.getCaminhoFotoItem(), normalFont));
            fotos.addCell(criarFotoCell("Entrega", entrega.getCaminhoFotoEntrega(), normalFont));
            fotosCell.add(fotos);

            card.addCell(infoCell);
            card.addCell(fotosCell);
            document.add(card);
        }
    }

    private void adicionarSecaoItens(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Itens cadastrados e histórico", boldFont);

        Table table = new Table(UnitValue.createPercentArray(new float[]{8, 13, 18, 14, 12, 12, 13, 10}));
        table.setWidth(UnitValue.createPercentValue(100));
        adicionarHeader(table, boldFont, "Registro", "Data", "Item", "Posto/Local", "Situação", "Operador", "Tempo", "Foto");

        for (RelatorioDTO.ItemRelatorio item : relatorio.getItensCadastrados()) {
            table.addCell(celulaTexto(String.valueOf(item.getNumeroRegistro()), normalFont));
            table.addCell(celulaTexto(formatarDataHora(item.getDataRegistro()), normalFont));
            table.addCell(celulaTexto(safe(item.getNome()) + "\nLacre: " + item.getNumeroLacre(), normalFont));
            table.addCell(celulaTexto(safe(item.getLocalEncontrado()) + "\n" + safe(item.getCaixaArmazenamento()), normalFont));
            table.addCell(celulaTexto(safe(item.getSituacao()), normalFont));
            table.addCell(celulaTexto(safe(item.getResponsavelCadastro()) + "\nAss.: " + safe(item.getAssinaturaOperador()), normalFont));
            table.addCell(celulaTexto(safe(item.getTempoPermanencia()), normalFont));
            table.addCell(criarFotoCell("", item.getCaminhoFoto(), normalFont));
        }
        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void adicionarSecaoRequisicoes(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Requisições de clientes", boldFont);

        Table table = new Table(UnitValue.createPercentArray(new float[]{10, 13, 13, 14, 20, 10, 12, 8}));
        table.setWidth(UnitValue.createPercentValue(100));
        adicionarHeader(table, boldFont, "Código", "Data", "Cliente", "Categoria", "Descrição", "Status", "Operador", "Foto");

        for (RelatorioDTO.RequisicaoRelatorio req : relatorio.getRequisicoes()) {
            table.addCell(celulaTexto(safe(req.getCodigoRequisicao()), normalFont));
            table.addCell(celulaTexto(formatarDataHora(req.getDataRequisicao()), normalFont));
            table.addCell(celulaTexto(safe(req.getCliente()) + "\n" + safe(req.getTelefone()), normalFont));
            table.addCell(celulaTexto(safe(req.getCategoriaObjeto()), normalFont));
            table.addCell(celulaTexto(safe(req.getDescricao()) + "\nItem: " + safe(req.getItemEncontrado()) +
                    "\nRegistro: " + safe(req.getNumeroRegistroItem()) + " | Lacre: " + safe(req.getNumeroLacre()), normalFont));
            table.addCell(celulaTexto(req.isEncontrado() ? "Encontrado" : "Pendente", normalFont));
            table.addCell(celulaTexto(safe(req.getResponsavelCadastro()) + "\nAss.: " + safe(req.getAssinaturaOperador()), normalFont));
            table.addCell(criarFotoCell("", req.getCaminhoFotoItem(), normalFont));
        }
        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void adicionarSecaoEncaminhamentos(Document document, RelatorioDTO relatorio, PdfFont boldFont, PdfFont normalFont) {
        adicionarTituloSecao(document, "Encaminhamentos", boldFont);

        Table table = new Table(UnitValue.createPercentArray(new float[]{12, 12, 17, 14, 13, 12, 12, 8}));
        table.setWidth(UnitValue.createPercentValue(100));
        adicionarHeader(table, boldFont, "Envio", "Inventário", "Item", "Posto/Local", "Destino", "Responsável", "Tempo", "Foto");

        for (RelatorioDTO.EncaminhamentoRelatorio enc : relatorio.getEncaminhamentos()) {
            table.addCell(celulaTexto(formatarDataHora(enc.getDataEnvio()), normalFont));
            table.addCell(celulaTexto(formatarDataHora(enc.getDataInventario()), normalFont));
            table.addCell(celulaTexto("#" + enc.getNumeroRegistro() + " - " + safe(enc.getItem()) +
                    "\nLacre: " + enc.getNumeroLacre(), normalFont));
            table.addCell(celulaTexto(safe(enc.getLocalEncontrado()) + "\n" + safe(enc.getCaixaArmazenamento()), normalFont));
            table.addCell(celulaTexto(safe(enc.getDestino()), normalFont));
            table.addCell(celulaTexto(safe(enc.getResponsavelEncaminhamento()), normalFont));
            table.addCell(celulaTexto(safe(enc.getTempoPermanencia()), normalFont));
            table.addCell(criarFotoCell("", enc.getCaminhoFotoItem(), normalFont));
        }
        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void adicionarRodape(Document document, RelatorioDTO relatorio, PdfFont normalFont) {
        document.add(new Paragraph("Documento gerado pelo sistema de Achados e Perdidos Iguatemi. Protocolo: " +
                safe(relatorio.getProtocoloRelatorio()))
                .setFont(normalFont)
                .setFontSize(8)
                .setFontColor(TEXTO)
                .setTextAlignment(TextAlignment.RIGHT));
    }

    private void adicionarTituloSecao(Document document, String titulo, PdfFont boldFont) {
        document.add(new Paragraph(titulo)
                .setFont(boldFont)
                .setFontSize(12)
                .setFontColor(AZUL_ESCURO)
                .setMarginTop(8)
                .setMarginBottom(6));
    }

    private void adicionarMetrica(Table table, String label, String valor, PdfFont boldFont, PdfFont normalFont) {
        Cell cell = new Cell().setBorder(new SolidBorder(BORDA, 1)).setBackgroundColor(CINZA_CLARO).setPadding(7);
        cell.add(new Paragraph(label)
                .setFont(boldFont)
                .setFontSize(8)
                .setFontColor(AZUL_ESCURO));
        cell.add(new Paragraph(safe(valor))
                .setFont(normalFont)
                .setFontSize(10)
                .setFontColor(TEXTO));
        table.addCell(cell);
    }

    private void adicionarLinhaInfo(Table table, String label, String valor, PdfFont boldFont, PdfFont normalFont) {
        table.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(2)
                .add(new Paragraph(label).setFont(boldFont).setFontSize(8).setFontColor(AZUL_ESCURO)));
        table.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(2)
                .add(new Paragraph(safe(valor)).setFont(normalFont).setFontSize(8).setFontColor(TEXTO)));
    }

    private void adicionarHeader(Table table, PdfFont boldFont, String... headers) {
        for (String header : headers) {
            table.addHeaderCell(new Cell().setBackgroundColor(AZUL_ESCURO).setPadding(5)
                    .add(new Paragraph(header)
                            .setFont(boldFont)
                            .setFontSize(7)
                            .setFontColor(ColorConstants.WHITE)
                            .setTextAlignment(TextAlignment.CENTER)));
        }
    }

    private Cell celulaTexto(String texto, PdfFont normalFont) {
        return new Cell().setPadding(4).setVerticalAlignment(VerticalAlignment.TOP)
                .add(new Paragraph(safe(texto)).setFont(normalFont).setFontSize(7).setFontColor(TEXTO));
    }

    private Cell criarFotoCell(String label, String caminhoFoto, PdfFont normalFont) {
        Cell fotoCell = new Cell().setPadding(4).setVerticalAlignment(VerticalAlignment.MIDDLE);
        if (label != null && !label.trim().isEmpty()) {
            fotoCell.add(new Paragraph(label)
                    .setFont(normalFont)
                    .setFontSize(7)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(TEXTO));
        }

        if (caminhoFoto == null || caminhoFoto.trim().isEmpty()) {
            fotoCell.add(new Paragraph("Sem foto")
                    .setFont(normalFont)
                    .setFontSize(7)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY));
            return fotoCell;
        }

        try {
            String caminhoAbsoluto = resolverCaminhoFoto(caminhoFoto);
            if (caminhoAbsoluto != null) {
                Image foto = new Image(ImageDataFactory.create(caminhoAbsoluto));
                foto.scaleToFit(FOTO_LARGURA, FOTO_ALTURA);
                fotoCell.add(foto);
            } else {
                fotoCell.add(new Paragraph("Arquivo não encontrado")
                        .setFont(normalFont)
                        .setFontSize(6)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(ColorConstants.RED));
            }
        } catch (Exception e) {
            fotoCell.add(new Paragraph("Erro ao carregar")
                    .setFont(normalFont)
                    .setFontSize(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.RED));
        }

        return fotoCell;
    }

    private String formatarDataHora(Date data) {
        if (data == null) {
            return "-";
        }
        return dateFormat.format(data);
    }

    private String safe(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return "-";
        }
        return valor;
    }

    private String resolverCaminhoFoto(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isEmpty()) {
            return null;
        }

        String diretorioProjeto = System.getProperty("user.dir");
        String caminhoNormalizado = caminhoRelativo.replace("/", File.separator).replace("\\", File.separator);

        String[] tentativas = {
                diretorioProjeto + File.separator + caminhoNormalizado,
                diretorioProjeto + File.separator + "src" + File.separator + caminhoNormalizado,
                diretorioProjeto + File.separator + caminhoNormalizado.replace("src/", "").replace("src\\", ""),
                diretorioProjeto + File.separator + "imagens" + File.separator + new File(caminhoNormalizado).getName(),
                caminhoRelativo
        };

        for (String tentativa : tentativas) {
            File arquivo = new File(tentativa);
            if (arquivo.exists() && arquivo.isFile()) {
                return arquivo.getAbsolutePath();
            }
        }

        return null;
    }
}
