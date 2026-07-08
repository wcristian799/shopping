package view;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import report.RelatorioController;
import report.RelatorioDTO;
import report.RelatorioExcel;
import report.RelatorioPDF;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class TelaRelatorio extends Application {

    private RelatorioController relatorioController;
    private DatePicker dataInicioPicker;
    private DatePicker dataFimPicker;
    private ComboBox<RelatorioDTO.TipoRelatorio> comboTipoRelatorio; // NOVO
    private Label statusLabel;
    private ProgressBar progressBar;

    // Controle para evitar múltiplas janelas abertas
    private static Stage telaRelatorioStage = null;

    public TelaRelatorio() {
        this.relatorioController = new RelatorioController();
    }

    /**
     * Método estático para abrir a tela de relatório de forma segura.
     * Se já estiver aberta, foca na janela existente.
     * @param owner Janela pai (para initOwner)
     */
    public static void abrirTelaRelatorio(Stage owner) {
        if (telaRelatorioStage != null && telaRelatorioStage.isShowing()) {
            telaRelatorioStage.toFront();
            telaRelatorioStage.requestFocus();
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.NONE);

        try {
            new TelaRelatorio().start(novaStage);
            telaRelatorioStage = novaStage;

            novaStage.setOnHidden(event -> telaRelatorioStage = null);
            novaStage.setOnCloseRequest(event -> telaRelatorioStage = null);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Gerar Relatório");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox centerContent = criarConteudoCentral(stage);
        root.setCenter(centerContent);

        Scene scene = new Scene(root, 550, 650); // AUMENTADO um pouco para caber o novo combo
        stage.setScene(scene);
        stage.setMinWidth(500);
        stage.setMinHeight(600);
        stage.show();
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(15);
        conteudo.setPadding(new Insets(15, 15, 15, 15));
        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Gerar Relatório");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        // Card de seleção de período
        VBox cardPeriodo = new VBox(12);
        cardPeriodo.setPadding(new Insets(15));
        cardPeriodo.setStyle(
                "-fx-background-color: #F8FAFC; " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        Label periodoLabel = new Label("Período");
        periodoLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane gridPeriodo = new GridPane();
        gridPeriodo.setHgap(10);
        gridPeriodo.setVgap(10);
        gridPeriodo.setAlignment(Pos.CENTER);

        String campoStyle =
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;";

        dataInicioPicker = new DatePicker(LocalDate.now().minusDays(30));
        dataInicioPicker.setPrefWidth(250);
        dataInicioPicker.setStyle(campoStyle);

        dataFimPicker = new DatePicker(LocalDate.now());
        dataFimPicker.setPrefWidth(250);
        dataFimPicker.setStyle(campoStyle);

        gridPeriodo.add(criarLabel("Início:"), 0, 0);
        gridPeriodo.add(dataInicioPicker, 1, 0);
        gridPeriodo.add(criarLabel("Fim:"), 0, 1);
        gridPeriodo.add(dataFimPicker, 1, 1);

        // Botões de período rápido
        HBox periodosRapidos = new HBox(8);
        periodosRapidos.setAlignment(Pos.CENTER_LEFT);
        periodosRapidos.setPadding(new Insets(5, 0, 0, 0));

        Button btnHoje = criarBotaoPeriodo("Hoje");
        Button btnSemana = criarBotaoPeriodo("Ultimos 7 dias");
        Button btnMes = criarBotaoPeriodo("Ultimos 30 dias");
        Button btnMesAtual = criarBotaoPeriodo("Mês atual");

        btnHoje.setOnAction(e -> {
            dataInicioPicker.setValue(LocalDate.now());
            dataFimPicker.setValue(LocalDate.now());
        });

        btnSemana.setOnAction(e -> {
            dataInicioPicker.setValue(LocalDate.now().minusDays(7));
            dataFimPicker.setValue(LocalDate.now());
        });

        btnMes.setOnAction(e -> {
            dataInicioPicker.setValue(LocalDate.now().minusDays(30));
            dataFimPicker.setValue(LocalDate.now());
        });

        btnMesAtual.setOnAction(e -> {
            dataInicioPicker.setValue(LocalDate.now().withDayOfMonth(1));
            dataFimPicker.setValue(LocalDate.now());
        });

        periodosRapidos.getChildren().addAll(btnHoje, btnSemana, btnMes, btnMesAtual);

        cardPeriodo.getChildren().addAll(periodoLabel, gridPeriodo, periodosRapidos);

        // ========== NOVO: Card de Tipo de Relatório ==========
        VBox cardTipo = new VBox(12);
        cardTipo.setPadding(new Insets(15));
        cardTipo.setStyle(
                "-fx-background-color: #F8FAFC; " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        Label tipoLabel = new Label("Tipo de Relatório");
        tipoLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        comboTipoRelatorio = new ComboBox<>();
        comboTipoRelatorio.getItems().addAll(
                RelatorioDTO.TipoRelatorio.ITENS_CADASTRADOS,
                RelatorioDTO.TipoRelatorio.ITENS_DEVOLVIDOS,
                RelatorioDTO.TipoRelatorio.ITENS_REQUISITADOS,
                RelatorioDTO.TipoRelatorio.ITENS_ENCAMINHADOS,
                RelatorioDTO.TipoRelatorio.TODOS
        );
        comboTipoRelatorio.setValue(RelatorioDTO.TipoRelatorio.TODOS);
        comboTipoRelatorio.setPrefWidth(350);
        comboTipoRelatorio.setCellFactory(lv -> new ListCell<RelatorioDTO.TipoRelatorio>() {
            @Override
            protected void updateItem(RelatorioDTO.TipoRelatorio item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getDescricao());
            }
        });
        comboTipoRelatorio.setButtonCell(new ListCell<RelatorioDTO.TipoRelatorio>() {
            @Override
            protected void updateItem(RelatorioDTO.TipoRelatorio item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.getDescricao());
            }
        });
        estilizarComboBox(comboTipoRelatorio);

        cardTipo.getChildren().addAll(tipoLabel, comboTipoRelatorio);

        // Card de formato do relatório
        VBox cardFormato = new VBox(12);
        cardFormato.setPadding(new Insets(15));
        cardFormato.setStyle(
                "-fx-background-color: #F8FAFC; " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        Label formatoLabel = new Label("Formato");
        formatoLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        ToggleGroup grupoFormato = new ToggleGroup();

        RadioButton rbExcel = new RadioButton("Excel");
        rbExcel.setToggleGroup(grupoFormato);
        rbExcel.setSelected(true);
        rbExcel.setStyle("-fx-font-size: 12px; -fx-text-fill: #334155;");

        RadioButton rbPDF = new RadioButton("PDF");
        rbPDF.setToggleGroup(grupoFormato);
        rbPDF.setStyle("-fx-font-size: 12px; -fx-text-fill: #334155;");

        HBox opcoesFormato = new HBox(20);
        opcoesFormato.setAlignment(Pos.CENTER);
        opcoesFormato.getChildren().addAll(rbExcel, rbPDF);

        cardFormato.getChildren().addAll(formatoLabel, opcoesFormato);

        // Barra de progresso
        progressBar = new ProgressBar();
        progressBar.setPrefWidth(300);
        progressBar.setVisible(false);
        progressBar.setStyle("-fx-accent: #1E3A8A; -fx-background-radius: 4;");

        // Status label
        statusLabel = new Label();
        statusLabel.setStyle("-fx-text-fill: #64748B; -fx-font-size: 11px; -fx-font-style: italic;");
        statusLabel.setAlignment(Pos.CENTER);

        // Botões de ação
        HBox botoes = new HBox(10);
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(10, 0, 5, 0));

        Button btnGerar = criarBotaoPrincipal("Gerar", "#1E3A8A", "#3B82F6");
        Button btnCancelar = criarBotaoPrincipal("Cancelar", "#64748B", "#475569");
        btnCancelar.setOnAction(e -> stage.close());

        botoes.getChildren().addAll(btnGerar, btnCancelar);

        VBox centerContainer = new VBox(12);
        centerContainer.setAlignment(Pos.TOP_CENTER);
        centerContainer.getChildren().addAll(
                titulo,
                cardPeriodo,
                cardTipo,      // NOVO
                cardFormato,
                progressBar,
                statusLabel,
                botoes
        );

        conteudo.getChildren().add(centerContainer);

        // Ação do botão Gerar
        btnGerar.setOnAction(e -> {
            try {
                LocalDate inicio = dataInicioPicker.getValue();
                LocalDate fim = dataFimPicker.getValue();
                RelatorioDTO.TipoRelatorio tipo = comboTipoRelatorio.getValue();

                if (inicio == null || fim == null) {
                    mostrarAlerta("Erro", "Selecione as datas de início e fim.", Alert.AlertType.ERROR);
                    return;
                }

                if (fim.isBefore(inicio)) {
                    mostrarAlerta("Erro", "A data fim não pode ser anterior à data início.", Alert.AlertType.ERROR);
                    return;
                }

                Date dataInicio = Date.from(inicio.atStartOfDay(ZoneId.systemDefault()).toInstant());
                Date dataFim = Date.from(fim.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant());

                boolean isExcel = rbExcel.isSelected();

                FileChooser fileChooser = new FileChooser();
                fileChooser.setTitle("Salvar Relatório");

                // Diretório inicial seguro
                File diretorioInicial = obterDiretorioInicial();
                fileChooser.setInitialDirectory(diretorioInicial);

                String nomeArquivo = tipo.name().toLowerCase() + "_" + inicio + "_a_" + fim;

                if (isExcel) {
                    fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Excel", "*.xlsx"));
                    fileChooser.setInitialFileName(nomeArquivo + ".xlsx");
                } else {
                    fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("PDF", "*.pdf"));
                    fileChooser.setInitialFileName(nomeArquivo + ".pdf");
                }

                File arquivo = fileChooser.showSaveDialog(stage);

                if (arquivo != null) {
                    btnGerar.setDisable(true);
                    btnCancelar.setDisable(true);
                    progressBar.setVisible(true);
                    progressBar.setProgress(ProgressBar.INDETERMINATE_PROGRESS);
                    statusLabel.setText("Gerando...");

                    new Thread(() -> {
                        try {
                            javafx.application.Platform.runLater(() ->
                                    statusLabel.setText("Buscando dados..."));

                            RelatorioDTO dados = relatorioController.gerarDadosRelatorio(dataInicio, dataFim, tipo);

                            javafx.application.Platform.runLater(() ->
                                    statusLabel.setText("Gerando arquivo..."));

                            if (isExcel) {
                                RelatorioExcel excel = new RelatorioExcel();
                                excel.gerarExcel(dados, arquivo.getAbsolutePath());
                            } else {
                                RelatorioPDF pdf = new RelatorioPDF();
                                pdf.gerarPDF(dados, arquivo.getAbsolutePath());
                            }

                            javafx.application.Platform.runLater(() -> {
                                progressBar.setVisible(false);
                                statusLabel.setText("Concluído!");
                                mostrarAlerta("Sucesso", "Relatório salvo:\n" + arquivo.getAbsolutePath(),
                                        Alert.AlertType.INFORMATION);

                                try {
                                    if (Desktop.isDesktopSupported()) {
                                        Desktop.getDesktop().open(arquivo);
                                    }
                                } catch (IOException ex) {
                                    // Ignora erro ao abrir
                                }

                                btnGerar.setDisable(false);
                                btnCancelar.setDisable(false);
                            });

                        } catch (Exception ex) {
                            javafx.application.Platform.runLater(() -> {
                                progressBar.setVisible(false);
                                statusLabel.setText("Erro.");
                                mostrarAlerta("Erro", "Falha ao gerar relatório:\n" + ex.getMessage(),
                                        Alert.AlertType.ERROR);
                                btnGerar.setDisable(false);
                                btnCancelar.setDisable(false);
                                ex.printStackTrace();
                            });
                        }
                    }).start();
                }

            } catch (Exception ex) {
                mostrarAlerta("Erro", "Erro: " + ex.getMessage(), Alert.AlertType.ERROR);
            }
        });

        return conteudo;
    }

    private File obterDiretorioInicial() {
        String userHome = System.getProperty("user.home");
        File documentos = new File(userHome, "Documents");
        File desktop = new File(userHome, "Desktop");

        if (documentos.exists() && documentos.isDirectory()) {
            return documentos;
        } else if (desktop.exists() && desktop.isDirectory()) {
            return desktop;
        } else {
            return new File(userHome);
        }
    }

    private Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        return label;
    }

    private Button criarBotaoPeriodo(String texto) {
        Button btn = new Button(texto);
        btn.setStyle(
                "-fx-background-color: #E2E8F0; " +
                        "-fx-text-fill: #334155; " +
                        "-fx-padding: 5 10; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-cursor: hand;"
        );

        btn.setOnMouseEntered(e -> btn.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 5 10; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-cursor: hand;"
        ));

        btn.setOnMouseExited(e -> btn.setStyle(
                "-fx-background-color: #E2E8F0; " +
                        "-fx-text-fill: #334155; " +
                        "-fx-padding: 5 10; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: 600; " +
                        "-fx-cursor: hand;"
        ));

        return btn;
    }

    private Button criarBotaoPrincipal(String texto, String corNormal, String corHover) {
        Button btn = new Button(texto);
        btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 20; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 12px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                corNormal
        ));

        btn.setOnMouseEntered(e -> btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 20; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 12px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 8, 0, 0, 3);",
                corHover
        )));

        btn.setOnMouseExited(e -> btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 20; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 12px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                corNormal
        )));

        return btn;
    }

    private void estilizarComboBox(ComboBox<RelatorioDTO.TipoRelatorio> comboBox) {
        comboBox.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 0; " +
                        "-fx-font-size: 12px;"
        );

        // Configurar a célula do botão (o que aparece quando fechado)
        comboBox.setButtonCell(new ListCell<RelatorioDTO.TipoRelatorio>() {
            @Override
            protected void updateItem(RelatorioDTO.TipoRelatorio item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(comboBox.getPromptText() != null ? comboBox.getPromptText() : "");
                    setStyle("-fx-text-fill: #94A3B8; -fx-padding: 6 8; -fx-font-size: 12px;");
                } else {
                    setText(item.getDescricao()); // Usa getDescricao() em vez de toString()
                    setStyle("-fx-text-fill: #334155; -fx-padding: 6 8; -fx-font-size: 12px;");
                }
            }
        });

        // Configurar a fábrica de células para a lista suspensa
        comboBox.setCellFactory(lv -> new ListCell<RelatorioDTO.TipoRelatorio>() {
            @Override
            protected void updateItem(RelatorioDTO.TipoRelatorio item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(item.getDescricao()); // Usa getDescricao() em vez de toString()
                    setStyle("-fx-text-fill: #334155; -fx-padding: 6 10; -fx-font-size: 12px;");

                    setOnMouseEntered(e -> setStyle("-fx-background-color: #EFF6FF; -fx-text-fill: #1E3A8A; -fx-padding: 6 10; -fx-font-size: 12px;"));
                    setOnMouseExited(e -> setStyle("-fx-background-color: white; -fx-text-fill: #334155; -fx-padding: 6 10; -fx-font-size: 12px;"));
                }
            }
        });

        comboBox.showingProperty().addListener((obs, wasShowing, isShowing) -> {
            if (isShowing) {
                applyArrowStyle(comboBox);
            }
        });


        comboBox.showingProperty().addListener((obs, wasShowing, isShowing) -> {
            if (isShowing) {
                applyArrowStyle(comboBox);
            }
        });
    }

    private void applyArrowStyle(ComboBox<RelatorioDTO.TipoRelatorio> comboBox) {
        javafx.application.Platform.runLater(() -> {
            try {
                comboBox.lookup(".arrow-button").setStyle(
                        "-fx-background-color: #1E3A8A; " +
                                "-fx-background-radius: 0 4 4 0;"
                );

                comboBox.lookup(".arrow").setStyle(
                        "-fx-background-color: white; " +
                                "-fx-scale-shape: true;"
                );
            } catch (Exception e) {
                // Ignorar se não encontrar os elementos ainda
            }
        });
    }

    private void mostrarAlerta(String titulo, String mensagem, Alert.AlertType tipo) {
        Alert alert = new Alert(tipo);
        alert.setTitle(titulo);
        alert.setHeaderText(null);
        alert.setContentText(mensagem);

        DialogPane dialogPane = alert.getDialogPane();
        dialogPane.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        alert.showAndWait();
    }
}