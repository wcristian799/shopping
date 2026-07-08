package report;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

public class RelatorioExcel {

    private SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm");
    private SimpleDateFormat dateOnlyFormat = new SimpleDateFormat("dd/MM/yyyy");

    /**
     * Gera o arquivo Excel com todos os dados do relatório
     */
    public void gerarExcel(RelatorioDTO relatorio, String caminhoArquivo) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {

            // Criar estilos
            CellStyle headerStyle = criarEstiloCabecalho(workbook);
            CellStyle dataStyle = criarEstiloData(workbook);
            CellStyle dateStyle = criarEstiloDataCelula(workbook);
            CellStyle tituloStyle = criarEstiloTitulo(workbook);
            CellStyle fotoStyle = criarEstiloFoto(workbook);

            // Determinar quais abas criar baseado no tipo de relatório
            RelatorioDTO.TipoRelatorio tipo = relatorio.getTipoRelatorio();

            // Aba de Resumo (sempre criar)
            Sheet resumoSheet = workbook.createSheet("Resumo");
            criarAbaResumo(resumoSheet, relatorio, headerStyle, dataStyle, tituloStyle);

            // Criar abas específicas conforme o tipo selecionado
            switch (tipo) {
                case ITENS_CADASTRADOS:
                    if (relatorio.getItensCadastrados() != null && !relatorio.getItensCadastrados().isEmpty()) {
                        Sheet itensSheet = workbook.createSheet("Itens Cadastrados");
                        criarAbaItens(itensSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }
                    break;

                case ITENS_DEVOLVIDOS:
                    if (relatorio.getEntregas() != null && !relatorio.getEntregas().isEmpty()) {
                        Sheet entregasSheet = workbook.createSheet("Itens Devolvidos");
                        criarAbaEntregas(entregasSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }
                    break;

                case ITENS_REQUISITADOS:
                    if (relatorio.getRequisicoes() != null && !relatorio.getRequisicoes().isEmpty()) {
                        Sheet requisicoesSheet = workbook.createSheet("Requisições");
                        criarAbaRequisicoes(requisicoesSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }
                    break;

                case ITENS_ENCAMINHADOS:
                    if (relatorio.getEncaminhamentos() != null && !relatorio.getEncaminhamentos().isEmpty()) {
                        Sheet encaminhamentosSheet = workbook.createSheet("Encaminhamentos");
                        criarAbaEncaminhamentos(encaminhamentosSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }
                    break;

                case TODOS:
                    if (relatorio.getItensCadastrados() != null && !relatorio.getItensCadastrados().isEmpty()) {
                        Sheet itensSheet = workbook.createSheet("Itens Cadastrados");
                        criarAbaItens(itensSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }

                    if (relatorio.getEntregas() != null && !relatorio.getEntregas().isEmpty()) {
                        Sheet entregasSheet = workbook.createSheet("Entregas");
                        criarAbaEntregas(entregasSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }

                    if (relatorio.getRequisicoes() != null && !relatorio.getRequisicoes().isEmpty()) {
                        Sheet requisicoesSheet = workbook.createSheet("Requisições");
                        criarAbaRequisicoes(requisicoesSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }

                    if (relatorio.getEncaminhamentos() != null && !relatorio.getEncaminhamentos().isEmpty()) {
                        Sheet encaminhamentosSheet = workbook.createSheet("Encaminhamentos");
                        criarAbaEncaminhamentos(encaminhamentosSheet, relatorio, headerStyle, dataStyle, dateStyle, fotoStyle);
                    }
                    break;
            }

            // Ajustar largura das colunas em todas as abas
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                for (int j = 0; j < 30; j++) { // Aumentado para 30 colunas
                    sheet.autoSizeColumn(j);
                }
            }

            // Salvar arquivo
            try (FileOutputStream out = new FileOutputStream(caminhoArquivo)) {
                workbook.write(out);
            }
        }
    }

    /**
     * Verifica se a foto existe e retorna uma mensagem apropriada
     */
    private String verificarFoto(String caminhoFoto) {
        if (caminhoFoto == null || caminhoFoto.trim().isEmpty()) {
            return "Sem foto";
        }

        // Tenta encontrar o arquivo
        String diretorioProjeto = System.getProperty("user.dir");
        String caminhoNormalizado = caminhoFoto.replace("/", File.separator).replace("\\", File.separator);
        String caminhoAbsoluto = diretorioProjeto + File.separator + caminhoNormalizado;
        File arquivo = new File(caminhoAbsoluto);

        if (arquivo.exists() && arquivo.isFile()) {
            return caminhoFoto; // Retorna o caminho para referência
        } else {
            return "Arquivo não encontrado: " + caminhoFoto;
        }
    }

    /**
     * Cria a aba de resumo com estatísticas
     */
    private void criarAbaResumo(Sheet sheet, RelatorioDTO relatorio,
                                CellStyle headerStyle, CellStyle dataStyle,
                                CellStyle tituloStyle) {
        int rowNum = 0;

        // Título principal
        Row tituloRow = sheet.createRow(rowNum++);
        Cell tituloCell = tituloRow.createCell(0);

        String tipoRelatorio = relatorio.getTipoRelatorio() != null ?
                relatorio.getTipoRelatorio().getDescricao() : "Relatório Completo";
        tituloCell.setCellValue("RELATÓRIO - " + tipoRelatorio.toUpperCase());
        tituloCell.setCellStyle(tituloStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

        rowNum++; // espaço

        // Período
        Row periodoLabelRow = sheet.createRow(rowNum++);
        periodoLabelRow.createCell(0).setCellValue("PERÍODO DO RELATÓRIO");
        periodoLabelRow.getCell(0).setCellStyle(headerStyle);

        Row periodoRow = sheet.createRow(rowNum++);
        periodoRow.createCell(0).setCellValue("Data Início:");
        periodoRow.createCell(1).setCellValue(dateOnlyFormat.format(relatorio.getDataInicio()));
        periodoRow.createCell(2).setCellValue("Data Fim:");
        periodoRow.createCell(3).setCellValue(dateOnlyFormat.format(relatorio.getDataFim()));

        Row protocoloRow = sheet.createRow(rowNum++);
        protocoloRow.createCell(0).setCellValue("Protocolo:");
        protocoloRow.createCell(1).setCellValue(relatorio.getProtocoloRelatorio());
        protocoloRow.createCell(2).setCellValue("Tempo analisado:");
        protocoloRow.createCell(3).setCellValue(relatorio.getTempoPeriodo());

        Row geradoInfoRow = sheet.createRow(rowNum++);
        geradoInfoRow.createCell(0).setCellValue("Gerado em:");
        geradoInfoRow.createCell(1).setCellValue(dateFormat.format(relatorio.getDataGeracao() != null ? relatorio.getDataGeracao() : new Date()));

        rowNum++; // espaço
        rowNum++; // espaço

        // Estatísticas
        Row statsTitulo = sheet.createRow(rowNum++);
        statsTitulo.createCell(0).setCellValue("RESUMO ESTATÍSTICO");
        statsTitulo.getCell(0).setCellStyle(headerStyle);

        rowNum++; // espaço

        // Tabela de estatísticas
        int statsRow = rowNum;

        Row statsHeader = sheet.createRow(statsRow++);
        statsHeader.createCell(0).setCellValue("Indicador");
        statsHeader.createCell(1).setCellValue("Quantidade");
        statsHeader.getCell(0).setCellStyle(headerStyle);
        statsHeader.getCell(1).setCellStyle(headerStyle);

        // Só mostrar os indicadores que existem no relatório
        if (relatorio.getItensCadastrados() != null) {
            criarLinhaResumo(sheet, statsRow++, "Total de Itens Cadastrados:",
                    relatorio.getTotalItens(), dataStyle);
        }
        if (relatorio.getEntregas() != null) {
            criarLinhaResumo(sheet, statsRow++, "Total de Devoluções:",
                    relatorio.getTotalEntregas(), dataStyle);
        }
        if (relatorio.getRequisicoes() != null) {
            criarLinhaResumo(sheet, statsRow++, "Total de Requisições:",
                    relatorio.getTotalRequisicoes(), dataStyle);
        }
        if (relatorio.getEncaminhamentos() != null) {
            criarLinhaResumo(sheet, statsRow++, "Total de Encaminhamentos:",
                    relatorio.getTotalEncaminhamentos(), dataStyle);
        }
        criarLinhaResumo(sheet, statsRow++, "Itens Pendentes:",
                relatorio.getTotalItensPendentes(), dataStyle);
        criarLinhaResumo(sheet, statsRow++, "Itens Devolvidos:",
                relatorio.getTotalItensDevolvidos(), dataStyle);
        criarLinhaResumo(sheet, statsRow++, "Itens Finalizados:",
                relatorio.getTotalItensFinalizados(), dataStyle);

        rowNum = statsRow + 2;

        // Data de geração
        Row geradoRow = sheet.createRow(rowNum++);
        geradoRow.createCell(0).setCellValue("Relatório gerado em: " +
                dateFormat.format(new Date()));
    }

    /**
     * Cria uma linha na tabela de resumo
     */
    private void criarLinhaResumo(Sheet sheet, int rowNum, String label, int valor,
                                  CellStyle dataStyle) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        Cell valorCell = row.createCell(1);
        valorCell.setCellValue(valor);
        valorCell.setCellStyle(dataStyle);
    }

    /**
     * Cria a aba de itens cadastrados com histórico completo
     */
    private void criarAbaItens(Sheet sheet, RelatorioDTO relatorio,
                               CellStyle headerStyle, CellStyle dataStyle,
                               CellStyle dateStyle, CellStyle fotoStyle) {
        int rowNum = 0;

        // Título da aba
        Row tituloRow = sheet.createRow(rowNum++);
        tituloRow.createCell(0).setCellValue("ITENS CADASTRADOS - HISTÓRICO COMPLETO");
        tituloRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 26));

        rowNum++; // espaço

        // Cabeçalho da tabela com todas as informações
        String[] colunas = {
                "Nº Registro", "Nome", "Marca", "Data Cadastro", "Nº Lacre",
                "Estado", "Observação", "Local", "Categoria", "Caixa",
                "Situação", "Responsável Cadastro", "Entregue por", "Assinatura Operador", "Tempo Permanência",
                // Informações de Devolução (se aplicável)
                "Data Devolução", "Proprietário", "Tel. Proprietário", "CPF", "RG",
                "Código Autenticação", "Foto Cadastro", "Foto Entrega",
                // Informações de Encaminhamento (se aplicável)
                "Data Encaminhamento", "Data Inventário", "Destino Final"
        };

        Row headerRow = sheet.createRow(rowNum++);
        for (int i = 0; i < colunas.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(colunas[i]);
            cell.setCellStyle(headerStyle);
        }

        // Dados
        if (relatorio.getItensCadastrados() != null && !relatorio.getItensCadastrados().isEmpty()) {
            for (RelatorioDTO.ItemRelatorio item : relatorio.getItensCadastrados()) {
                Row row = sheet.createRow(rowNum++);

                int col = 0;

                // Informações básicas
                row.createCell(col++).setCellValue(item.getNumeroRegistro());
                row.createCell(col++).setCellValue(item.getNome());
                row.createCell(col++).setCellValue(item.getMarca() != null ? item.getMarca() : "-");

                Cell dataCadastroCell = row.createCell(col++);
                dataCadastroCell.setCellValue(dateFormat.format(item.getDataRegistro()));
                dataCadastroCell.setCellStyle(dateStyle);

                row.createCell(col++).setCellValue(item.getNumeroLacre());
                row.createCell(col++).setCellValue(item.getEstadoConservacao());
                row.createCell(col++).setCellValue(item.getObservacao() != null ? item.getObservacao() : "-");
                row.createCell(col++).setCellValue(item.getLocalEncontrado() != null ? item.getLocalEncontrado() : "-");
                row.createCell(col++).setCellValue(item.getTipoObjeto() != null ? item.getTipoObjeto() : "-");
                row.createCell(col++).setCellValue(item.getCaixaArmazenamento() != null ? item.getCaixaArmazenamento() : "Nenhuma");
                row.createCell(col++).setCellValue(item.getSituacao());
                row.createCell(col++).setCellValue(item.getResponsavelCadastro() != null ? item.getResponsavelCadastro() : "-");
                row.createCell(col++).setCellValue(item.getNomeEntregador() != null ? item.getNomeEntregador() : "-");
                row.createCell(col++).setCellValue(item.getAssinaturaOperador() != null ? item.getAssinaturaOperador() : "-");
                row.createCell(col++).setCellValue(item.getTempoPermanencia() != null ? item.getTempoPermanencia() : "-");

                // Informações de Devolução
                if (item.getDataDevolucao() != null) {
                    Cell dataDevCell = row.createCell(col++);
                    dataDevCell.setCellValue(dateFormat.format(item.getDataDevolucao()));
                    dataDevCell.setCellStyle(dateStyle);

                    row.createCell(col++).setCellValue(item.getProprietarioNome() != null ? item.getProprietarioNome() : "-");
                    row.createCell(col++).setCellValue(item.getProprietarioTelefone() != null ? item.getProprietarioTelefone() : "-");
                    row.createCell(col++).setCellValue(item.getProprietarioCpf() != null ? item.getProprietarioCpf() : "-");
                    row.createCell(col++).setCellValue(item.getProprietarioRg() != null ? item.getProprietarioRg() : "-");
                    row.createCell(col++).setCellValue(item.getCodigoAutenticacaoEntrega() != null ? item.getCodigoAutenticacaoEntrega() : "-");
                } else {
                    // Pular 6 colunas se não houver devolução
                    col += 6;
                }

                // Fotos
                Cell fotoCadastroCell = row.createCell(col++);
                fotoCadastroCell.setCellValue(verificarFoto(item.getCaminhoFoto()));
                fotoCadastroCell.setCellStyle(fotoStyle);

                Cell fotoEntregaCell = row.createCell(col++);
                fotoEntregaCell.setCellValue(verificarFoto(item.getFotoEntrega()));
                fotoEntregaCell.setCellStyle(fotoStyle);

                // Informações de Encaminhamento
                if (item.getDataEncaminhamento() != null) {
                    Cell dataEncCell = row.createCell(col++);
                    dataEncCell.setCellValue(dateFormat.format(item.getDataEncaminhamento()));
                    dataEncCell.setCellStyle(dateStyle);

                    if (item.getDataInventario() != null) {
                        Cell dataInvCell = row.createCell(col++);
                        dataInvCell.setCellValue(dateFormat.format(item.getDataInventario()));
                        dataInvCell.setCellStyle(dateStyle);
                    } else {
                        row.createCell(col++).setCellValue("-");
                    }

                    row.createCell(col++).setCellValue(item.getDestinoFinal() != null ? item.getDestinoFinal() : "-");
                } else {
                    // Pular 3 colunas se não houver encaminhamento
                    col += 3;
                }
            }
        } else {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Nenhum item cadastrado no período.");
            sheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 26));
        }
    }

    /**
     * Cria a aba de entregas com informações completas
     */
    private void criarAbaEntregas(Sheet sheet, RelatorioDTO relatorio,
                                  CellStyle headerStyle, CellStyle dataStyle,
                                  CellStyle dateStyle, CellStyle fotoStyle) {
        int rowNum = 0;

        // Título da aba
        Row tituloRow = sheet.createRow(rowNum++);
        tituloRow.createCell(0).setCellValue("DEVOLUÇÕES REALIZADAS - INFORMAÇÕES COMPLETAS");
        tituloRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 22));

