package report;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.image.ImageDataFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.net.MalformedURLException;

public class TermoEntregaPDF {

    public void gerarTermo(TermoEntregaDTO dados, String caminhoArquivo) throws Exception {
        PdfWriter writer = new PdfWriter(new FileOutputStream(caminhoArquivo));
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(20, 20, 20, 20); // Margens reduzidas

        PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");
        PdfFont normalFont = PdfFontFactory.createFont("Helvetica");

        // TÍTULO
        Paragraph titulo = new Paragraph("TERMO DE ENTREGA DE OBJETO")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(titulo);
        document.add(new Paragraph("\n"));

        // NÚMERO DO DOCUMENTO E DATA
        Table cabecalho = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
        cabecalho.setWidth(UnitValue.createPercentValue(100));

        cabecalho.addCell(new Cell().add(new Paragraph("Nº DOC: " + dados.getCodigoAutenticacao())
                .setFont(boldFont).setFontSize(10)).setBorder(null));

        cabecalho.addCell(new Cell().add(new Paragraph("DATA: " + dados.getDataEntrega())
                .setFont(boldFont).setFontSize(10).setTextAlignment(TextAlignment.RIGHT)).setBorder(null));

        document.add(cabecalho);
        document.add(new Paragraph("\n"));

        // ===== IDENTIFICAÇÃO DO PROPRIETÁRIO + FOTO DE CADASTRO =====
        Table proprietarioFotoTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}));
        proprietarioFotoTable.setWidth(UnitValue.createPercentValue(100));

        // Lado esquerdo: Identificação do Proprietário
        Cell propInfoCell = new Cell().setBorder(null);
        propInfoCell.add(new Paragraph("1. IDENTIFICAÇÃO DO PROPRIETÁRIO")
                .setFont(boldFont).setFontSize(12));
        propInfoCell.add(new Paragraph("\n"));

        Table propTable = new Table(UnitValue.createPercentArray(new float[]{20, 80}));
        propTable.setWidth(UnitValue.createPercentValue(100));

        adicionarLinha(propTable, "Nome:", dados.getNomeProprietario(), boldFont, normalFont, 9);
        adicionarLinha(propTable, "CPF:", dados.getCpfProprietario(), boldFont, normalFont, 9);
        adicionarLinha(propTable, "RG:", dados.getRgProprietario(), boldFont, normalFont, 9);
        adicionarLinha(propTable, "Telefone:", dados.getTelefoneProprietario(), boldFont, normalFont, 9);

        propInfoCell.add(propTable);

        // Lado direito: Foto de Cadastro
        Cell fotoCadastroCell = new Cell().setBorder(null).setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
        fotoCadastroCell.add(new Paragraph("Foto do Cadastro:").setFont(boldFont).setFontSize(10));

        if (dados.getCaminhoFotoCadastro() != null && !dados.getCaminhoFotoCadastro().isEmpty()) {
            try {
                String caminhoAbsoluto = resolverCaminhoFoto(dados.getCaminhoFotoCadastro());
                if (caminhoAbsoluto != null) {
                    Image fotoCadastro = new Image(ImageDataFactory.create(caminhoAbsoluto));
                    fotoCadastro.setMaxWidth(150);
                    fotoCadastro.setMaxHeight(100);
                    fotoCadastroCell.add(fotoCadastro);
                } else {
                    fotoCadastroCell.add(new Paragraph("Foto não encontrada").setFont(normalFont).setFontSize(8));
                }
            } catch (Exception e) {
                fotoCadastroCell.add(new Paragraph("Erro ao carregar foto").setFont(normalFont).setFontSize(8));
            }
        } else {
            fotoCadastroCell.add(new Paragraph("Sem foto de cadastro").setFont(normalFont).setFontSize(8));
        }

        proprietarioFotoTable.addCell(propInfoCell);
        proprietarioFotoTable.addCell(fotoCadastroCell);

        document.add(proprietarioFotoTable);
        document.add(new Paragraph("\n"));

        // ===== DADOS DO OBJETO + FOTO DE ENTREGA =====
        Table objetoFotoTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}));
        objetoFotoTable.setWidth(UnitValue.createPercentValue(100));

        // Lado esquerdo: Dados do Objeto
        Cell objInfoCell = new Cell().setBorder(null);
        objInfoCell.add(new Paragraph("2. DADOS DO OBJETO")
                .setFont(boldFont).setFontSize(12));
        objInfoCell.add(new Paragraph("\n"));

        Table objTable = new Table(UnitValue.createPercentArray(new float[]{20, 80}));
        objTable.setWidth(UnitValue.createPercentValue(100));

        adicionarLinha(objTable, "Nº Registro:", String.valueOf(dados.getNumeroRegistro()), boldFont, normalFont, 9);
        adicionarLinha(objTable, "Nome:", dados.getNomeItem(), boldFont, normalFont, 9);
        adicionarLinha(objTable, "Marca:", dados.getMarcaItem(), boldFont, normalFont, 9);
        adicionarLinha(objTable, "Nº Lacre:", String.valueOf(dados.getNumeroLacre()), boldFont, normalFont, 9);
        adicionarLinha(objTable, "Estado:", dados.getEstadoConservacao(), boldFont, normalFont, 9);
        adicionarLinha(objTable, "Observação:", dados.getObservacaoItem(), boldFont, normalFont, 9);

        objInfoCell.add(objTable);

        // Lado direito: Foto de Entrega
        Cell fotoEntregaCell = new Cell().setBorder(null).setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
        fotoEntregaCell.add(new Paragraph("Foto da Entrega:").setFont(boldFont).setFontSize(10));

        if (dados.getCaminhoFotoEntrega() != null && !dados.getCaminhoFotoEntrega().isEmpty()) {
            try {
                String caminhoAbsoluto = resolverCaminhoFoto(dados.getCaminhoFotoEntrega());
                if (caminhoAbsoluto != null) {
                    Image fotoEntrega = new Image(ImageDataFactory.create(caminhoAbsoluto));
                    fotoEntrega.setMaxWidth(150);
                    fotoEntrega.setMaxHeight(100);
                    fotoEntregaCell.add(fotoEntrega);
                } else {
                    fotoEntregaCell.add(new Paragraph("Foto não encontrada").setFont(normalFont).setFontSize(8));
                }
            } catch (Exception e) {
                fotoEntregaCell.add(new Paragraph("Erro ao carregar foto").setFont(normalFont).setFontSize(8));
            }
        } else {
            fotoEntregaCell.add(new Paragraph("Sem foto de entrega").setFont(normalFont).setFontSize(8));
        }

        objetoFotoTable.addCell(objInfoCell);
        objetoFotoTable.addCell(fotoEntregaCell);

        document.add(objetoFotoTable);
        document.add(new Paragraph("\n"));

        // 3. DECLARAÇÃO (texto mais compacto)
        document.add(new Paragraph("3. DECLARAÇÃO DE RECEBIMENTO")
                .setFont(boldFont).setFontSize(12));
        document.add(new Paragraph("\n"));

        String textoDeclaracao = "Declaro para os devidos fins que recebi o objeto acima descrito, " +
                "o qual estava sob guarda do Shopping Iguatemi, e que me responsabilizo pela " +
                "veracidade das informações prestadas. O objeto foi devolvido nas condições em que se encontrava.";

        document.add(new Paragraph(textoDeclaracao).setFont(normalFont).setFontSize(9));
        document.add(new Paragraph("\n"));

        // 4. ASSINATURAS (mais compactas)
        Table assinaturas = new Table(UnitValue.createPercentArray(new float[]{50, 50}));
        assinaturas.setWidth(UnitValue.createPercentValue(100));

        // Assinatura do Proprietário
        Cell cellProp = new Cell().setBorder(null).setPadding(2);
        cellProp.add(new Paragraph("_________________________________________")
                .setFont(normalFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        cellProp.add(new Paragraph("Assinatura do Proprietário")
                .setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));
        cellProp.add(new Paragraph("Nome: " + dados.getNomeProprietario())
                .setFont(normalFont).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
        cellProp.add(new Paragraph("CPF: " + dados.getCpfProprietario())
                .setFont(normalFont).setFontSize(8).setTextAlignment(TextAlignment.CENTER));

        // Assinatura do Responsável
        Cell cellResp = new Cell().setBorder(null).setPadding(2);
        cellResp.add(new Paragraph("_________________________________________")
                .setFont(normalFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER));
        cellResp.add(new Paragraph("Assinatura do Responsável")
                .setFont(normalFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER));
        cellResp.add(new Paragraph("Nome: " + dados.getNomeResponsavel())
                .setFont(normalFont).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
        cellResp.add(new Paragraph("Data: " + dados.getDataEntrega() + " às " + dados.getHoraEntrega())
                .setFont(normalFont).setFontSize(8).setTextAlignment(TextAlignment.CENTER));

        assinaturas.addCell(cellProp);
        assinaturas.addCell(cellResp);

        document.add(assinaturas);
        document.add(new Paragraph("\n"));

        // OBSERVAÇÕES FINAIS
        document.add(new Paragraph("Este documento serve como comprovante de entrega.")
                .setFont(normalFont).setFontSize(7).setTextAlignment(TextAlignment.CENTER));

        document.close();
    }

    private void adicionarLinha(Table table, String rotulo, String valor,
                                PdfFont boldFont, PdfFont normalFont, int fontSize) {
        Cell cellRotulo = new Cell().add(new Paragraph(rotulo).setFont(boldFont).setFontSize(fontSize));
        cellRotulo.setBorder(null).setPadding(2);

        Cell cellValor = new Cell().add(new Paragraph(valor).setFont(normalFont).setFontSize(fontSize));
        cellValor.setBorder(null).setPadding(2);

        table.addCell(cellRotulo);
        table.addCell(cellValor);
    }

    private String resolverCaminhoFoto(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isEmpty()) {
            return null;
        }

        String diretorioProjeto = System.getProperty("user.dir");

        // Tentativas de caminhos
        String[] tentativas = {
                diretorioProjeto + File.separator + caminhoRelativo,
                diretorioProjeto + File.separator + "src" + File.separator + caminhoRelativo,
                diretorioProjeto + File.separator + caminhoRelativo.replace("src/", ""),
                caminhoRelativo // caminho absoluto direto
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