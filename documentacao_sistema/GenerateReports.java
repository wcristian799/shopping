import report.RelatorioController;
import report.RelatorioDTO;
import report.RelatorioExcel;
import report.RelatorioPDF;

import java.io.File;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class GenerateReports {
    public static void main(String[] args) throws Exception {
        File baseDir = new File("C:\\Users\\Wellington Cristian\\Desktop\\shopping\\documentacao_sistema\\relatorios");
        if (!baseDir.exists() && !baseDir.mkdirs()) {
            throw new IllegalStateException("Nao foi possivel criar a pasta de relatorios.");
        }

        RelatorioController controller = new RelatorioController();
        RelatorioPDF pdf = new RelatorioPDF();
        RelatorioExcel excel = new RelatorioExcel();

        Date inicio = Date.from(LocalDate.of(2026, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date fim = Date.from(LocalDate.now().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

        for (RelatorioDTO.TipoRelatorio tipo : RelatorioDTO.TipoRelatorio.values()) {
            RelatorioDTO dados = controller.gerarDadosRelatorio(inicio, fim, tipo);
            String prefixo = tipo.name().toLowerCase();

            File pdfFile = new File(baseDir, prefixo + ".pdf");
            pdf.gerarPDF(dados, pdfFile.getAbsolutePath());

            File xlsxFile = new File(baseDir, prefixo + ".xlsx");
            excel.gerarExcel(dados, xlsxFile.getAbsolutePath());

            System.out.println(pdfFile.getAbsolutePath());
            System.out.println(xlsxFile.getAbsolutePath());
        }
    }
}
