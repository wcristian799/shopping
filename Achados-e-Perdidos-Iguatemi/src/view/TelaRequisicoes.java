package view;

import controller.RequisicaoClienteController;
import controller.ItemPerdidoController;
import dao.TipoObjetoDao;
import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.*;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.scene.control.TextFormatter;
import javafx.util.converter.DefaultStringConverter;
import java.util.function.UnaryOperator;
import model.RequisicaoCliente;
import model.ItemPerdido;
import model.TipoObjeto;

import java.text.SimpleDateFormat;
import java.util.List;

public class TelaRequisicoes extends Application {
    private RequisicaoClienteController requisicaoController;
    private ItemPerdidoController itemPerdidoController;
    private TipoObjetoDao tipoObjetoDao;
    private TableView<RequisicaoTabela> tabela;

    private CheckBox chkMostrarTodas;

    // Controle para evitar múltiplas janelas abertas
    private static Stage telaRequisicoesStage = null;

    public TelaRequisicoes() {
        this.requisicaoController = new RequisicaoClienteController();
        this.itemPerdidoController = new ItemPerdidoController();
        this.tipoObjetoDao = new TipoObjetoDao();
    }

    public static void abrirTelaRequisicoes(Stage owner) {
        if (telaRequisicoesStage != null && telaRequisicoesStage.isShowing()) {
            telaRequisicoesStage.toFront();
            telaRequisicoesStage.requestFocus();
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.NONE);

        try {
            new TelaRequisicoes().start(novaStage);
            telaRequisicoesStage = novaStage;

            novaStage.setOnHidden(event -> telaRequisicoesStage = null);
            novaStage.setOnCloseRequest(event -> telaRequisicoesStage = null);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Requisições de Clientes");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox centerContent = criarConteudoCentral(stage);
        root.setCenter(centerContent);

        Scene scene = new Scene(root, 1075, 600);
        stage.setScene(scene);
        stage.setMinWidth(800);
        stage.setMinHeight(500);
        stage.show();

        carregarRequisicoes();
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(15);
        conteudo.setPadding(new Insets(15, 20, 20, 20));

        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Requisições de Clientes");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        HBox painelSuperior = new HBox(12);
        painelSuperior.setAlignment(Pos.CENTER_LEFT);
        painelSuperior.setPadding(new Insets(5, 0, 5, 0));

        Button btnNovaRequisicao = criarBotaoAcao("+ Nova Requisição", "#8b5cf6");
        btnNovaRequisicao.setOnAction(e -> abrirDialogoNovaRequisicao(stage));

        Button btnAtualizar = criarBotaoAcao("Atualizar", "#3B82F6");
        btnAtualizar.setOnAction(e -> {
            if (chkMostrarTodas.isSelected()) {
                carregarTodasRequisicoes();
            } else {
                carregarRequisicoes();
            }
        });

        chkMostrarTodas = new CheckBox("Mostrar todas");
        chkMostrarTodas.setStyle("-fx-font-size: 12px; -fx-text-fill: #334155;");
        chkMostrarTodas.setOnAction(e -> {
            if (chkMostrarTodas.isSelected()) {
                carregarTodasRequisicoes();
            } else {
                carregarRequisicoes();
            }
        });

        painelSuperior.getChildren().addAll(btnNovaRequisicao, btnAtualizar, chkMostrarTodas);

        tabela = criarTabela();
        VBox.setVgrow(tabela, Priority.ALWAYS);

        conteudo.getChildren().addAll(titulo, painelSuperior, tabela);
        return conteudo;
    }

    private Button criarBotaoAcao(String texto, String cor) {
        Button btn = new Button(texto);
        btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 5, 0, 0, 2);",
                cor
        ));

        String corHover = cor.equals("#8b5cf6") ? "#7c3aed" :
                cor.equals("#3B82F6") ? "#2563eb" : "#475569";

        btn.setOnMouseEntered(e -> btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.3), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;",
                corHover
        )));

        btn.setOnMouseExited(e -> btn.setStyle(String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 5, 0, 0, 2);",
                cor
        )));

        return btn;
    }

    private TableView<RequisicaoTabela> criarTabela() {
        TableView<RequisicaoTabela> table = new TableView<>();
        table.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 5);"
        );

        table.setStyle(table.getStyle() +
                "-fx-font-family: 'Segoe UI'; " +
                "-fx-font-size: 11px;"
        );

        table.setFixedCellSize(30);

        table.setRowFactory(tv -> {
            TableRow<RequisicaoTabela> row = new TableRow<>();

            row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: transparent;");

            row.setOnMouseEntered(e -> {
                if (!row.isEmpty()) {
                    row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: #EFF6FF;");
                }
            });

            row.setOnMouseExited(e -> {
                if (!row.isEmpty()) {
                    if (row.isSelected()) {
                        row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: #DBEAFE;");
                    } else {
                        row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: transparent;");
                    }
                }
            });

            row.selectedProperty().addListener((obs, oldVal, newVal) -> {
                if (newVal) {
                    row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: #DBEAFE;");
                } else {
                    row.setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 0 1 0; -fx-background-color: transparent;");
                }
            });

            return row;
        });

        TableColumn<RequisicaoTabela, String> colData = new TableColumn<>("Data");
        colData.setCellValueFactory(new PropertyValueFactory<>("data"));
        colData.setPrefWidth(100);
        colData.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item.split(" ")[0]);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colCodigo = new TableColumn<>("Código");
        colCodigo.setCellValueFactory(new PropertyValueFactory<>("codigo"));
        colCodigo.setPrefWidth(100);
        colCodigo.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #1E3A8A; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colCliente = new TableColumn<>("Cliente");
        colCliente.setCellValueFactory(new PropertyValueFactory<>("cliente"));
        colCliente.setPrefWidth(120);
        colCliente.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-weight: 600; -fx-text-fill: #0f172a; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colTelefone = new TableColumn<>("Telefone");
        colTelefone.setCellValueFactory(new PropertyValueFactory<>("telefone"));
        colTelefone.setPrefWidth(100);
        colTelefone.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colCategoria = new TableColumn<>("Categoria");
        colCategoria.setCellValueFactory(new PropertyValueFactory<>("categoria"));
        colCategoria.setPrefWidth(100);
        colCategoria.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.equals("-")) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colDescricao = new TableColumn<>("Descrição");
        colDescricao.setCellValueFactory(new PropertyValueFactory<>("descricao"));
        colDescricao.setPrefWidth(180);
        colDescricao.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4; -fx-wrap-text: true; -fx-max-width: 300px;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colResponsavel = new TableColumn<>("Cadastrado por");
        colResponsavel.setCellValueFactory(new PropertyValueFactory<>("responsavel"));
        colResponsavel.setPrefWidth(120);
        colResponsavel.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colItemEncontrado = new TableColumn<>("Item Encontrado");
        colItemEncontrado.setCellValueFactory(new PropertyValueFactory<>("itemEncontrado"));
        colItemEncontrado.setPrefWidth(100);
        colItemEncontrado.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.equals("-")) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-weight: bold; -fx-text-fill: #1E3A8A; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<RequisicaoTabela, String> colStatus = new TableColumn<>("Status");
        colStatus.setCellValueFactory(new PropertyValueFactory<>("status"));
        colStatus.setPrefWidth(100);
        colStatus.setCellFactory(column -> new TableCell<RequisicaoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);

                    String estiloBase = "-fx-padding: 5 4; -fx-font-size: 11px; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0;";

                    if (item.equals("Encontrado")) {
                        setStyle(estiloBase + " -fx-background-color: #E6F7E6; -fx-text-fill: #1E5A1E;");
                    } else {
                        setStyle(estiloBase + " -fx-background-color: #FFE5E5; -fx-text-fill: #8B0000;");
                    }
                }
            }
        });

        table.getColumns().forEach(column -> {
            column.setStyle(
                    "-fx-background-color: #1E3A8A; " +
                            "-fx-text-fill: white; " +
                            "-fx-font-weight: bold; " +
                            "-fx-border-color: #3B82F6; " +
                            "-fx-border-width: 0 1 0 0; " +
                            "-fx-font-size: 11px; " +
                            "-fx-padding: 6 0;"
            );
        });

        table.getColumns().addAll(colData, colCodigo, colCliente, colTelefone, colCategoria, colDescricao, colResponsavel, colItemEncontrado, colStatus);

        return table;
    }

    // MÉTODOS COPIADOS DA TELA ENTREGA
    private void estilizarComboBox(ComboBox<String> comboBox) {
        comboBox.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 0; " +
                        "-fx-font-size: 12px;"
        );

        comboBox.setButtonCell(new ListCell<String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(comboBox.getPromptText() != null ? comboBox.getPromptText() : "");
                    setStyle("-fx-text-fill: #94A3B8; -fx-padding: 6 8; -fx-font-size: 12px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-padding: 6 8; -fx-font-size: 12px;");
                }
            }
        });

        if (comboBox.isEditable()) {
            comboBox.getEditor().setStyle(
                    "-fx-background-color: white; " +
                            "-fx-border-color: transparent; " +
                            "-fx-padding: 6 8; " +
                            "-fx-font-size: 12px;"
            );
        }

        comboBox.setCellFactory(lv -> new ListCell<String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                } else {
                    setText(item);
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
    }

    private void applyArrowStyle(ComboBox<?> comboBox) {
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

    private Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        return label;
    }

    private String criarEstiloCampo() {
        return "-fx-background-color: white; " +
                "-fx-border-color: #E2E8F0; " +
                "-fx-border-width: 1; " +
                "-fx-border-radius: 4; " +
                "-fx-background-radius: 4; " +
                "-fx-padding: 6 8; " +
                "-fx-font-size: 12px;";
    }

    private TextField criarCampoTelefone() {
        TextField campo = new TextField();
        campo.setPromptText("Telefone");
        campo.setPrefWidth(300);
        campo.setStyle(criarEstiloCampo());

        UnaryOperator<TextFormatter.Change> telefoneFilter = change -> {
            String newText = change.getControlNewText();
            if (newText.isEmpty()) {
                return change;
            }

            String digits = newText.replaceAll("[^0-9]", "");

            if (digits.length() > 11) {
                return null;
            }

            StringBuilder formatted = new StringBuilder();

            if (digits.length() <= 10) {
                for (int i = 0; i < digits.length(); i++) {
                    if (i == 0) {
                        formatted.append("(");
                    } else if (i == 2) {
                        formatted.append(") ");
                    } else if (i == 6) {
                        formatted.append("-");
                    }
                    formatted.append(digits.charAt(i));
                }
            } else {
                for (int i = 0; i < digits.length(); i++) {
                    if (i == 0) {
                        formatted.append("(");
                    } else if (i == 2) {
                        formatted.append(") ");
                    } else if (i == 7) {
                        formatted.append("-");
                    }
                    formatted.append(digits.charAt(i));
                }
            }

            change.setText(formatted.toString());
            change.setRange(0, change.getControlText().length());
            change.setCaretPosition(formatted.length());
            change.setAnchor(formatted.length());
            return change;
        };

        campo.setTextFormatter(new TextFormatter<>(new DefaultStringConverter(), "", telefoneFilter));
        return campo;
    }

    private void abrirDialogoNovaRequisicao(Stage parentStage) {
        Stage dialog = new Stage();
        dialog.setTitle("Nova Requisição");
        util.IconeUtil.aplicarIcone(dialog);
        dialog.initOwner(parentStage);
        dialog.initModality(Modality.WINDOW_MODAL);

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox content = new VBox(12);
        content.setPadding(new Insets(15));
        content.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Nova Requisição");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane grid = new GridPane();
        grid.setHgap(8);
        grid.setVgap(10);
        grid.setAlignment(Pos.CENTER);

        String campoStyle = criarEstiloCampo();

        TextField campoNome = new TextField();
        campoNome.setPromptText("Nome do cliente");
        campoNome.setPrefWidth(300);
        campoNome.setStyle(campoStyle);

        TextField campoTelefone = criarCampoTelefone();

        ComboBox<String> comboCategoria = new ComboBox<>();
        comboCategoria.setPromptText("Selecione a categoria");
        comboCategoria.setPrefWidth(300);
        comboCategoria.setEditable(false);
        estilizarComboBox(comboCategoria);

        List<TipoObjeto> tipos = tipoObjetoDao.listarTipos();
        ObservableList<String> categorias = FXCollections.observableArrayList();
        for (TipoObjeto tipo : tipos) {
            categorias.add(tipo.getNome());
        }
        comboCategoria.setItems(categorias);

        // ComboBox para selecionar o responsável (com barra de pesquisa)
        final OperadorSelectionUtil.OperadorSelecionado[] operadorSelecionado = new OperadorSelectionUtil.OperadorSelecionado[1];
        ComboBox<String> comboOperador = new ComboBox<>();
        comboOperador.setPromptText("Nome do operador");
        comboOperador.setPrefWidth(260);
        comboOperador.setEditable(true);
        estilizarComboBox(comboOperador);

        Button btnNovoOperador = new Button("+");
        btnNovoOperador.setPrefWidth(32);
        btnNovoOperador.setPrefHeight(30);
        btnNovoOperador.setStyle(criarEstiloBotaoPequeno("#1E3A8A"));

        OperadorSelectionUtil.configurar(comboOperador, btnNovoOperador, dialog, selecionado -> operadorSelecionado[0] = selecionado);

        HBox operadorBox = new HBox(8, comboOperador, btnNovoOperador);
        operadorBox.setAlignment(Pos.CENTER_LEFT);

        TextArea areaDescricao = new TextArea();
        areaDescricao.setPromptText("Descrição detalhada do objeto");
        areaDescricao.setPrefHeight(100);
        areaDescricao.setPrefWidth(300);
        areaDescricao.setStyle(campoStyle + "-fx-padding: 6;");

        int row = 0;
        grid.add(criarLabel("Nome:"), 0, row);
        grid.add(campoNome, 1, row++);

        grid.add(criarLabel("Telefone:"), 0, row);
        grid.add(campoTelefone, 1, row++);

        grid.add(criarLabel("Categoria:"), 0, row);
        grid.add(comboCategoria, 1, row++);

        grid.add(criarLabel("Nome do operador:"), 0, row);
        grid.add(operadorBox, 1, row++);

        grid.add(criarLabel("Descrição:"), 0, row);
        grid.add(areaDescricao, 1, row++);

        HBox botoes = new HBox(12);
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        Button btnSalvar = new Button("Cadastrar");
        btnSalvar.setPrefWidth(130);
        btnSalvar.setPrefHeight(35);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> {
            String nome = campoNome.getText().trim();
            String telefone = campoTelefone.getText().trim();
            String categoria = comboCategoria.getValue();
            String descricao = areaDescricao.getText().trim();
            OperadorSelectionUtil.OperadorSelecionado operadorValidado = operadorSelecionado[0];

            if (nome.isEmpty() || telefone.isEmpty() || descricao.isEmpty()) {
                mostrarAlerta("Erro", "Preencha todos os campos obrigatórios", Alert.AlertType.ERROR);
                return;
            }

            if (operadorValidado == null) {
                mostrarAlerta("Erro", "Selecione o operador e valide com CPF e assinatura.", Alert.AlertType.ERROR);
                return;
            }

            final String categoriaFinal = (categoria != null) ? categoria : "";
            final String descricaoFinal = descricao;
            final String responsavelFinal = operadorValidado.getOperador().getNomeCompleto();
            final Integer operadorIdFinal = operadorValidado.getOperador().getId();
            final String assinaturaOperadorFinal = operadorValidado.getAssinatura();

            List<ItemPerdido> parecidos = itemPerdidoController.buscarItensParecidos(categoriaFinal, descricaoFinal);

            if (!parecidos.isEmpty()) {
                Stage alertaStage = new Stage();
                alertaStage.setTitle("Possível Duplicata Encontrada");
                alertaStage.initOwner(dialog);
                alertaStage.initModality(Modality.WINDOW_MODAL);
                alertaStage.setResizable(false);

                VBox alertaRoot = new VBox(15);
                alertaRoot.setPadding(new Insets(15));
                alertaRoot.setStyle(
                        "-fx-background-color: white; " +
                                "-fx-background-radius: 4; " +
                                "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
                );

                Label lblTitulo = new Label("Atenção!");
                lblTitulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

                Label lblMsg = new Label("Foram encontrados " + parecidos.size() + " itens cadastrados que podem ser semelhantes à requisição que você está criando.");
                lblMsg.setStyle("-fx-font-size: 12px; -fx-text-fill: #334155; -fx-wrap-text: true;");

                TableView<ItemPerdido> tabelaParecidos = new TableView<>();
                tabelaParecidos.setPrefHeight(150);
                tabelaParecidos.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 4;");

                TableColumn<ItemPerdido, String> colNum = new TableColumn<>("Nº Reg");
                colNum.setCellValueFactory(cell -> new javafx.beans.property.SimpleStringProperty(String.valueOf(cell.getValue().getNumeroRegistro())));
                colNum.setPrefWidth(70);
                colNum.setStyle("-fx-alignment: CENTER;");

                TableColumn<ItemPerdido, String> colNomeItem = new TableColumn<>("Nome");
                colNomeItem.setCellValueFactory(cell -> new javafx.beans.property.SimpleStringProperty(cell.getValue().getNome()));
                colNomeItem.setPrefWidth(140);

                TableColumn<ItemPerdido, String> colData = new TableColumn<>("Data");
                colData.setCellValueFactory(cell -> {
                    SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
                    return new javafx.beans.property.SimpleStringProperty(sdf.format(cell.getValue().getDataRegistro()));
                });
                colData.setPrefWidth(80);
                colData.setStyle("-fx-alignment: CENTER;");

                TableColumn<ItemPerdido, String> colObs = new TableColumn<>("Observação");
                colObs.setCellValueFactory(cell -> {
                    String obs = cell.getValue().getObservacao();
                    String obsCurta = (obs != null && obs.length() > 30) ? obs.substring(0, 27) + "..." : obs;
                    return new javafx.beans.property.SimpleStringProperty(obsCurta != null ? obsCurta : "-");
                });
                colObs.setPrefWidth(180);

                tabelaParecidos.getColumns().addAll(colNum, colNomeItem, colData, colObs);
                tabelaParecidos.getItems().addAll(parecidos);

                Label lblPergunta = new Label("Deseja continuar com o cadastro mesmo assim?");
                lblPergunta.setStyle("-fx-font-size: 13px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

                HBox botoesAlerta = new HBox(15);
                botoesAlerta.setAlignment(Pos.CENTER);

                Button btnSim = new Button("Sim, cadastrar mesmo assim");
                btnSim.setStyle(criarEstiloBotaoPequeno("#DC2626"));
                btnSim.setOnMouseEntered(ev -> btnSim.setStyle(criarEstiloBotaoPequenoHover("#B91C1C")));
                btnSim.setOnMouseExited(ev -> btnSim.setStyle(criarEstiloBotaoPequeno("#DC2626")));
                btnSim.setOnAction(ev -> {
                    salvarRequisicao(nome, telefone, categoriaFinal, descricaoFinal, responsavelFinal,
                            operadorIdFinal, assinaturaOperadorFinal, dialog);
                    alertaStage.close();
                });

                Button btnNao = new Button("Não, revisar");
                btnNao.setStyle(criarEstiloBotaoPequeno("#64748B"));
                btnNao.setOnMouseEntered(ev -> btnNao.setStyle(criarEstiloBotaoPequenoHover("#475569")));
                btnNao.setOnMouseExited(ev -> btnNao.setStyle(criarEstiloBotaoPequeno("#64748B")));
                btnNao.setOnAction(ev -> alertaStage.close());

                botoesAlerta.getChildren().addAll(btnSim, btnNao);

                alertaRoot.getChildren().addAll(lblTitulo, lblMsg, tabelaParecidos, lblPergunta, botoesAlerta);

                Scene alertaScene = new Scene(alertaRoot, 600, 450);
                alertaStage.setScene(alertaScene);
                alertaStage.showAndWait();
            } else {
                salvarRequisicao(nome, telefone, categoriaFinal, descricaoFinal, responsavelFinal,
                        operadorIdFinal, assinaturaOperadorFinal, dialog);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(130);
        btnCancelar.setPrefHeight(35);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        content.getChildren().addAll(titulo, grid, botoes);

        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle(
                "-fx-background-color: transparent; " +
                        "-fx-border-color: transparent;"
        );
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        root.setCenter(scrollPane);

        Scene scene = new Scene(root, 450, 400);
        dialog.setScene(scene);
        dialog.show();

        javafx.application.Platform.runLater(() -> {
            applyArrowStyle(comboCategoria);
            applyArrowStyle(comboOperador);
        });
    }

    private String criarEstiloBotaoPrincipal(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private String criarEstiloBotaoPrincipalHover(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private String criarEstiloBotaoPequeno(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 6 12; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private String criarEstiloBotaoPequenoHover(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 6 12; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 11px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private void salvarRequisicao(String nome, String telefone, String categoria, String descricao, String responsavel,
                                  Integer operadorId, String assinaturaOperador, Stage dialog) {
        try {
            boolean sucesso = requisicaoController.cadastrarRequisicao(nome, telefone, categoria, descricao,
                    responsavel, operadorId, assinaturaOperador);

            if (sucesso) {
                mostrarAlerta("Sucesso", "Requisição cadastrada com sucesso!", Alert.AlertType.INFORMATION);
                dialog.close();
                if (chkMostrarTodas.isSelected()) {
                    carregarTodasRequisicoes();
                } else {
                    carregarRequisicoes();
                }
            } else {
                mostrarAlerta("Erro", "Erro ao cadastrar requisição", Alert.AlertType.ERROR);
            }
        } catch (Exception ex) {
            mostrarAlerta("Erro", "Erro: " + ex.getMessage(), Alert.AlertType.ERROR);
        }
    }

    private void carregarRequisicoes() {
        List<RequisicaoCliente> requisicoes = requisicaoController.listarRequisicoesPendentes();
        ObservableList<RequisicaoTabela> dados = FXCollections.observableArrayList();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        for (RequisicaoCliente req : requisicoes) {
            // MODIFICADO: Mostra o número do lacre em vez do nome do item
            String lacreItem = (req.getNumeroLacre() != null) ? String.valueOf(req.getNumeroLacre()) : "-";

            RequisicaoTabela rt = new RequisicaoTabela(
                    req.getCodigoRequisicao(),
                    sdf.format(req.getDataRequisicao()),
                    req.getNomeCliente(),
                    req.getTelefone(),
                    req.getCategoriaObjeto() != null ? req.getCategoriaObjeto() : "-",
                    req.getDescricao(),
                    req.isEncontrado() ? "Encontrado" : "Pendente",
                    lacreItem, // Agora passa o lacre
                    req.getResponsavelCadastro() != null ? req.getResponsavelCadastro() : "Não informado"
            );
            rt.setId(req.getId());
            dados.add(rt);
        }

        tabela.setItems(dados);
    }

    private void carregarTodasRequisicoes() {
        List<RequisicaoCliente> requisicoes = requisicaoController.listarTodasRequisicoes();
        ObservableList<RequisicaoTabela> dados = FXCollections.observableArrayList();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        for (RequisicaoCliente req : requisicoes) {
            // MODIFICADO: Mostra o número do lacre em vez do nome do item
            String lacreItem = (req.getNumeroLacre() != null) ? String.valueOf(req.getNumeroLacre()) : "-";

            RequisicaoTabela rt = new RequisicaoTabela(
                    req.getCodigoRequisicao(),
                    sdf.format(req.getDataRequisicao()),
                    req.getNomeCliente(),
                    req.getTelefone(),
                    req.getCategoriaObjeto() != null ? req.getCategoriaObjeto() : "-",
                    req.getDescricao(),
                    req.isEncontrado() ? "Encontrado" : "Pendente",
                    lacreItem,
                    req.getResponsavelCadastro() != null ? req.getResponsavelCadastro() : "Não informado"
            );
            rt.setId(req.getId());
            dados.add(rt);
        }

        tabela.setItems(dados);
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

    public static class RequisicaoTabela {
        private int id;
        private String codigo;
        private String data;
        private String cliente;
        private String telefone;
        private String categoria;
        private String descricao;
        private String status;
        private String itemEncontrado;
        private String responsavel;

        public RequisicaoTabela(String codigo, String data, String cliente, String telefone, String categoria,
                                String descricao, String status, String itemEncontrado, String responsavel) {
            this.codigo = codigo;
            this.data = data;
            this.cliente = cliente;
            this.telefone = telefone;
            this.categoria = categoria;
            this.descricao = descricao;
            this.status = status;
            this.itemEncontrado = itemEncontrado;
            this.responsavel = responsavel;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }

        public String getCodigo() { return codigo; }
        public String getData() { return data; }
        public String getCliente() { return cliente; }
        public String getTelefone() { return telefone; }
        public String getCategoria() { return categoria; }
        public String getDescricao() { return descricao; }
        public String getStatus() { return status; }
        public String getItemEncontrado() { return itemEncontrado; }
        public String getResponsavel() { return responsavel; }
    }
}
