package view;

import controller.ItemPerdidoController;
import controller.RequisicaoClienteController;
import dao.*;
import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;
import model.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class CadastroItem extends Application {
    private int usuarioId;
    private ItemPerdidoController itemPerdidoController;
    private RequisicaoClienteController requisicaoController;
    private CaixaArmazenamentoDao caixaArmazenamentoDao;
    private LocalShoppingDao localShoppingDao;
    private TipoObjetoDao tipoObjetoDao;
    private List<CaixaArmazenamento> caixas;
    private List<LocalShopping> locais;
    private List<TipoObjeto> tipos;

    private File arquivoImagemSelecionada;
    private ImageView previewImagem;

    private ComboBox<String> comboLocal;
    private ComboBox<String> comboCategoria;
    private ComboBox<String> comboCaixa;

    // Controle para evitar múltiplas janelas abertas
    private static Stage cadastroItemStage = null;

    public CadastroItem(int usuarioId) {
        this.usuarioId = usuarioId;
        this.itemPerdidoController = new ItemPerdidoController();
        this.requisicaoController = new RequisicaoClienteController();
        this.caixaArmazenamentoDao = new CaixaArmazenamentoDao();
        this.localShoppingDao = new LocalShoppingDao();
        this.tipoObjetoDao = new TipoObjetoDao();
    }

    /**
     * Método estático para abrir a janela de cadastro de item.
     * Se já estiver aberta, foca na existente; senão, cria uma nova.
     */
    public static void abrirCadastroItem(Stage owner, int usuarioId) {
        if (cadastroItemStage != null && cadastroItemStage.isShowing()) {
            cadastroItemStage.toFront();
            cadastroItemStage.requestFocus();
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.NONE);

        try {
            new CadastroItem(usuarioId).start(novaStage);
            cadastroItemStage = novaStage;

            novaStage.setOnHidden(event -> {
                cadastroItemStage = null;
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Cadastro de Item");
        util.IconeUtil.aplicarIcone(stage);
        caixas = caixaArmazenamentoDao.listarCaixas();
        locais = localShoppingDao.listarLocais();
        tipos = itemPerdidoController.listarTipos();

        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        // Conteúdo central com scroll
        ScrollPane scrollPane = new ScrollPane(criarConteudoCentral(stage));
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle(
                "-fx-background-color: transparent; " +
                        "-fx-border-color: transparent;"
        );
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        root.setCenter(scrollPane);

        Scene scene = new Scene(root, 550, 650);
        stage.setScene(scene);
        stage.show();
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(12);
        conteudo.setPadding(new Insets(15, 20, 20, 20));
        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        Label titulo = new Label("Cadastrar Item");
        titulo.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        // ComboBox de Tipo de Item
        ComboBox<String> comboTipo = new ComboBox<>();
        comboTipo.getItems().addAll("Genérico", "Eletrônico", "Vestuário");
        comboTipo.setValue("Genérico");
        comboTipo.setPrefWidth(280);
        estilizarComboBox(comboTipo);

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new Insets(15));
        grid.setStyle(
                "-fx-background-color: #F8FAFC; " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        // Labels estilizados
        String labelStyle = "-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;";

        TextField campoNome = new TextField();
        campoNome.setPromptText("Nome do item");
        campoNome.setPrefWidth(280);
        campoNome.setStyle(criarEstiloCampo());

        TextField campoMarca = new TextField();
        campoMarca.setPromptText("Marca");
        campoMarca.setPrefWidth(280);
        campoMarca.setStyle(criarEstiloCampo());

        TextField campoLacre = new TextField();
        campoLacre.setPromptText("Número do lacre");
        campoLacre.setPrefWidth(280);
        campoLacre.setStyle(criarEstiloCampo());

        ComboBox<String> comboEstado = new ComboBox<>();
        comboEstado.getItems().addAll("preservado", "desgastado", "danificado");
        comboEstado.setValue("preservado");
        comboEstado.setPrefWidth(280);
        estilizarComboBox(comboEstado);

        // Combo Local + Botão +
        HBox localBox = new HBox(8);
        localBox.setAlignment(Pos.CENTER_LEFT);

        comboLocal = new ComboBox<>();
        atualizarComboLocal();
        comboLocal.setPromptText("Selecione o local");
        comboLocal.setPrefWidth(240);
        estilizarComboBox(comboLocal);

        Button btnNovoLocal = new Button("+");
        btnNovoLocal.setPrefWidth(30);
        btnNovoLocal.setPrefHeight(30);
        btnNovoLocal.setAlignment(Pos.CENTER);
        btnNovoLocal.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        );
        btnNovoLocal.setOnMouseEntered(e -> btnNovoLocal.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovoLocal.setOnMouseExited(e -> btnNovoLocal.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovoLocal.setOnAction(e -> abrirCadastroNovoLocal(stage));
        localBox.getChildren().addAll(comboLocal, btnNovoLocal);

        // Combo Tipo + Botão +
        HBox tipoBox = new HBox(8);
        tipoBox.setAlignment(Pos.CENTER_LEFT);

        comboCategoria = new ComboBox<>();
        atualizarComboTipo();
        comboCategoria.setPromptText("Selecione o tipo");
        comboCategoria.setPrefWidth(240);
        estilizarComboBox(comboCategoria);

        Button btnNovoTipo = new Button("+");
        btnNovoTipo.setPrefWidth(30);
        btnNovoTipo.setPrefHeight(30);
        btnNovoTipo.setAlignment(Pos.CENTER);
        btnNovoTipo.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        );
        btnNovoTipo.setOnMouseEntered(e -> btnNovoTipo.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovoTipo.setOnMouseExited(e -> btnNovoTipo.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovoTipo.setOnAction(e -> abrirCadastroNovoTipo(stage));
        tipoBox.getChildren().addAll(comboCategoria, btnNovoTipo);

        // Combo Caixa + Botão +
        HBox caixaBox = new HBox(8);
        caixaBox.setAlignment(Pos.CENTER_LEFT);

        comboCaixa = new ComboBox<>();
        atualizarComboCaixa();
        comboCaixa.setValue("Nenhuma");
        comboCaixa.setPrefWidth(240);
        estilizarComboBox(comboCaixa);

        Button btnNovaCaixa = new Button("+");
        btnNovaCaixa.setPrefWidth(30);
        btnNovaCaixa.setPrefHeight(30);
        btnNovaCaixa.setAlignment(Pos.CENTER);
        btnNovaCaixa.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        );
        btnNovaCaixa.setOnMouseEntered(e -> btnNovaCaixa.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovaCaixa.setOnMouseExited(e -> btnNovaCaixa.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-font-size: 16px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-background-radius: 4;"
        ));
        btnNovaCaixa.setOnAction(e -> abrirCadastroNovaCaixa(stage));
        caixaBox.getChildren().addAll(comboCaixa, btnNovaCaixa);

        Label labelModelo = new Label("Modelo:");
        labelModelo.setStyle(labelStyle);
        TextField campoModelo = new TextField();
        campoModelo.setPromptText("Modelo");
        campoModelo.setPrefWidth(280);
        campoModelo.setStyle(criarEstiloCampo());

        Label labelCor = new Label("Cor:");
        labelCor.setStyle(labelStyle);
        TextField campoCor = new TextField();
        campoCor.setPromptText("Cor");
        campoCor.setPrefWidth(280);
        campoCor.setStyle(criarEstiloCampo());

        Label labelTamanho = new Label("Tamanho:");
        labelTamanho.setStyle(labelStyle);
        ComboBox<String> comboTamanho = new ComboBox<>();
        comboTamanho.getItems().addAll("PP", "P", "M", "G", "GG");
        comboTamanho.setPrefWidth(280);
        estilizarComboBox(comboTamanho);

        // Campo Nome do Entregador (TextField normal)
        TextField campoNomeEntregador = new TextField();
        campoNomeEntregador.setPromptText("Nome de quem entregou o item");
        campoNomeEntregador.setPrefWidth(280);
        campoNomeEntregador.setStyle(criarEstiloCampo());

        // ComboBox para selecionar o responsável pelo cadastro (com barra de pesquisa)
        final OperadorSelectionUtil.OperadorSelecionado[] operadorSelecionado = new OperadorSelectionUtil.OperadorSelecionado[1];
        ComboBox<String> comboOperador = new ComboBox<>();
        comboOperador.setPromptText("Nome do operador");
        comboOperador.setPrefWidth(240);
        comboOperador.setEditable(true);
        estilizarComboBox(comboOperador);

        Button btnNovoOperador = new Button("+");
        btnNovoOperador.setPrefWidth(30);
        btnNovoOperador.setPrefHeight(30);
        btnNovoOperador.setStyle(criarEstiloBotaoAcao("#1E3A8A"));

        OperadorSelectionUtil.configurar(comboOperador, btnNovoOperador, stage, selecionado -> operadorSelecionado[0] = selecionado);

        HBox operadorBox = new HBox(8, comboOperador, btnNovoOperador);
        operadorBox.setAlignment(Pos.CENTER_LEFT);

        TextArea areaObservacao = new TextArea();
        areaObservacao.setPromptText("Descrição detalhada do objeto");
        areaObservacao.setPrefHeight(80);
        areaObservacao.setPrefWidth(280);
        areaObservacao.setStyle(criarEstiloCampo() + "-fx-padding: 6;");

        labelModelo.setVisible(false);
        campoModelo.setVisible(false);
        labelCor.setVisible(false);
        campoCor.setVisible(false);
        labelTamanho.setVisible(false);
        comboTamanho.setVisible(false);

        comboTipo.setOnAction(e -> {
            String tipo = comboTipo.getValue();
            boolean ehEletronico = "Eletrônico".equals(tipo);
            boolean ehVestuario = "Vestuário".equals(tipo);

            labelModelo.setVisible(ehEletronico);
            campoModelo.setVisible(ehEletronico);

            labelCor.setVisible(ehVestuario);
            campoCor.setVisible(ehVestuario);

            labelTamanho.setVisible(ehVestuario);
            comboTamanho.setVisible(ehVestuario);
        });

        Button btnSelecionarFoto = new Button("Selecionar Foto");
        btnSelecionarFoto.setPrefWidth(280);
        btnSelecionarFoto.setStyle(criarEstiloBotaoAcao("#3B82F6"));
        btnSelecionarFoto.setOnAction(e -> selecionarFoto());

        previewImagem = new ImageView();
        previewImagem.setFitWidth(150);
        previewImagem.setFitHeight(120);
        previewImagem.setPreserveRatio(true);
        previewImagem.setStyle("-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 5);");

        int row = 0;
        grid.add(criarLabel("Tipo de Item:"), 0, row);
        grid.add(comboTipo, 1, row++);

        grid.add(criarLabel("Objeto:"), 0, row);
        grid.add(campoNome, 1, row++);

        grid.add(criarLabel("Marca:"), 0, row);
        grid.add(campoMarca, 1, row++);

        grid.add(criarLabel("Lacre:"), 0, row);
        grid.add(campoLacre, 1, row++);

        grid.add(criarLabel("Estado:"), 0, row);
        grid.add(comboEstado, 1, row++);

        grid.add(criarLabel("Local:"), 0, row);
        grid.add(localBox, 1, row++);

        grid.add(criarLabel("Categoria:"), 0, row);
        grid.add(tipoBox, 1, row++);

        grid.add(criarLabel("Caixa:"), 0, row);
        grid.add(caixaBox, 1, row++);

        // Campo Entregue por (TextField) - acima do Cadastrado por
        grid.add(criarLabel("Entregue por:"), 0, row);
        grid.add(campoNomeEntregador, 1, row++);

        grid.add(criarLabel("Nome do operador:"), 0, row);
        grid.add(operadorBox, 1, row++);

        grid.add(criarLabel("Descrição do Objeto:"), 0, row);
        grid.add(areaObservacao, 1, row++);

        grid.add(labelModelo, 0, row);
        grid.add(campoModelo, 1, row++);

        grid.add(labelCor, 0, row);
        grid.add(campoCor, 1, row++);

        grid.add(labelTamanho, 0, row);
        grid.add(comboTamanho, 1, row++);

        grid.add(criarLabel("Foto:"), 0, row);
        grid.add(btnSelecionarFoto, 1, row++);
        grid.add(previewImagem, 1, row++);

        HBox botoes = new HBox(12);
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(5, 0, 5, 0));

        Button btnSalvar = new Button("Cadastrar");
        btnSalvar.setPrefWidth(130);
        btnSalvar.setPrefHeight(40);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> salvarItem(stage, comboTipo, campoNome, campoMarca, campoLacre, comboEstado,
                areaObservacao, campoNomeEntregador, operadorSelecionado[0], comboLocal, comboCategoria,
                comboCaixa, campoModelo, campoCor, comboTamanho));

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(130);
        btnCancelar.setPrefHeight(40);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> stage.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        conteudo.getChildren().addAll(titulo, grid, botoes);
        return conteudo;
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

    private Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        return label;
    }

    private String criarEstiloBotaoAcao(String cor) {
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

    private String criarEstiloBotaoPrincipal(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 10 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 14px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                cor
        );
    }

    private String criarEstiloBotaoPrincipalHover(String cor) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 10 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 14px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 8, 0, 0, 3);",
                cor
        );
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

        applyArrowStyle(comboBox);

        comboBox.showingProperty().addListener((obs, wasShowing, isShowing) -> {
            if (isShowing) {
                applyArrowStyle(comboBox);
            }
        });
    }

    private void applyArrowStyle(ComboBox<?> comboBox) {
        javafx.application.Platform.runLater(() -> {
            try {
                Node arrowButton = comboBox.lookup(".arrow-button");
                if (arrowButton != null) {
                    arrowButton.setStyle(
                            "-fx-background-color: #1E3A8A; " +
                                    "-fx-background-radius: 0 4 4 0;"
                    );
                }

                Node arrow = comboBox.lookup(".arrow");
                if (arrow != null) {
                    arrow.setStyle(
                            "-fx-background-color: white; " +
                                    "-fx-scale-shape: true;"
                    );
                }
            } catch (Exception e) {
                // Ignorar se não encontrar os elementos ainda
            }
        });
    }

    private void salvarItem(Stage stage, ComboBox<String> comboTipo, TextField campoNome, TextField campoMarca, TextField campoLacre,
                            ComboBox<String> comboEstado, TextArea areaObservacao, TextField campoNomeEntregador,
                            OperadorSelectionUtil.OperadorSelecionado operadorValidado, ComboBox<String> comboLocal, ComboBox<String> comboCategoria,
                            ComboBox<String> comboCaixa, TextField campoModelo, TextField campoCor, ComboBox<String> comboTamanho) {
        try {
            String tipoItem = comboTipo.getValue();
            String nome = campoNome.getText().trim();
            String marca = campoMarca.getText().trim();
            String lacreStr = campoLacre.getText().trim();
            String estado = comboEstado.getValue();
            String observacao = areaObservacao.getText().trim();
            String nomeEntregador = campoNomeEntregador.getText().trim();
            String localSel = comboLocal.getValue();
            String categoriaSel = comboCategoria.getValue();
            String caixaSel = comboCaixa.getValue();

            if (nome.isEmpty() || lacreStr.isEmpty() || localSel == null || categoriaSel == null) {
                mostrarAlerta("Erro", "Preencha todos os campos obrigatórios", Alert.AlertType.ERROR);
                return;
            }

            if (operadorValidado == null) {
                mostrarAlerta("Erro", "Selecione o operador e valide com CPF e assinatura.", Alert.AlertType.ERROR);
                return;
            }

            int usuarioResponsavelId = usuarioId;

            // Se o entregador não foi informado, usa "Não informado"
            if (nomeEntregador.isEmpty()) {
                nomeEntregador = "Não informado";
            }

            int lacre = Integer.parseInt(lacreStr);

            int localId = locais.stream().filter(l -> l.getNome().equals(localSel)).findFirst().get().getId();
            int categoriaId = tipos.stream().filter(t -> t.getNome().equals(categoriaSel)).findFirst().get().getId();
            Integer caixaId = caixaSel.equals("Nenhuma") ? null :
                    caixas.stream()
                            .filter(c -> ("Caixa " + c.getNumero() + " - " + (c.getDescricao() != null ? c.getDescricao() : "Sem descrição")).equals(caixaSel))
                            .findFirst()
                            .map(CaixaArmazenamento::getId)
                            .orElse(null);

            final String categoriaFinal = categoriaSel;
            final String observacaoFinal = observacao;

            List<RequisicaoCliente> requisicoesParecidas = requisicaoController.buscarRequisicoesParecidas(categoriaFinal, observacaoFinal);

            if (!requisicoesParecidas.isEmpty()) {
                Stage alertaStage = new Stage();
                alertaStage.setTitle("Possível Duplicata");
                alertaStage.initOwner(stage);
                alertaStage.initModality(Modality.WINDOW_MODAL);
                alertaStage.setResizable(false);

                VBox alertaRoot = new VBox(20);
                alertaRoot.setPadding(new Insets(20));
                alertaRoot.setStyle(
                        "-fx-background-color: white; " +
                                "-fx-background-radius: 4; " +
                                "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
                );

                Label lblTitulo = new Label("Atenção!");
                lblTitulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

                Label lblMsg = new Label("Foram encontradas " + requisicoesParecidas.size() + " requisições de clientes pendentes que podem ser atendidas por este item.");
                lblMsg.setStyle("-fx-font-size: 14px; -fx-text-fill: #334155; -fx-wrap-text: true;");

                TableView<RequisicaoCliente> tabelaParecidas = new TableView<>();
                tabelaParecidas.setPrefHeight(180);
                tabelaParecidas.setStyle("-fx-background-color: white; -fx-border-color: #E2E8F0; -fx-border-radius: 4;");

                TableColumn<RequisicaoCliente, String> colCliente = new TableColumn<>("Cliente");
                colCliente.setCellValueFactory(cell -> new javafx.beans.property.SimpleStringProperty(cell.getValue().getNomeCliente()));
                colCliente.setPrefWidth(150);

                TableColumn<RequisicaoCliente, String> colTelefone = new TableColumn<>("Telefone");
                colTelefone.setCellValueFactory(cell -> new javafx.beans.property.SimpleStringProperty(cell.getValue().getTelefone()));
                colTelefone.setPrefWidth(120);

                TableColumn<RequisicaoCliente, String> colData = new TableColumn<>("Data");
                colData.setCellValueFactory(cell -> {
                    SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
                    return new javafx.beans.property.SimpleStringProperty(sdf.format(cell.getValue().getDataRequisicao()));
                });
                colData.setPrefWidth(130);

                TableColumn<RequisicaoCliente, String> colDesc = new TableColumn<>("Descrição");
                colDesc.setCellValueFactory(cell -> {
                    String desc = cell.getValue().getDescricao();
                    String descCurta = (desc != null && desc.length() > 60) ? desc.substring(0, 60) + "..." : desc;
                    return new javafx.beans.property.SimpleStringProperty(descCurta != null ? descCurta : "-");
                });
                colDesc.setPrefWidth(220);

                tabelaParecidas.getColumns().addAll(colCliente, colTelefone, colData, colDesc);
                tabelaParecidas.getItems().addAll(requisicoesParecidas);

                Label lblPergunta = new Label("Deseja continuar com o cadastro do item mesmo assim?");
                lblPergunta.setStyle("-fx-font-size: 15px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

                HBox botoesAlerta = new HBox(20);
                botoesAlerta.setAlignment(Pos.CENTER);

                Button btnSim = new Button("Sim, cadastrar mesmo assim");
                btnSim.setStyle(criarEstiloBotaoPrincipal("#DC2626"));
                btnSim.setOnMouseEntered(ev -> btnSim.setStyle(criarEstiloBotaoPrincipalHover("#B91C1C")));
                btnSim.setOnMouseExited(ev -> btnSim.setStyle(criarEstiloBotaoPrincipal("#DC2626")));
                btnSim.setOnAction(ev -> {
                    prosseguirCadastroItem(stage, comboTipo, campoNome, campoMarca, campoLacre, comboEstado, areaObservacao,
                            campoNomeEntregador, usuarioResponsavelId, comboLocal, comboCategoria, comboCaixa,
                            campoModelo, campoCor, comboTamanho, operadorValidado);
                    alertaStage.close();
                });

                Button btnNao = new Button("Não, revisar");
                btnNao.setStyle(criarEstiloBotaoPrincipal("#64748B"));
                btnNao.setOnMouseEntered(ev -> btnNao.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
                btnNao.setOnMouseExited(ev -> btnNao.setStyle(criarEstiloBotaoPrincipal("#64748B")));
                btnNao.setOnAction(ev -> alertaStage.close());

                botoesAlerta.getChildren().addAll(btnSim, btnNao);

                alertaRoot.getChildren().addAll(lblTitulo, lblMsg, tabelaParecidas, lblPergunta, botoesAlerta);

                Scene alertaScene = new Scene(alertaRoot, 700, 550);
                alertaStage.setScene(alertaScene);
                alertaStage.showAndWait();
            } else {
                prosseguirCadastroItem(stage, comboTipo, campoNome, campoMarca, campoLacre, comboEstado, areaObservacao,
                        campoNomeEntregador, usuarioResponsavelId, comboLocal, comboCategoria, comboCaixa,
                        campoModelo, campoCor, comboTamanho, operadorValidado);
            }
        } catch (Exception ex) {
            mostrarAlerta("Erro", "Erro: " + ex.getMessage(), Alert.AlertType.ERROR);
            ex.printStackTrace();
        }
    }

    private void prosseguirCadastroItem(Stage stage, ComboBox<String> comboTipo, TextField campoNome, TextField campoMarca, TextField campoLacre,
                                        ComboBox<String> comboEstado, TextArea areaObservacao, TextField campoNomeEntregador,
                                        int usuarioResponsavelId, ComboBox<String> comboLocal, ComboBox<String> comboCategoria,
                                        ComboBox<String> comboCaixa, TextField campoModelo, TextField campoCor, ComboBox<String> comboTamanho,
                                        OperadorSelectionUtil.OperadorSelecionado operadorValidado) {
        try {
            String tipoItem = comboTipo.getValue();
            String nome = campoNome.getText().trim();
            String marca = campoMarca.getText().trim();
            String lacreStr = campoLacre.getText().trim();
            String estado = comboEstado.getValue();
            String observacao = areaObservacao.getText().trim();
            String nomeEntregador = campoNomeEntregador.getText().trim();
            String localSel = comboLocal.getValue();
            String categoriaSel = comboCategoria.getValue();
            String caixaSel = comboCaixa.getValue();

            int lacre = Integer.parseInt(lacreStr);

            int localId = locais.stream().filter(l -> l.getNome().equals(localSel)).findFirst().get().getId();
            int categoriaId = tipos.stream().filter(t -> t.getNome().equals(categoriaSel)).findFirst().get().getId();
            Integer caixaId = caixaSel.equals("Nenhuma") ? null :
                    caixas.stream()
                            .filter(c -> ("Caixa " + c.getNumero() + " - " + (c.getDescricao() != null ? c.getDescricao() : "Sem descrição")).equals(caixaSel))
                            .findFirst()
                            .map(CaixaArmazenamento::getId)
                            .orElse(null);

            int novoItemId = -1;

            if (tipoItem.equals("Eletrônico")) {
                String modelo = campoModelo.getText().trim();
                if (modelo.isEmpty()) {
                    mostrarAlerta("Erro", "Modelo obrigatório para eletrônicos", Alert.AlertType.ERROR);
                    return;
                }
                novoItemId = itemPerdidoController.cadastrarItemEletronico(
                        nome, marca, lacre, estado, observacao,
                        nomeEntregador, usuarioResponsavelId,
                        localId, categoriaId, caixaId, modelo,
                        operadorValidado.getOperador().getId(), operadorValidado.getAssinatura()
                );
            } else if (tipoItem.equals("Vestuário")) {
                String cor = campoCor.getText().trim();
                String tamanho = comboTamanho.getValue();
                if (cor.isEmpty() || tamanho == null) {
                    mostrarAlerta("Erro", "Cor e tamanho obrigatórios para vestuário", Alert.AlertType.ERROR);
                    return;
                }
                novoItemId = itemPerdidoController.cadastrarItemVestuario(
                        nome, marca, lacre, estado, observacao,
                        nomeEntregador, usuarioResponsavelId,
                        localId, categoriaId, caixaId, cor, tamanho,
                        operadorValidado.getOperador().getId(), operadorValidado.getAssinatura()
                );
            } else {
                novoItemId = itemPerdidoController.cadastrarItemGenerico(
                        nome, marca, lacre, estado, observacao,
                        nomeEntregador, usuarioResponsavelId,
                        localId, categoriaId, caixaId,
                        operadorValidado.getOperador().getId(), operadorValidado.getAssinatura()
                );
            }

            if (novoItemId > 0 && arquivoImagemSelecionada != null) {
                String caminhoImagem = salvarImagemNoDisco(arquivoImagemSelecionada);
                itemPerdidoController.salvarImagemItem(novoItemId, caminhoImagem);
            }

            if (novoItemId > 0) {
                mostrarAlerta("Sucesso", "Item cadastrado!", Alert.AlertType.INFORMATION);
                stage.close();
            } else {
                mostrarAlerta("Erro", "Erro ao cadastrar item", Alert.AlertType.ERROR);
            }
        } catch (Exception ex) {
            mostrarAlerta("Erro", "Erro: " + ex.getMessage(), Alert.AlertType.ERROR);
            ex.printStackTrace();
        }
    }

    private void atualizarComboLocal() {
        locais = localShoppingDao.listarLocais();
        comboLocal.getItems().clear();
        for (LocalShopping l : locais) {
            comboLocal.getItems().add(l.getNome());
        }
    }

    private void atualizarComboTipo() {
        tipos = itemPerdidoController.listarTipos();
        comboCategoria.getItems().clear();
        for (TipoObjeto t : tipos) {
            comboCategoria.getItems().add(t.getNome());
        }
    }

    private void atualizarComboCaixa() {
        caixas = caixaArmazenamentoDao.listarCaixas();
        comboCaixa.getItems().clear();
        comboCaixa.getItems().add("Nenhuma");
        for (CaixaArmazenamento c : caixas) {
            String desc = (c.getDescricao() != null && !c.getDescricao().trim().isEmpty())
                    ? c.getDescricao()
                    : "Sem descrição";
            comboCaixa.getItems().add("Caixa " + c.getNumero() + " - " + desc);
        }
    }

    private void abrirCadastroNovoLocal(Stage owner) {
        Stage dialog = new Stage();
        dialog.initOwner(owner);
        dialog.initModality(Modality.WINDOW_MODAL);
        dialog.setTitle("Novo Local");

        VBox dialogRoot = new VBox(20);
        dialogRoot.setPadding(new Insets(20));
        dialogRoot.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
        );

        Label lbl = new Label("Novo Local");
        lbl.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        TextField txtNome = new TextField();
        txtNome.setPromptText("Nome do local");
        txtNome.setStyle(criarEstiloCampo());

        HBox botoes = new HBox(15);
        botoes.setAlignment(Pos.CENTER);

        Button btnSalvar = new Button("Salvar");
        btnSalvar.setPrefWidth(120);
        btnSalvar.setPrefHeight(35);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> {
            String nome = txtNome.getText().trim();
            if (nome.isEmpty()) {
                mostrarAlerta("Erro", "Nome obrigatório", Alert.AlertType.ERROR);
                return;
            }

            LocalShopping novo = new LocalShopping();
            novo.setNome(nome);

            int id = localShoppingDao.inserirLocal(novo);
            if (id > 0) {
                atualizarComboLocal();
                comboLocal.setValue(nome);
                dialog.close();
            } else {
                mostrarAlerta("Erro", "Falha ao cadastrar local", Alert.AlertType.ERROR);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(120);
        btnCancelar.setPrefHeight(35);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        dialogRoot.getChildren().addAll(lbl, txtNome, botoes);

        Scene scene = new Scene(dialogRoot, 380, 200);
        dialog.setScene(scene);
        dialog.show();
    }

    private void abrirCadastroNovoTipo(Stage owner) {
        Stage dialog = new Stage();
        dialog.initOwner(owner);
        dialog.initModality(Modality.WINDOW_MODAL);
        dialog.setTitle("Novo Tipo de Objeto");

        VBox dialogRoot = new VBox(20);
        dialogRoot.setPadding(new Insets(20));
        dialogRoot.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
        );

        Label lbl = new Label("Novo Tipo de Objeto");
        lbl.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        TextField txtNome = new TextField();
        txtNome.setPromptText("Nome do tipo (ex: Celular, Bolsa)");
        txtNome.setStyle(criarEstiloCampo());

        TextField txtPrazoDias = new TextField();
        txtPrazoDias.setPromptText("Prazo em dias (ex: 30)");
        txtPrazoDias.setStyle(criarEstiloCampo());

        HBox botoes = new HBox(15);
        botoes.setAlignment(Pos.CENTER);

        Button btnSalvar = new Button("Salvar");
        btnSalvar.setPrefWidth(120);
        btnSalvar.setPrefHeight(35);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> {
            String nome = txtNome.getText().trim();
            String prazoStr = txtPrazoDias.getText().trim();

            if (nome.isEmpty()) {
                mostrarAlerta("Erro", "Nome do tipo é obrigatório", Alert.AlertType.ERROR);
                return;
            }

            if (prazoStr.isEmpty()) {
                mostrarAlerta("Erro", "Prazo em dias é obrigatório", Alert.AlertType.ERROR);
                return;
            }

            int prazoDias;
            try {
                prazoDias = Integer.parseInt(prazoStr);
                if (prazoDias < 0) {
                    mostrarAlerta("Erro", "Prazo não pode ser negativo", Alert.AlertType.ERROR);
                    return;
                }
            } catch (NumberFormatException ex) {
                mostrarAlerta("Erro", "Prazo deve ser um número inteiro", Alert.AlertType.ERROR);
                return;
            }

            TipoObjeto novo = new TipoObjeto();
            novo.setNome(nome);
            novo.setPrazoDias(prazoDias);

            int id = tipoObjetoDao.inserirTipo(novo);
            if (id > 0) {
                atualizarComboTipo();
                comboCategoria.setValue(nome);
                mostrarAlerta("Sucesso", "Tipo cadastrado com sucesso!", Alert.AlertType.INFORMATION);
                dialog.close();
            } else {
                mostrarAlerta("Erro", "Falha ao cadastrar tipo. Verifique se o nome já existe ou se há erro no banco.", Alert.AlertType.ERROR);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(120);
        btnCancelar.setPrefHeight(35);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        dialogRoot.getChildren().addAll(lbl, txtNome, txtPrazoDias, botoes);

        Scene scene = new Scene(dialogRoot, 380, 260);
        dialog.setScene(scene);
        dialog.show();
    }

    private void abrirCadastroNovaCaixa(Stage owner) {
        Stage dialog = new Stage();
        dialog.initOwner(owner);
        dialog.initModality(Modality.WINDOW_MODAL);
        dialog.setTitle("Nova Caixa");

        VBox dialogRoot = new VBox(20);
        dialogRoot.setPadding(new Insets(20));
        dialogRoot.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
        );

        Label lbl = new Label("Nova Caixa");
        lbl.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        TextField txtNumero = new TextField();
        txtNumero.setPromptText("Número da caixa");
        txtNumero.setStyle(criarEstiloCampo());

        TextField txtDescricao = new TextField();
        txtDescricao.setPromptText("Descrição (opcional)");
        txtDescricao.setStyle(criarEstiloCampo());

        HBox botoes = new HBox(15);
        botoes.setAlignment(Pos.CENTER);

        Button btnSalvar = new Button("Salvar");
        btnSalvar.setPrefWidth(120);
        btnSalvar.setPrefHeight(35);
        btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A"));
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipalHover("#3B82F6")));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(criarEstiloBotaoPrincipal("#1E3A8A")));
        btnSalvar.setOnAction(e -> {
            String numStr = txtNumero.getText().trim();
            if (numStr.isEmpty()) {
                mostrarAlerta("Erro", "Número obrigatório", Alert.AlertType.ERROR);
                return;
            }

            int numero;
            try {
                numero = Integer.parseInt(numStr);
            } catch (NumberFormatException ex) {
                mostrarAlerta("Erro", "Número inválido", Alert.AlertType.ERROR);
                return;
            }

            CaixaArmazenamento nova = new CaixaArmazenamento();
            nova.setNumero(numero);
            nova.setDescricao(txtDescricao.getText().trim());

            int id = caixaArmazenamentoDao.inserirCaixa(nova);
            if (id > 0) {
                atualizarComboCaixa();
                comboCaixa.setValue("Caixa " + numero + " - " + (txtDescricao.getText().trim().isEmpty() ? "Sem descrição" : txtDescricao.getText().trim()));
                dialog.close();
            } else {
                mostrarAlerta("Erro", "Falha ao cadastrar caixa", Alert.AlertType.ERROR);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(120);
        btnCancelar.setPrefHeight(35);
        btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B"));
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipalHover("#475569")));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(criarEstiloBotaoPrincipal("#64748B")));
        btnCancelar.setOnAction(e -> dialog.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        dialogRoot.getChildren().addAll(lbl, txtNumero, txtDescricao, botoes);

        Scene scene = new Scene(dialogRoot, 380, 240);
        dialog.setScene(scene);
        dialog.show();
    }

    private void selecionarFoto() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Imagens", "*.png", "*.jpg", "*.jpeg"));
        arquivoImagemSelecionada = fileChooser.showOpenDialog(null);

        if (arquivoImagemSelecionada != null) {
            try {
                Image img = new Image(arquivoImagemSelecionada.toURI().toString());
                previewImagem.setImage(img);
            } catch (Exception e) {
                mostrarAlerta("Erro", "Não foi possível carregar a imagem.", Alert.AlertType.ERROR);
            }
        }
    }

    private String salvarImagemNoDisco(File arquivo) throws IOException {
        if (arquivo == null || !arquivo.exists()) {
            throw new IOException("Nenhuma imagem selecionada.");
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nomeArquivo = timestamp + "_" + arquivo.getName();

        Path pasta = Paths.get("src", "imagens", "itens");
        if (!Files.exists(pasta)) {
            Files.createDirectories(pasta);
        }

        Path destino = pasta.resolve(nomeArquivo);
        Files.copy(arquivo.toPath(), destino, StandardCopyOption.REPLACE_EXISTING);

        return "src/imagens/itens/" + nomeArquivo;
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
