package view;

import controller.EntregaController;
import controller.ItemPerdidoController;
import controller.RequisicaoClienteController;
import controller.UsuarioController;
import dao.ProprietarioDao;
import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.scene.control.TextFormatter;
import javafx.util.converter.DefaultStringConverter;
import java.util.function.UnaryOperator;
import model.Entrega;
import model.ItemPerdido;
import model.Proprietario;
import model.RequisicaoCliente;
import model.Usuario;
import report.TermoEntregaDTO;
import report.TermoEntregaPDF;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.awt.Desktop;

public class TelaEntrega extends Application {
    private int usuarioId;
    private EntregaController entregaController;
    private ItemPerdidoController itemPerdidoController;
    private RequisicaoClienteController requisicaoController;
    private UsuarioController usuarioController;
    private ProprietarioDao proprietarioDao = new ProprietarioDao();
    private TableView<EntregaTabela> tabelaEntregas;

    // NOVO: Campos que precisam ser acessíveis em toda a classe
    private ComboBox<String> comboItem;
    private ComboBox<String> comboRequisicao;
    private ComboBox<String> comboTipo;
    private TextField campoNome;
    private TextField campoTelefone;
    private TextField campoCpf;
    private TextField campoRg;
    private File arquivoFotoCondicao;
    private ImageView previewFotoCondicao;
    private java.util.Map<String, ItemPerdido> mapaItens;
    private java.util.Map<String, Integer> mapaRequisicoes;

    // Controle para evitar múltiplas janelas abertas
    private static Stage telaEntregaStage = null;

    // NOVO: Item para pré-selecionar (estático para passar entre janelas)
    private static ItemPerdido itemParaPreSelecionar = null;

    public TelaEntrega(int usuarioId) {
        this.usuarioId = usuarioId;
        this.entregaController = new EntregaController();
        this.itemPerdidoController = new ItemPerdidoController();
        this.requisicaoController = new RequisicaoClienteController();
        this.usuarioController = new UsuarioController();
    }

    /**
     * Método estático para abrir a tela de entregas de forma segura.
     * Se já estiver aberta, foca na janela existente.
     * @param owner Janela pai (para initOwner)
     * @param usuarioId ID do usuário logado
     */
    public static void abrirTelaEntrega(Stage owner, int usuarioId) {
        // Limpar item pré-selecionado
        itemParaPreSelecionar = null;
        abrirTelaEntregaInterno(owner, usuarioId);
    }

    /**
     * NOVO: Abre a tela de entregas com um item específico pré-selecionado
     */
    public static void abrirTelaEntregaComItem(Stage owner, int usuarioId, ItemPerdido item) {
        itemParaPreSelecionar = item;
        abrirTelaEntregaInterno(owner, usuarioId);
    }