        rowNum++; // espaço

        // Cabeçalho
        String[] colunas = {
                "Data Entrega", "Data Cadastro", "Tempo Permanência", "Código", "Proprietário", "Telefone", "CPF", "RG",
                "Nº Registro", "Item", "Marca", "Nº Lacre", "Estado", "Local/Posto", "Categoria", "Caixa",
                "Entregue por", "Assinatura Operador", "Responsável Entrega", "Observação", "Foto Item", "Foto Entrega"
        };

        Row headerRow = sheet.createRow(rowNum++);
        for (int i = 0; i < colunas.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(colunas[i]);
            cell.setCellStyle(headerStyle);
        }

        // Dados
        if (relatorio.getEntregas() != null && !relatorio.getEntregas().isEmpty()) {
            for (RelatorioDTO.EntregaRelatorio entrega : relatorio.getEntregas()) {
                Row row = sheet.createRow(rowNum++);

                int col = 0;

                Cell dataCell = row.createCell(col++);
                dataCell.setCellValue(dateFormat.format(entrega.getDataEntrega()));
                dataCell.setCellStyle(dateStyle);

                Cell dataCadastroCell = row.createCell(col++);
                dataCadastroCell.setCellValue(entrega.getDataCadastroItem() != null ? dateFormat.format(entrega.getDataCadastroItem()) : "-");
                dataCadastroCell.setCellStyle(dateStyle);

                row.createCell(col++).setCellValue(entrega.getTempoPermanencia() != null ? entrega.getTempoPermanencia() : "-");
                row.createCell(col++).setCellValue(entrega.getCodigoAutenticacao());
                row.createCell(col++).setCellValue(entrega.getProprietario());
                row.createCell(col++).setCellValue(entrega.getProprietarioTelefone() != null ? entrega.getProprietarioTelefone() : "-");
                row.createCell(col++).setCellValue(entrega.getProprietarioCpf() != null ? entrega.getProprietarioCpf() : "-");
                row.createCell(col++).setCellValue(entrega.getProprietarioRg() != null ? entrega.getProprietarioRg() : "-");
                row.createCell(col++).setCellValue(entrega.getNumeroRegistro());
                row.createCell(col++).setCellValue(entrega.getItem());
                row.createCell(col++).setCellValue(entrega.getMarcaItem() != null ? entrega.getMarcaItem() : "-");
                row.createCell(col++).setCellValue(entrega.getNumeroLacre());
                row.createCell(col++).setCellValue(entrega.getEstadoConservacao() != null ? entrega.getEstadoConservacao() : "-");
                row.createCell(col++).setCellValue(entrega.getLocalEncontrado() != null ? entrega.getLocalEncontrado() : "-");
                row.createCell(col++).setCellValue(entrega.getTipoObjeto() != null ? entrega.getTipoObjeto() : "-");
                row.createCell(col++).setCellValue(entrega.getCaixaArmazenamento() != null ? entrega.getCaixaArmazenamento() : "-");
                row.createCell(col++).setCellValue(entrega.getNomeEntregador() != null ? entrega.getNomeEntregador() : "-");
                row.createCell(col++).setCellValue(entrega.getAssinaturaOperadorCadastro() != null ? entrega.getAssinaturaOperadorCadastro() : "-");
                row.createCell(col++).setCellValue(entrega.getResponsavel());
                row.createCell(col++).setCellValue(entrega.getObservacaoItem() != null ? entrega.getObservacaoItem() : "-");

                // Fotos
                Cell fotoItemCell = row.createCell(col++);
                fotoItemCell.setCellValue(verificarFoto(entrega.getCaminhoFotoItem()));
                fotoItemCell.setCellStyle(fotoStyle);

                Cell fotoEntregaCell = row.createCell(col++);
                fotoEntregaCell.setCellValue(verificarFoto(entrega.getCaminhoFotoEntrega()));
                fotoEntregaCell.setCellStyle(fotoStyle);
            }
        } else {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Nenhuma devolução realizada no período.");
            sheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 22));
        }
    }

    /**
     * Cria a aba de requisições
     */
    private void criarAbaRequisicoes(Sheet sheet, RelatorioDTO relatorio,
                                     CellStyle headerStyle, CellStyle dataStyle,
                                     CellStyle dateStyle, CellStyle fotoStyle) {
        int rowNum = 0;

        // Título da aba
        Row tituloRow = sheet.createRow(rowNum++);
        tituloRow.createCell(0).setCellValue("REQUISIÇÕES DE CLIENTES NO PERÍODO");
        tituloRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 12));

        rowNum++; // espaço

        // Cabeçalho
        String[] colunas = {"Código", "Data", "Cliente", "Telefone", "Categoria", "Descrição", "Status",
                "Registro Item", "Nº Lacre", "Responsável", "Assinatura Operador", "Foto do Item"};
        Row headerRow = sheet.createRow(rowNum++);
        for (int i = 0; i < colunas.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(colunas[i]);
            cell.setCellStyle(headerStyle);
        }

        // Dados
        if (relatorio.getRequisicoes() != null && !relatorio.getRequisicoes().isEmpty()) {
            for (RelatorioDTO.RequisicaoRelatorio req : relatorio.getRequisicoes()) {
                Row row = sheet.createRow(rowNum++);

                int col = 0;

                row.createCell(col++).setCellValue(req.getCodigoRequisicao() != null ? req.getCodigoRequisicao() : "-");

                Cell dataCell = row.createCell(col++);
                dataCell.setCellValue(dateFormat.format(req.getDataRequisicao()));
                dataCell.setCellStyle(dateStyle);

                row.createCell(col++).setCellValue(req.getCliente());
                row.createCell(col++).setCellValue(req.getTelefone());
                row.createCell(col++).setCellValue(req.getCategoriaObjeto() != null ? req.getCategoriaObjeto() : "-");
                row.createCell(col++).setCellValue(req.getDescricao());
                row.createCell(col++).setCellValue(req.isEncontrado() ? "Encontrado" : "Pendente");

                String numeroLacre = req.getNumeroLacre() != null ? req.getNumeroLacre() : "-";
                row.createCell(col++).setCellValue(req.getNumeroRegistroItem() != null ? req.getNumeroRegistroItem() : "-");
                row.createCell(col++).setCellValue(numeroLacre);
                row.createCell(col++).setCellValue(req.getResponsavelCadastro() != null ? req.getResponsavelCadastro() : "-");
                row.createCell(col++).setCellValue(req.getAssinaturaOperador() != null ? req.getAssinaturaOperador() : "-");

                Cell fotoCell = row.createCell(col++);
                fotoCell.setCellValue(verificarFoto(req.getCaminhoFotoItem()));
                fotoCell.setCellStyle(fotoStyle);
            }
        } else {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Nenhuma requisição registrada no período.");
            sheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 12));
        }
    }

    /**
     * Cria a aba de encaminhamentos com informações completas
     */
    private void criarAbaEncaminhamentos(Sheet sheet, RelatorioDTO relatorio,
                                         CellStyle headerStyle, CellStyle dataStyle,
                                         CellStyle dateStyle, CellStyle fotoStyle) {
        int rowNum = 0;

        // Título da aba
        Row tituloRow = sheet.createRow(rowNum++);
        tituloRow.createCell(0).setCellValue("ENCAMINHAMENTOS REALIZADOS - INFORMAÇÕES COMPLETAS");
        tituloRow.getCell(0).setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 13));

        rowNum++; // espaço

        // Cabeçalho
        String[] colunas = {
                "Data Envio", "Data Inventário", "Data Cadastro", "Tempo Permanência", "Nº Registro",
                "Item", "Nº Lacre", "Local/Posto", "Categoria", "Caixa", "Destino", "Responsável", "Foto do Item"
        };

        Row headerRow = sheet.createRow(rowNum++);
        for (int i = 0; i < colunas.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(colunas[i]);
            cell.setCellStyle(headerStyle);
        }

        // Dados
        if (relatorio.getEncaminhamentos() != null && !relatorio.getEncaminhamentos().isEmpty()) {
            for (RelatorioDTO.EncaminhamentoRelatorio enc : relatorio.getEncaminhamentos()) {
                Row row = sheet.createRow(rowNum++);

                int col = 0;

                Cell dataEnvioCell = row.createCell(col++);
                dataEnvioCell.setCellValue(dateFormat.format(enc.getDataEnvio()));
                dataEnvioCell.setCellStyle(dateStyle);

                if (enc.getDataInventario() != null) {
                    Cell dataInvCell = row.createCell(col++);
                    dataInvCell.setCellValue(dateFormat.format(enc.getDataInventario()));
                    dataInvCell.setCellStyle(dateStyle);
                } else {
                    row.createCell(col++).setCellValue("-");
                }

                Cell dataCadastroCell = row.createCell(col++);
                dataCadastroCell.setCellValue(enc.getDataCadastroItem() != null ? dateFormat.format(enc.getDataCadastroItem()) : "-");
                dataCadastroCell.setCellStyle(dateStyle);

                row.createCell(col++).setCellValue(enc.getTempoPermanencia() != null ? enc.getTempoPermanencia() : "-");
                row.createCell(col++).setCellValue(enc.getNumeroRegistro());
                row.createCell(col++).setCellValue(enc.getItem());
                row.createCell(col++).setCellValue(enc.getNumeroLacre());
                row.createCell(col++).setCellValue(enc.getLocalEncontrado() != null ? enc.getLocalEncontrado() : "-");
                row.createCell(col++).setCellValue(enc.getTipoObjeto() != null ? enc.getTipoObjeto() : "-");
                row.createCell(col++).setCellValue(enc.getCaixaArmazenamento() != null ? enc.getCaixaArmazenamento() : "-");
                row.createCell(col++).setCellValue(enc.getDestino());
                row.createCell(col++).setCellValue(enc.getResponsavelEncaminhamento() != null ? enc.getResponsavelEncaminhamento() : "-");

                Cell fotoCell = row.createCell(col++);
                fotoCell.setCellValue(verificarFoto(enc.getCaminhoFotoItem()));
                fotoCell.setCellStyle(fotoStyle);
            }
        } else {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Nenhum encaminhamento realizado no período.");
            sheet.addMergedRegion(new CellRangeAddress(rowNum-1, rowNum-1, 0, 13));
        }
    }

    /**
     * Cria estilo para cabeçalhos
     */
    private CellStyle criarEstiloCabecalho(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * Cria estilo para dados numéricos
     */
    private CellStyle criarEstiloData(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * Cria estilo para células de data
     */
    private CellStyle criarEstiloDataCelula(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("dd/mm/yyyy hh:mm"));
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    /**
     * Cria estilo para células de foto
     */
    private CellStyle criarEstiloFoto(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    /**
     * Cria estilo para títulos principais
     */
    private CellStyle criarEstiloTitulo(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
}
