package view;

import controller.UsuarioController;
import controller.ItemDestinadoController;
import controller.ItemPerdidoController;
import dao.DestinoFinalDao;
import dao.TipoObjetoDao;
import javafx.application.Application;
import javafx.beans.value.ChangeListener;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.*;
import javafx.stage.Modality;
import javafx.stage.Stage;
import model.DestinoFinal;
import model.ItemDestinado;
import model.ItemPerdido;
import model.TipoObjeto;
import model.Usuario;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class TelaEncaminhamento extends Application {
    private ItemDestinadoController itemDestinadoController;
    private ItemPerdidoController itemPerdidoController;
    private UsuarioController usuarioController;
    private DestinoFinalDao destinoDao = new DestinoFinalDao();
    private TipoObjetoDao tipoDao = new TipoObjetoDao();

    private TableView<EncaminhamentoTabela> tabela;

    // Controle para evitar múltiplas janelas abertas
    private static Stage telaEncaminhamentoStage = null;

    public TelaEncaminhamento() {
        this.itemDestinadoController = new ItemDestinadoController();
        this.itemPerdidoController = new ItemPerdidoController();
        this.usuarioController = new UsuarioController();
    }

    /**
     * Método estático para abrir a tela de encaminhamento de forma segura.
     * Se já estiver aberta, foca na janela existente.
     * @param owner Janela pai (para initOwner)
     */
    public static void abrirTelaEncaminhamento(Stage owner) {
        if (telaEncaminhamentoStage != null && telaEncaminhamentoStage.isShowing()) {
            telaEncaminhamentoStage.toFront();
            telaEncaminhamentoStage.requestFocus();
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.NONE);

        try {
            new TelaEncaminhamento().start(novaStage);
            telaEncaminhamentoStage = novaStage;

            novaStage.setOnHidden(event -> telaEncaminhamentoStage = null);
            novaStage.setOnCloseRequest(event -> telaEncaminhamentoStage = null);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Encaminhamentos de Itens");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox centerContent = criarConteudoCentral(stage);
        root.setCenter(centerContent);

        Scene scene = new Scene(root, 900, 600);
        stage.setScene(scene);
        stage.setMinWidth(700);
        stage.setMinHeight(500);
        stage.show();

        carregarEncaminhamentos();
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(15);
        conteudo.setPadding(new Insets(15, 20, 20, 20));

        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Encaminhamentos");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        HBox painelSuperior = new HBox(12);
        painelSuperior.setAlignment(Pos.CENTER_LEFT);
        painelSuperior.setPadding(new Insets(5, 0, 5, 0));

        Button btnNovoEncaminhamento = criarBotaoAcao("+ Novo Encaminhamento", "#f39c12");
        btnNovoEncaminhamento.setOnAction(e -> abrirDialogoNovoEncaminhamento(stage));

        Button btnAtualizar = criarBotaoAcao("Atualizar", "#3B82F6");
        btnAtualizar.setOnAction(e -> carregarEncaminhamentos());

        painelSuperior.getChildren().addAll(btnNovoEncaminhamento, btnAtualizar);

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

        String corHover = cor.equals("#f39c12") ? "#e67e22" :
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

    private TableView<EncaminhamentoTabela> criarTabela() {
        TableView<EncaminhamentoTabela> table = new TableView<>();
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
            TableRow<EncaminhamentoTabela> row = new TableRow<>();

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

        TableColumn<EncaminhamentoTabela, String> colDataEnvio = new TableColumn<>("Data Envio");
        colDataEnvio.setCellValueFactory(new PropertyValueFactory<>("dataEnvio"));
        colDataEnvio.setPrefWidth(100);
        colDataEnvio.setCellFactory(column -> new TableCell<EncaminhamentoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<EncaminhamentoTabela, String> colDataInventario = new TableColumn<>("Data Inventário");
        colDataInventario.setCellValueFactory(new PropertyValueFactory<>("dataInventario"));
        colDataInventario.setPrefWidth(110);
        colDataInventario.setCellFactory(column -> new TableCell<EncaminhamentoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<EncaminhamentoTabela, String> colItem = new TableColumn<>("Item");
        colItem.setCellValueFactory(new PropertyValueFactory<>("item"));
        colItem.setPrefWidth(180);
        colItem.setCellFactory(column -> new TableCell<EncaminhamentoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    String texto = item.length() > 25 ? item.substring(0, 22) + "..." : item;
                    setText(texto);
                    setStyle("-fx-font-weight: 600; -fx-text-fill: #0f172a; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    if (item.length() > 25) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<EncaminhamentoTabela, String> colDestino = new TableColumn<>("Destino");
        colDestino.setCellValueFactory(new PropertyValueFactory<>("destino"));
        colDestino.setPrefWidth(130);
        colDestino.setCellFactory(column -> new TableCell<EncaminhamentoTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");
                } else {
                    String texto = item.length() > 18 ? item.substring(0, 15) + "..." : item;
                    setText(texto);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 5 4; -fx-font-size: 11px;");

                    if (item.length() > 18) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        // NOVA COLUNA: Encaminhado por
        TableColumn<EncaminhamentoTabela, String> colResponsavel = new TableColumn<>("Encaminhado por");
        colResponsavel.setCellValueFactory(new PropertyValueFactory<>("responsavel"));
        colResponsavel.setPrefWidth(120);
        colResponsavel.setCellFactory(column -> new TableCell<EncaminhamentoTabela, String>() {
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

        table.getColumns().addAll(colDataEnvio, colDataInventario, colItem, colDestino, colResponsavel);

        return table;
    }

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

    private void estilizarDatePicker(DatePicker datePicker) {
        datePicker.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 12px;"
        );

        datePicker.getEditor().setStyle(
                "-fx-background-color: white; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;"
        );
    }

    private Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        return label;
    }

    private void abrirDialogoNovoEncaminhamento(Stage parentStage) {
        Stage dialog = new Stage();
        dialog.setTitle("Encaminhar Itens");
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

        Label titulo = new Label("Encaminhar Itens Vencidos");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        // ==================== TIPOS DE ITENS ====================
        VBox tiposSection = new VBox(8);

        Label lblTipos = criarLabel("Tipos de Itens");

        List<TipoObjeto> tipos = tipoDao.listarTipos();
        VBox tiposContainer = new VBox(6);

        ObservableList<CheckBox> checkBoxesTipos = FXCollections.observableArrayList();

        for (TipoObjeto tipo : tipos) {
            CheckBox chk = new CheckBox(tipo.getNome());
            chk.setUserData(tipo.getId());
            chk.setWrapText(true);
            chk.setPrefWidth(350);
            chk.setStyle("-fx-text-fill: #334155; -fx-font-size: 12px;");
            checkBoxesTipos.add(chk);
            tiposContainer.getChildren().add(chk);
        }

        ScrollPane scrollTipos = new ScrollPane(tiposContainer);
        scrollTipos.setPrefHeight(100);
        scrollTipos.setFitToWidth(true);
        scrollTipos.setStyle("-fx-background: transparent; -fx-background-color: transparent; -fx-border-color: #E2E8F0; -fx-border-radius: 4;");

        HBox btnsTipos = new HBox(8);
        btnsTipos.setAlignment(Pos.CENTER_LEFT);

        Button btnSelecionarTodosTipos = new Button("Selecionar Todos");
        btnSelecionarTodosTipos.setStyle(criarEstiloBotaoPequeno("#3B82F6"));
        btnSelecionarTodosTipos.setOnMouseEntered(e -> btnSelecionarTodosTipos.setStyle(criarEstiloBotaoPequenoHover("#2563eb")));
        btnSelecionarTodosTipos.setOnMouseExited(e -> btnSelecionarTodosTipos.setStyle(criarEstiloBotaoPequeno("#3B82F6")));
        btnSelecionarTodosTipos.setOnAction(e -> checkBoxesTipos.forEach(chk -> chk.setSelected(true)));

        Button btnLimparTipos = new Button("Limpar");
        btnLimparTipos.setStyle(criarEstiloBotaoPequeno("#64748B"));
        btnLimparTipos.setOnMouseEntered(e -> btnLimparTipos.setStyle(criarEstiloBotaoPequenoHover("#475569")));
        btnLimparTipos.setOnMouseExited(e -> btnLimparTipos.setStyle(criarEstiloBotaoPequeno("#64748B")));
        btnLimparTipos.setOnAction(e -> checkBoxesTipos.forEach(chk -> chk.setSelected(false)));

        btnsTipos.getChildren().addAll(btnSelecionarTodosTipos, btnLimparTipos);

        tiposSection.getChildren().addAll(lblTipos, scrollTipos, btnsTipos);

        // ==================== ITENS VENCIDOS ====================
        VBox itensSection = new VBox(8);
        Label lblItens = criarLabel("Itens Vencidos Disponíveis");

        VBox itensContainer = new VBox(6);

        ScrollPane scrollItens = new ScrollPane(itensContainer);
        scrollItens.setPrefHeight(150);
        scrollItens.setFitToWidth(true);
        scrollItens.setStyle("-fx-background: transparent; -fx-background-color: transparent; -fx-border-color: #E2E8F0; -fx-border-radius: 4;");

        HBox btnsItens = new HBox(8);
        btnsItens.setAlignment(Pos.CENTER_LEFT);

        Button btnSelecionarTodosItens = new Button("Selecionar Todos");
        btnSelecionarTodosItens.setStyle(criarEstiloBotaoPequeno("#3B82F6"));
        btnSelecionarTodosItens.setOnMouseEntered(e -> btnSelecionarTodosItens.setStyle(criarEstiloBotaoPequenoHover("#2563eb")));
        btnSelecionarTodosItens.setOnMouseExited(e -> btnSelecionarTodosItens.setStyle(criarEstiloBotaoPequeno("#3B82F6")));
        btnSelecionarTodosItens.setOnAction(e -> {
            for (Node node : itensContainer.getChildren()) {
                if (node instanceof CheckBox) ((CheckBox) node).setSelected(true);
            }
        });

        Button btnLimparItens = new Button("Limpar");
        btnLimparItens.setStyle(criarEstiloBotaoPequeno("#64748B"));
        btnLimparItens.setOnMouseEntered(e -> btnLimparItens.setStyle(criarEstiloBotaoPequenoHover("#475569")));
        btnLimparItens.setOnMouseExited(e -> btnLimparItens.setStyle(criarEstiloBotaoPequeno("#64748B")));
        btnLimparItens.setOnAction(e -> {
            for (Node node : itensContainer.getChildren()) {
                if (node instanceof CheckBox) ((CheckBox) node).setSelected(false);
            }
        });

        btnsItens.getChildren().addAll(btnSelecionarTodosItens, btnLimparItens);

        itensSection.getChildren().addAll(lblItens, scrollItens, btnsItens);

        // Atualiza itens quando tipos mudam
        ChangeListener<Boolean> tipoListener = (obs, oldVal, newVal) -> atualizarItensVencidos(itensContainer, checkBoxesTipos, tipos);

        for (CheckBox chk : checkBoxesTipos) {
            chk.selectedProperty().addListener(tipoListener);
        }

        // Campos de encaminhamento
        VBox camposSection = new VBox(8);

        DatePicker dataEnvio = new DatePicker(java.time.LocalDate.now());
        dataEnvio.setPrefWidth(350);
        estilizarDatePicker(dataEnvio);

        DatePicker dataInventario = new DatePicker();
        dataInventario.setPromptText("Data Inventário (opcional)");
        dataInventario.setPrefWidth(350);
        estilizarDatePicker(dataInventario);

        ComboBox<String> comboDestino = new ComboBox<>();
        List<DestinoFinal> destinos = destinoDao.listarDestinos();
        for (DestinoFinal d : destinos) {
            comboDestino.getItems().add(d.getNome());
        }
        comboDestino.setPromptText("Selecione o destino");
        comboDestino.setPrefWidth(350);
        estilizarComboBox(comboDestino);

        // NOVO: ComboBox para selecionar o responsável pelo encaminhamento
        ComboBox<String> comboResponsavel = new ComboBox<>();
        comboResponsavel.setPromptText("Selecione o responsável");
        comboResponsavel.setPrefWidth(350);
        comboResponsavel.setEditable(true);
        estilizarComboBox(comboResponsavel);

        // Carregar nomes dos usuários do sistema
        List<Usuario> usuarios = usuarioController.listarUsuarios();
        ObservableList<String> nomesUsuarios = FXCollections.observableArrayList();
        for (Usuario usuario : usuarios) {
            nomesUsuarios.add(usuario.getNome());
        }
        comboResponsavel.setItems(nomesUsuarios);

        // Adicionar filtro de busca na ComboBox
        comboResponsavel.getEditor().textProperty().addListener((obs, oldValue, newValue) -> {
            if (newValue == null || newValue.isEmpty()) {
                comboResponsavel.setItems(nomesUsuarios);
                return;
            }

            ObservableList<String> filtrados = FXCollections.observableArrayList();
            for (String nome : nomesUsuarios) {
                if (nome.toLowerCase().contains(newValue.toLowerCase())) {
                    filtrados.add(nome);
                }
            }
            comboResponsavel.setItems(filtrados);
            comboResponsavel.show();
        });

        GridPane camposGrid = new GridPane();
        camposGrid.setHgap(8);
        camposGrid.setVgap(10);
        camposGrid.setAlignment(Pos.CENTER);

        int row = 0;
        camposGrid.add(criarLabel("Data Envio:"), 0, row);
        camposGrid.add(dataEnvio, 1, row++);

        camposGrid.add(criarLabel("Data Inventário:"), 0, row);
        camposGrid.add(dataInventario, 1, row++);

        camposGrid.add(criarLabel("Destino:"), 0, row);
        camposGrid.add(comboDestino, 1, row++);

        // NOVO: Campo Encaminhado por
        camposGrid.add(criarLabel("Encaminhado por:"), 0, row);
        camposGrid.add(comboResponsavel, 1, row++);

        HBox botoes = new HBox(12);
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(5, 0, 0, 0));

        Button btnSalvar = new Button("Encaminhar");
        btnSalvar.setPrefWidth(130);
        btnSalvar.setPrefHeight(35);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> encaminharSelecionados(dialog, itensContainer, dataEnvio, dataInventario, comboDestino, comboResponsavel, destinos));

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(130);
        btnCancelar.setPrefHeight(35);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        content.getChildren().addAll(
                titulo,
                new Separator(),
                tiposSection,
                new Separator(),
                itensSection,
                new Separator(),
                camposGrid,
                botoes
        );

        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle(
                "-fx-background-color: transparent; " +
                        "-fx-border-color: transparent;"
        );
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        root.setCenter(scrollPane);

        Scene scene = new Scene(root, 505, 600);
        dialog.setScene(scene);
        dialog.show();

        // Carregar itens iniciais
        atualizarItensVencidos(itensContainer, checkBoxesTipos, tipos);

        // Aplicar estilo às setas após o diálogo ser mostrado
        javafx.application.Platform.runLater(() -> {
            applyArrowStyle(comboDestino);
            applyArrowStyle(comboResponsavel);
        });
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

    private void atualizarItensVencidos(VBox container, ObservableList<CheckBox> checkBoxesTipos, List<TipoObjeto> tipos) {
        container.getChildren().clear();

        List<Integer> tipoIdsSelecionados = new ArrayList<>();
        for (CheckBox chk : checkBoxesTipos) {
            if (chk.isSelected()) {
                Integer id = (Integer) chk.getUserData();
                if (id != null) tipoIdsSelecionados.add(id);
            }
        }

        if (tipoIdsSelecionados.isEmpty()) {
            Label msg = new Label("Selecione pelo menos um tipo acima.");
            msg.setStyle("-fx-text-fill: #64748B; -fx-padding: 8 0; -fx-font-size: 12px;");
            container.getChildren().add(msg);
            return;
        }

        List<ItemPerdido> vencidos = itemPerdidoController.listarItensPendentesPorTipos(tipoIdsSelecionados)
                .stream()
                .filter(i -> i.getSituacaoId() == 3)
                .collect(Collectors.toList());

        if (vencidos.isEmpty()) {
            Label msg = new Label("Nenhum item vencido encontrado.");
            msg.setStyle("-fx-text-fill: #64748B; -fx-padding: 8 0; -fx-font-size: 12px;");
            container.getChildren().add(msg);
            return;
        }

        for (ItemPerdido item : vencidos) {
            String estado = item.getEstadoConservacao() != null ? item.getEstadoConservacao() : "";
            CheckBox chkItem = new CheckBox(
                    "Lacre: " + item.getNumeroLacre() + " - " + item.getNome() +
                            (estado.isEmpty() ? "" : " (" + estado + ")")
            );
            chkItem.setUserData(item);
            chkItem.setWrapText(true);
            chkItem.setPrefWidth(350);
            chkItem.setStyle("-fx-text-fill: #334155; -fx-font-size: 12px;");
            container.getChildren().add(chkItem);
        }
    }

    private void encaminharSelecionados(Stage dialog, VBox itensContainer, DatePicker dataEnvio,
                                        DatePicker dataInventario, ComboBox<String> comboDestino,
                                        ComboBox<String> comboResponsavel, List<DestinoFinal> destinos) {
        List<ItemPerdido> selecionados = new ArrayList<>();

        for (Node node : itensContainer.getChildren()) {
            if (node instanceof CheckBox) {
                CheckBox chk = (CheckBox) node;
                if (chk.isSelected()) {
                    ItemPerdido item = (ItemPerdido) chk.getUserData();
                    if (item != null) selecionados.add(item);
                }
            }
        }

        if (selecionados.isEmpty()) {
            mostrarAlerta("Erro", "Selecione pelo menos um item.", Alert.AlertType.ERROR);
            return;
        }

        String destinoNome = comboDestino.getValue();
        if (destinoNome == null) {
            mostrarAlerta("Erro", "Selecione o destino.", Alert.AlertType.ERROR);
            return;
        }

        String responsavel = comboResponsavel.getValue();
        if (responsavel == null || responsavel.isEmpty()) {
            responsavel = "Não informado";
        }

        int destinoId = destinos.stream()
                .filter(d -> d.getNome().equals(destinoNome))
                .findFirst()
                .map(DestinoFinal::getId)
                .orElse(-1);

        if (destinoId == -1) {
            mostrarAlerta("Erro", "Destino inválido.", Alert.AlertType.ERROR);
            return;
        }

        Date dtEnvio = java.sql.Date.valueOf(dataEnvio.getValue());
        Date dtInventario = dataInventario.getValue() != null ? java.sql.Date.valueOf(dataInventario.getValue()) : null;

        boolean sucesso = true;
        for (ItemPerdido item : selecionados) {
            int resultado = itemDestinadoController.encaminharItem(
                    dtEnvio, dtInventario, item.getId(), destinoId, responsavel
            );
            if (resultado <= 0) sucesso = false;
        }

        if (sucesso) {
            mostrarAlerta("Sucesso", selecionados.size() + " itens encaminhados!\nResponsável: " + responsavel, Alert.AlertType.INFORMATION);
            dialog.close();
            carregarEncaminhamentos();
        } else {
            mostrarAlerta("Erro", "Erro ao encaminhar alguns itens.", Alert.AlertType.ERROR);
        }
    }

    private void carregarEncaminhamentos() {
        List<ItemDestinado> encaminhamentos = itemDestinadoController.listarItensDestinados();
        ObservableList<EncaminhamentoTabela> dados = FXCollections.observableArrayList();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        for (ItemDestinado enc : encaminhamentos) {
            String dataInv = enc.getDataInventario() != null ? sdf.format(enc.getDataInventario()) : "-";

            ItemPerdido item = itemPerdidoController.buscarItemPorId(enc.getItemId());

            String lacreItem = (item != null) ? String.valueOf(item.getNumeroLacre()) : "Item desconhecido";

            DestinoFinal destino = destinoDao.buscarPorId(enc.getDestinoId());
            String nomeDestino = (destino != null) ? destino.getNome() : "Destino desconhecido";

            String responsavel = enc.getResponsavelEncaminhamento() != null ? enc.getResponsavelEncaminhamento() : "Não informado";

            EncaminhamentoTabela et = new EncaminhamentoTabela(
                    sdf.format(enc.getDataEnvio()),
                    dataInv,
                    lacreItem,
                    nomeDestino,
                    responsavel
            );
            dados.add(et);
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

    public static class EncaminhamentoTabela {
        private String dataEnvio;
        private String dataInventario;
        private String item;
        private String destino;
        private String responsavel;

        public EncaminhamentoTabela(String dataEnvio, String dataInventario, String item, String destino, String responsavel) {
            this.dataEnvio = dataEnvio;
            this.dataInventario = dataInventario;
            this.item = item;
            this.destino = destino;
            this.responsavel = responsavel;
        }

        public String getDataEnvio() { return dataEnvio; }
        public String getDataInventario() { return dataInventario; }
        public String getItem() { return item; }
        public String getDestino() { return destino; }
        public String getResponsavel() { return responsavel; }
    }
}