    /**
     * Método interno que faz a abertura da tela
     */
    private static void abrirTelaEntregaInterno(Stage owner, int usuarioId) {
        if (telaEntregaStage != null && telaEntregaStage.isShowing()) {
            telaEntregaStage.toFront();
            telaEntregaStage.requestFocus();

            // Se tem item para pré-selecionar, tenta encontrar a instância da tela
            if (itemParaPreSelecionar != null) {
                // Não temos acesso direto à instância, então usamos o evento
                // A tela já vai verificar o itemParaPreSelecionar no start
            }
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.NONE);

        try {
            TelaEntrega telaEntrega = new TelaEntrega(usuarioId);
            telaEntrega.start(novaStage);
            telaEntregaStage = novaStage;

            novaStage.setOnHidden(event -> {
                telaEntregaStage = null;
                itemParaPreSelecionar = null; // Limpar ao fechar
            });
            novaStage.setOnCloseRequest(event -> {
                telaEntregaStage = null;
                itemParaPreSelecionar = null;
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Entregas de Itens");
        util.IconeUtil.aplicarIcone(stage);

        // NOVO: Inicializar os mapas
        mapaItens = new java.util.HashMap<>();
        mapaRequisicoes = new java.util.HashMap<>();

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox centerContent = criarConteudoCentral(stage);
        root.setCenter(centerContent);

        Scene scene = new Scene(root, 1110, 600);
        stage.setScene(scene);
        stage.setMinWidth(900);
        stage.setMinHeight(500);
        stage.show();

        carregarEntregas();
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(15);
        conteudo.setPadding(new Insets(15, 20, 20, 20));
        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Registro de Entregas");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        HBox painelSuperior = new HBox(15);
        painelSuperior.setAlignment(Pos.CENTER_LEFT);
        painelSuperior.setPadding(new Insets(5, 0, 5, 0));

        Button btnNovaEntrega = criarBotaoAcao("+ Nova Entrega", "#10b981");
        btnNovaEntrega.setOnAction(e -> abrirDialogoNovaEntrega(stage));

        Button btnAtualizar = criarBotaoAcao("Atualizar", "#3B82F6");
        btnAtualizar.setOnAction(e -> carregarEntregas());

        painelSuperior.getChildren().addAll(btnNovaEntrega, btnAtualizar);

        tabelaEntregas = criarTabelaEntregas();
        VBox.setVgrow(tabelaEntregas, Priority.ALWAYS);

        conteudo.getChildren().addAll(titulo, painelSuperior, tabelaEntregas);
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

        String corHover = cor.equals("#10b981") ? "#059669" :
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

    private TableView<EntregaTabela> criarTabelaEntregas() {
        TableView<EntregaTabela> table = new TableView<>();
        table.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 5);"
        );

        table.setStyle(table.getStyle() +
                "-fx-font-family: 'Segoe UI'; " +
                "-fx-font-size: 12px;"
        );

        table.setFixedCellSize(35);

        table.setRowFactory(tv -> {
            TableRow<EntregaTabela> row = new TableRow<>();
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

        TableColumn<EntregaTabela, String> colData = new TableColumn<>("Data");
        colData.setCellValueFactory(new PropertyValueFactory<>("dataEntrega"));
        colData.setPrefWidth(80);
        colData.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colCodigo = new TableColumn<>("Código");
        colCodigo.setCellValueFactory(new PropertyValueFactory<>("codigo"));
        colCodigo.setPrefWidth(80);
        colCodigo.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #1E3A8A; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colProprietario = new TableColumn<>("Proprietário");
        colProprietario.setCellValueFactory(new PropertyValueFactory<>("proprietario"));
        colProprietario.setPrefWidth(170);
        colProprietario.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-font-weight: 600; -fx-text-fill: #0f172a; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colTelefone = new TableColumn<>("Telefone");
        colTelefone.setCellValueFactory(new PropertyValueFactory<>("telefone"));
        colTelefone.setPrefWidth(120);
        colTelefone.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colCpf = new TableColumn<>("CPF");
        colCpf.setCellValueFactory(new PropertyValueFactory<>("cpf"));
        colCpf.setPrefWidth(120);
        colCpf.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colRg = new TableColumn<>("RG");
        colRg.setCellValueFactory(new PropertyValueFactory<>("rg"));
        colRg.setPrefWidth(100);
        colRg.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colItem = new TableColumn<>("Item");
        colItem.setCellValueFactory(new PropertyValueFactory<>("item"));
        colItem.setPrefWidth(180);
        colItem.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                }
            }
        });

        TableColumn<EntregaTabela, String> colTipo = new TableColumn<>("Tipo");
        colTipo.setCellValueFactory(new PropertyValueFactory<>("tipoRegistro"));
        colTipo.setPrefWidth(200);
        colTipo.setCellFactory(column -> new TableCell<EntregaTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4;");
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
                            "-fx-font-size: 12px;"
            );
        });

        table.getColumns().addAll(
                colData, colCodigo, colProprietario,
                colTelefone, colCpf, colRg,
                colItem, colTipo
        );

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

    private Label criarLabel(String texto, String style) {
        Label label = new Label(texto);
        label.setStyle(style);
        return label;
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
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 8, 0, 0, 3);",
                cor
        );
    }

    private String criarEstiloBotaoSecundario(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 12; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 12px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private TextField criarCampoTelefone() {
        TextField campo = new TextField();
        campo.setPromptText("Telefone");
        campo.setPrefWidth(280);
        campo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;"
        );

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

    private TextField criarCampoCPF() {
        TextField campo = new TextField();
        campo.setPromptText("CPF");
        campo.setPrefWidth(280);
        campo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;"
        );

        UnaryOperator<TextFormatter.Change> cpfFilter = change -> {
            String newText = change.getControlNewText();
            if (newText.isEmpty()) {
                return change;
            }

            String digits = newText.replaceAll("[^0-9]", "");

            if (digits.length() > 11) {
                return null;
            }

            StringBuilder formatted = new StringBuilder();
            for (int i = 0; i < digits.length(); i++) {
                if (i == 3 || i == 6) {
                    formatted.append(".");
                } else if (i == 9) {
                    formatted.append("-");
                }
                formatted.append(digits.charAt(i));
            }

            change.setText(formatted.toString());
            change.setRange(0, change.getControlText().length());
            change.setCaretPosition(formatted.length());
            change.setAnchor(formatted.length());
            return change;
        };

        campo.setTextFormatter(new TextFormatter<>(new DefaultStringConverter(), "", cpfFilter));
        return campo;
    }

    private TextField criarCampoRG() {
        TextField campo = new TextField();
        campo.setPromptText("RG");
        campo.setPrefWidth(280);
        campo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;"
        );

        UnaryOperator<TextFormatter.Change> rgFilter = change -> {
            String newText = change.getControlNewText();
            if (newText.isEmpty()) {
                return change;
            }

            String digits = newText.replaceAll("[^0-9]", "");

            if (digits.length() > 9) {
                return null;
            }

            StringBuilder formatted = new StringBuilder();
            for (int i = 0; i < digits.length(); i++) {
                if (i == 2 || i == 5) {
                    formatted.append(".");
                } else if (i == 8) {
                    formatted.append("-");
                }
                formatted.append(digits.charAt(i));
            }

            change.setText(formatted.toString());
            change.setRange(0, change.getControlText().length());
            change.setCaretPosition(formatted.length());
            change.setAnchor(formatted.length());
            return change;
        };

        campo.setTextFormatter(new TextFormatter<>(new DefaultStringConverter(), "", rgFilter));
        return campo;
    }

    private void abrirDialogoNovaEntrega(Stage parentStage) {
        Stage dialog = new Stage();
        dialog.setTitle("Nova Entrega");
        util.IconeUtil.aplicarIcone(dialog);
        dialog.initOwner(parentStage);
        dialog.initModality(Modality.WINDOW_MODAL);

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox content = new VBox(12);
        content.setPadding(new Insets(15, 15, 15, 15));
        content.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label tituloDialog = new Label("Nova Entrega");
        tituloDialog.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane grid = new GridPane();
        grid.setHgap(8);
        grid.setVgap(10);
        grid.setAlignment(Pos.CENTER);

        String labelStyle = "-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;";

        // MODIFICADO: comboItem agora é campo da classe
        comboTipo = new ComboBox<>();
        comboTipo.getItems().addAll("Procedimento padrão", "Registro adicional de evidência");
        comboTipo.setValue("Procedimento padrão");
        comboTipo.setPrefWidth(260);
        estilizarComboBox(comboTipo);

        campoNome = new TextField();
        campoNome.setPromptText("Nome do proprietário");
        campoNome.setPrefWidth(260);
        campoNome.setStyle(
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " +
                        "-fx-font-size: 12px;"
        );

        campoTelefone = criarCampoTelefone();
        campoCpf = criarCampoCPF();
        campoRg = criarCampoRG();

        // MODIFICADO: comboItem agora é campo da classe
        comboItem = new ComboBox<>();
        comboItem.setEditable(true);
        comboItem.setPromptText("Selecione o item");
        comboItem.setPrefWidth(260);
        estilizarComboBox(comboItem);

        List<ItemPerdido> itens = itemPerdidoController.listarItens();
        ObservableList<String> itensOriginais = FXCollections.observableArrayList();
        mapaItens.clear(); // Limpar mapa antes de preencher

        for (ItemPerdido item : itens) {
            if (item.getSituacaoId() != 4 && item.getSituacaoId() != 5) {
                String texto = item.getNumeroRegistro() + " - " + item.getNome() + " (Lacre: " + item.getNumeroLacre() + ")";
                itensOriginais.add(texto);
                mapaItens.put(texto, item);
            }
        }

        comboItem.setItems(itensOriginais);

        comboItem.getEditor().textProperty().addListener((obs, oldValue, newValue) -> {
            if (newValue == null || newValue.isEmpty()) {
                comboItem.setItems(itensOriginais);
                return;
            }

            ObservableList<String> filtrados = FXCollections.observableArrayList();
            for (String item : itensOriginais) {
                if (item.toLowerCase().contains(newValue.toLowerCase())) {
                    filtrados.add(item);
                }
            }

            comboItem.setItems(filtrados);
            comboItem.show();
        });

        // MODIFICADO: comboRequisicao agora é campo da classe
        comboRequisicao = new ComboBox<>();
        comboRequisicao.setEditable(true);
        comboRequisicao.setPromptText("Selecione a requisição");
        comboRequisicao.setPrefWidth(260);
        estilizarComboBox(comboRequisicao);

        List<RequisicaoCliente> pendentes = requisicaoController.listarRequisicoesPendentes();
        ObservableList<String> requisicoesOriginais = FXCollections.observableArrayList();
        mapaRequisicoes.clear(); // Limpar mapa antes de preencher

        for (RequisicaoCliente req : pendentes) {
            String texto = req.getNomeCliente() + " - " + req.getDescricao() +
                    " (Tel: " + req.getTelefone() + ")";
            requisicoesOriginais.add(texto);
            mapaRequisicoes.put(texto, req.getId());
        }

        comboRequisicao.setItems(requisicoesOriginais);

        comboRequisicao.getEditor().textProperty().addListener((obs, oldValue, newValue) -> {
            if (newValue == null || newValue.isEmpty()) {
                comboRequisicao.setItems(requisicoesOriginais);
                return;
            }

            ObservableList<String> filtrados = FXCollections.observableArrayList();
            for (String req : requisicoesOriginais) {
                if (req.toLowerCase().contains(newValue.toLowerCase())) {
                    filtrados.add(req);
                }
            }

            comboRequisicao.setItems(filtrados);
            comboRequisicao.show();
        });

        Button btnFotoCondicao = new Button("Selecionar foto");
        btnFotoCondicao.setPrefWidth(260);
        btnFotoCondicao.setStyle(criarEstiloBotaoSecundario("#3B82F6"));
        btnFotoCondicao.setOnAction(e -> selecionarFotoCondicao());

        previewFotoCondicao = new ImageView();
        previewFotoCondicao.setFitWidth(150);
        previewFotoCondicao.setFitHeight(120);
        previewFotoCondicao.setPreserveRatio(true);
        previewFotoCondicao.setStyle("-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 5);");

        Button btnGerarTermo = new Button("📄 Gerar Termo");
        btnGerarTermo.setPrefWidth(260);
        btnGerarTermo.setStyle(criarEstiloBotaoSecundario("#8B5CF6"));
        btnGerarTermo.setOnAction(e -> gerarTermoAntesDaEntrega(
                campoNome.getText().trim(),
                campoTelefone.getText().trim(),
                campoCpf.getText().trim(),
                campoRg.getText().trim(),
                comboItem.getValue(),
                comboTipo.getValue(),
                mapaItens,
                arquivoFotoCondicao
        ));

        int row = 0;
        grid.add(criarLabel("Tipo:", labelStyle), 0, row);
        grid.add(comboTipo, 1, row++);

        grid.add(criarLabel("Nome:", labelStyle), 0, row);
        grid.add(campoNome, 1, row++);

        grid.add(criarLabel("Telefone:", labelStyle), 0, row);
        grid.add(campoTelefone, 1, row++);

        grid.add(criarLabel("CPF:", labelStyle), 0, row);
        grid.add(campoCpf, 1, row++);

        grid.add(criarLabel("RG:", labelStyle), 0, row);
        grid.add(campoRg, 1, row++);

        grid.add(criarLabel("Item:", labelStyle), 0, row);
        grid.add(comboItem, 1, row++);

        grid.add(criarLabel("Requisição:", labelStyle), 0, row);
        grid.add(comboRequisicao, 1, row++);

        grid.add(criarLabel("Foto:", labelStyle), 0, row);
        grid.add(btnFotoCondicao, 1, row++);

        grid.add(previewFotoCondicao, 1, row++);

        Separator separator = new Separator();
        separator.setPrefWidth(260);
        separator.setStyle("-fx-background-color: #E2E8F0;");
        grid.add(separator, 1, row++);

        grid.add(criarLabel("Termo:", labelStyle), 0, row);
        grid.add(btnGerarTermo, 1, row++);

        HBox botoes = new HBox(12);
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(10, 0, 0, 0));

        Button btnSalvar = new Button("Registrar");
        btnSalvar.setPrefWidth(130);
        btnSalvar.setPrefHeight(40);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));

        btnSalvar.setOnAction(e -> {
            try {
                String nome = campoNome.getText().trim();
                String telefone = campoTelefone.getText().trim();
                String cpf = campoCpf.getText().trim();
                String rg = campoRg.getText().trim();
                String itemSel = comboItem.getValue();
                String tipo = comboTipo.getValue();
                String reqSel = comboRequisicao.getValue();

                if (nome.isEmpty() || telefone.isEmpty() || itemSel == null) {
                    mostrarAlerta("Erro", "Preencha todos os campos obrigatórios", Alert.AlertType.ERROR);
                    return;
                }

                String numeroRegistroStr = itemSel.split(" - ")[0].trim();
                int numeroRegistro = Integer.parseInt(numeroRegistroStr);

                int itemId = itemPerdidoController.getItemIdPorNumeroRegistro(numeroRegistro);

                if (itemId <= 0) {
                    mostrarAlerta("Erro", "Item não encontrado para o número de registro selecionado.", Alert.AlertType.ERROR);
                    return;
                }

                int entregaId = entregaController.registrarEntrega(
                        new Date(), tipo, nome, telefone, cpf, rg, itemId, usuarioId
                );

                if (entregaId > 0) {
                    if (arquivoFotoCondicao != null) {
                        try {
                            String caminhoFoto = salvarFotoCondicao(arquivoFotoCondicao);
                            entregaController.salvarFotoEntrega(entregaId, caminhoFoto);
                        } catch (IOException ex) {
                            mostrarAlerta("Aviso", "Entrega registrada, mas falha ao salvar foto.", Alert.AlertType.WARNING);
                        }
                    }

                    if (reqSel != null && !reqSel.isEmpty()) {
                        Integer requisicaoId = mapaRequisicoes.get(reqSel);
                        if (requisicaoId != null && requisicaoId > 0) {
                            boolean sucesso = requisicaoController.associarItemEncontrado(requisicaoId, itemId);
                            if (sucesso) {
                                mostrarAlerta("Sucesso", "Entrega registrada!\nItem associado à requisição selecionada.", Alert.AlertType.INFORMATION);
                            } else {
                                mostrarAlerta("Aviso", "Entrega registrada, mas falha ao associar à requisição.", Alert.AlertType.WARNING);
                            }
                        }
                    } else {
                        mostrarAlerta("Sucesso", "Entrega registrada com sucesso!", Alert.AlertType.INFORMATION);
                    }

                    dialog.close();
                    carregarEntregas();
                } else {
                    mostrarAlerta("Erro", "Erro ao registrar entrega", Alert.AlertType.ERROR);
                }
            } catch (Exception ex) {
                mostrarAlerta("Erro", "Erro: " + ex.getMessage(), Alert.AlertType.ERROR);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(130);
        btnCancelar.setPrefHeight(40);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        content.getChildren().addAll(tituloDialog, grid, botoes);

        ScrollPane scrollPane = new ScrollPane(content);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle(
                "-fx-background-color: transparent; " +
                        "-fx-border-color: transparent;"
        );
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        root.setCenter(scrollPane);

        Scene scene = new Scene(root, 480, 600);
        dialog.setScene(scene);

        // NOVO: Se tiver item para pré-selecionar, faz isso depois que o diálogo for mostrado
        dialog.setOnShown(event -> {
            if (itemParaPreSelecionar != null) {
                preSelecionarItem(itemParaPreSelecionar);
                // Limpar após usar para não atrapalhar próximas aberturas
                itemParaPreSelecionar = null;
            }
        });

        dialog.show();

        javafx.application.Platform.runLater(() -> {
            applyArrowStyle(comboTipo);
            applyArrowStyle(comboItem);
            applyArrowStyle(comboRequisicao);
        });
    }

    /**
     * NOVO: Método para pré-selecionar um item na comboBox
     */
    public void preSelecionarItem(ItemPerdido item) {
        javafx.application.Platform.runLater(() -> {
            if (comboItem != null && item != null) {
                String texto = item.getNumeroRegistro() + " - " + item.getNome() +
                        " (Lacre: " + item.getNumeroLacre() + ")";

                // Verificar se o texto existe na comboBox
                boolean encontrado = false;
                for (String itemTexto : comboItem.getItems()) {
                    if (itemTexto.equals(texto)) {
                        comboItem.setValue(texto);
                        encontrado = true;
                        break;
                    }
                }

                if (!encontrado) {
                    // Se não encontrar exato, tenta buscar por número de registro
                    String numeroStr = String.valueOf(item.getNumeroRegistro());
                    for (String itemTexto : comboItem.getItems()) {
                        if (itemTexto.startsWith(numeroStr + " -")) {
                            comboItem.setValue(itemTexto);
                            encontrado = true;
                            break;
                        }
                    }
                }

                if (encontrado) {
                    // Opcional: destacar ou dar foco
                    comboItem.requestFocus();

                    // Rolar para o item (se possível)
                    comboItem.show();
                    javafx.application.Platform.runLater(() -> comboItem.hide());
                }
            }
        });
    }

    private void gerarTermoAntesDaEntrega(String nome, String telefone, String cpf, String rg,
                                          String itemSelecionado, String tipoRegistro,
                                          java.util.Map<String, ItemPerdido> mapaItens,
                                          File fotoSelecionada) {

        if (nome.isEmpty() || telefone.isEmpty() || itemSelecionado == null) {
            mostrarAlerta("Atenção", "Preencha os campos obrigatórios (Nome, Telefone e Item) antes de gerar o termo.", Alert.AlertType.WARNING);
            return;
        }

        try {
            ItemPerdido item = mapaItens.get(itemSelecionado);
            if (item == null) {
                mostrarAlerta("Erro", "Item não encontrado.", Alert.AlertType.ERROR);
                return;
            }

            Entrega entregaTemp = new Entrega();
            entregaTemp.setCodigoAutenticacao("PRE-ENTREGA-" + new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
            entregaTemp.setDataEntrega(new Date());
            entregaTemp.setTipoRegistro(tipoRegistro);
            entregaTemp.setItemId(item.getId());
            entregaTemp.setUsuarioId(usuarioId);

            Proprietario proprietarioTemp = new Proprietario();
            proprietarioTemp.setNome(nome);
            proprietarioTemp.setTelefone(telefone);
            proprietarioTemp.setCpf(cpf.isEmpty() ? null : cpf);
            proprietarioTemp.setRg(rg.isEmpty() ? null : rg);

            Usuario usuario = usuarioController.buscarPorId(usuarioId);
            if (usuario == null) {
                mostrarAlerta("Erro", "Usuário responsável não encontrado.", Alert.AlertType.ERROR);
                return;
            }

            TermoEntregaDTO dados = new TermoEntregaDTO(entregaTemp, item, proprietarioTemp, usuario);

            if (fotoSelecionada != null) {
                String caminhoFotoTemp = salvarFotoTemporaria(fotoSelecionada);
                dados.setCaminhoFotoEntrega(caminhoFotoTemp);
            }

            FileChooser fileChooser = new FileChooser();
            fileChooser.setTitle("Salvar Termo de Entrega");
            fileChooser.getExtensionFilters().add(
                    new FileChooser.ExtensionFilter("Arquivo PDF", "*.pdf")
            );
            fileChooser.setInitialFileName("termo_pre_entrega_" + item.getNumeroRegistro() + ".pdf");

            File arquivo = fileChooser.showSaveDialog(getStage());

            if (arquivo != null) {
                TermoEntregaPDF gerador = new TermoEntregaPDF();
                gerador.gerarTermo(dados, arquivo.getAbsolutePath());

                mostrarAlerta("Sucesso", "Termo de entrega gerado com sucesso!\nAgora você pode imprimir para o cliente assinar.", Alert.AlertType.INFORMATION);

                try {
                    Desktop.getDesktop().open(arquivo);
                } catch (Exception ex) {
                    mostrarAlerta("Arquivo salvo", "Arquivo salvo em:\n" + arquivo.getAbsolutePath(), Alert.AlertType.INFORMATION);
                }
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            mostrarAlerta("Erro", "Erro ao gerar termo: " + ex.getMessage(), Alert.AlertType.ERROR);
        }
    }

    private String salvarFotoTemporaria(File arquivo) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nomeArquivo = "temp_" + timestamp + "_" + arquivo.getName();

        Path pasta = Paths.get("src", "imagens", "temp");
        if (!Files.exists(pasta)) {
            Files.createDirectories(pasta);
        }

        Path destino = pasta.resolve(nomeArquivo);
        Files.copy(arquivo.toPath(), destino, StandardCopyOption.REPLACE_EXISTING);

        return destino.toString();
    }

    private void selecionarFotoCondicao() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Imagens", "*.png", "*.jpg", "*.jpeg")
        );
        arquivoFotoCondicao = fileChooser.showOpenDialog(null);

        if (arquivoFotoCondicao != null) {
            try {
                Image img = new Image(arquivoFotoCondicao.toURI().toString());
                previewFotoCondicao.setImage(img);
            } catch (Exception e) {
                mostrarAlerta("Erro", "Não foi possível carregar a foto da condição.", Alert.AlertType.ERROR);
            }
        }
    }

    private String salvarFotoCondicao(File arquivo) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nomeArquivo = timestamp + "_" + arquivo.getName();

        Path pasta = Paths.get("src", "imagens", "entregas");
        if (!Files.exists(pasta)) {
            Files.createDirectories(pasta);
        }

        Path destino = pasta.resolve(nomeArquivo);
        Files.copy(arquivo.toPath(), destino, StandardCopyOption.REPLACE_EXISTING);

        return "imagens/entregas/" + nomeArquivo;
    }

    private void carregarEntregas() {
        List<Entrega> entregas = entregaController.listarEntregas();
        ObservableList<EntregaTabela> dados = FXCollections.observableArrayList();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        for (Entrega e : entregas) {
            Proprietario proprietario = proprietarioDao.buscarPorId(e.getProprietarioId());
            String nomeProprietario = (proprietario != null) ? proprietario.getNome() : "Proprietário desconhecido";
            String telefone = (proprietario != null && proprietario.getTelefone() != null) ? proprietario.getTelefone() : "";
            String cpf = (proprietario != null && proprietario.getCpf() != null) ? proprietario.getCpf() : "";
            String rg = (proprietario != null && proprietario.getRg() != null) ? proprietario.getRg() : "";

            ItemPerdido item = itemPerdidoController.buscarItemPorId(e.getItemId());

            // MODIFICADO: Agora mostra o número do lacre em vez do nome do item
            String lacreItem = (item != null) ? String.valueOf(item.getNumeroLacre()) : "Item desconhecido";

            EntregaTabela et = new EntregaTabela(
                    sdf.format(e.getDataEntrega()),
                    e.getCodigoAutenticacao(),
                    nomeProprietario,
                    telefone,
                    cpf,
                    rg,
                    lacreItem,
                    e.getTipoRegistro()
            );
            dados.add(et);
        }

        tabelaEntregas.setItems(dados);
    }

    private Stage getStage() {
        return (Stage) tabelaEntregas.getScene().getWindow();
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

    public static class EntregaTabela {
        private String dataEntrega;
        private String codigo;
        private String proprietario;
        private String telefone;
        private String cpf;
        private String rg;
        private String item;
        private String tipoRegistro;

        public EntregaTabela(String dataEntrega, String codigo, String proprietario,
                             String telefone, String cpf, String rg,
                             String item, String tipoRegistro) {
            this.dataEntrega = dataEntrega;
            this.codigo = codigo;
            this.proprietario = proprietario;
            this.telefone = telefone;
            this.cpf = cpf;
            this.rg = rg;
            this.item = item;
            this.tipoRegistro = tipoRegistro;
        }

        public String getDataEntrega() { return dataEntrega; }
        public String getCodigo() { return codigo; }
        public String getProprietario() { return proprietario; }
        public String getTelefone() { return telefone; }
        public String getCpf() { return cpf; }
        public String getRg() { return rg; }
        public String getItem() { return item; }
        public String getTipoRegistro() { return tipoRegistro; }
    }
}