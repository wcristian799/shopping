import report.RelatorioController;
import report.RelatorioDTO;
import report.RelatorioExcel;
import report.RelatorioPDF;

import java.time.LocalDate;
import java.time.ZoneId;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DesktopReportCompare {
    private static String safe(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public static void main(String[] args) throws Exception {
        LocalDate inicioLocal = LocalDate.parse(args.length > 0 ? args[0] : "2000-01-01");
        LocalDate fimLocal = LocalDate.parse(args.length > 1 ? args[1] : "2100-12-31");
        Date inicio = Date.from(inicioLocal.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date fim = Date.from(fimLocal.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());
        RelatorioDTO.TipoRelatorio tipo = RelatorioDTO.TipoRelatorio.valueOf(args.length > 2 ? args[2] : "TODOS");

        RelatorioController controller = new RelatorioController();
        RelatorioDTO dados = controller.gerarDadosRelatorio(inicio, fim, tipo);

        if (args.length > 3 && !args[3].isBlank()) {
            new RelatorioExcel().gerarExcel(dados, args[3]);
        }

        if (args.length > 4 && !args[4].isBlank()) {
            new RelatorioPDF().gerarPDF(dados, args[4]);
        }

        String json = "{"
                + "\"tipo\":\"" + dados.getTipoRelatorio().name() + "\","
                + "\"protocolo\":\"" + safe(dados.getProtocoloRelatorio()) + "\","
                + "\"periodo\":\"" + safe(dados.getPeriodoDescricao()) + "\","
                + "\"tempo\":\"" + safe(dados.getTempoPeriodo()) + "\","
                + "\"totalItens\":" + dados.getTotalItens() + ","
                + "\"totalEntregas\":" + dados.getTotalEntregas() + ","
                + "\"totalRequisicoes\":" + dados.getTotalRequisicoes() + ","
                + "\"totalEncaminhamentos\":" + dados.getTotalEncaminhamentos() + ","
                + "\"totalItensPendentes\":" + dados.getTotalItensPendentes() + ","
                + "\"totalItensDevolvidos\":" + dados.getTotalItensDevolvidos() + ","
                + "\"totalItensFinalizados\":" + dados.getTotalItensFinalizados() + ","
                + "\"itensCount\":" + (dados.getItensCadastrados() == null ? 0 : dados.getItensCadastrados().size()) + ","
                + "\"entregasCount\":" + (dados.getEntregas() == null ? 0 : dados.getEntregas().size()) + ","
                + "\"requisicoesCount\":" + (dados.getRequisicoes() == null ? 0 : dados.getRequisicoes().size()) + ","
                + "\"encaminhamentosCount\":" + (dados.getEncaminhamentos() == null ? 0 : dados.getEncaminhamentos().size()) + ","
                + "\"primeiroItem\":\"" + safe(dados.getItensCadastrados() != null && !dados.getItensCadastrados().isEmpty() ? dados.getItensCadastrados().get(0).getNome() : "") + "\","
                + "\"primeiraEntrega\":\"" + safe(dados.getEntregas() != null && !dados.getEntregas().isEmpty() ? dados.getEntregas().get(0).getCodigoAutenticacao() : "") + "\","
                + "\"primeiraRequisicao\":\"" + safe(dados.getRequisicoes() != null && !dados.getRequisicoes().isEmpty() ? dados.getRequisicoes().get(0).getCodigoRequisicao() : "") + "\","
                + "\"primeiroEncaminhamento\":\"" + safe(dados.getEncaminhamentos() != null && !dados.getEncaminhamentos().isEmpty() ? dados.getEncaminhamentos().get(0).getDestino() : "") + "\""
                + "}";

        System.out.println(json);
    }
}
