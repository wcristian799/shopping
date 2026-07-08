package view;

import controller.ItemPerdidoController;
import controller.EntregaController;
import dao.LocalShoppingDao;
import dao.TipoObjetoDao;
import dao.CaixaArmazenamentoDao;
import javafx.animation.PauseTransition;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.concurrent.Task;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.effect.DropShadow;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.util.Duration;
import model.Usuario;
import model.ItemPerdido;
import model.LocalShopping;
import model.TipoObjeto;
import model.CaixaArmazenamento;
import model.Entrega;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

public class TelaPrincipal extends Application {

    private static final int ITENS_POR_PAGINA = 32;

    private Usuario usuarioLogado;
    private ItemPerdidoController itemPerdidoController;
    private EntregaController entregaController;
    private LocalShoppingDao localDao = new LocalShoppingDao();
    private TipoObjetoDao tipoDao = new TipoObjetoDao();
    private CaixaArmazenamentoDao caixaDao = new CaixaArmazenamentoDao();

    private TableView<ItemTabela> tabela;
    private Pagination pagination;

    private TextField campoBusca;

    private ObservableList<ItemTabela> todosOsItens = FXCollections.observableArrayList();
    private ObservableList<ItemTabela> itensFiltrados = FXCollections.observableArrayList();

    private List<LocalShopping> locaisCache;
    private List<TipoObjeto> tiposCache;
    private List<CaixaArmazenamento> caixasCache;

    private CheckBox chkTodos, chkNoPrazo, chkVenceHoje, chkVencido, chkDevolvido, chkFinalizado;

    private ComboBox<String> comboEstado;
    private ComboBox<String> comboTipo;
    private ComboBox<String> comboCaixa;

    // Controles estáticos para evitar múltiplas janelas abertas
    private static Stage cadastroItemStage = null;
    private static Stage requisicoesStage = null;
    private static Stage entregasStage = null;
    private static Stage encaminhamentoStage = null;
    private static Stage relatorioStage = null;
    private static Stage popupFiltrosStage = null;
    private static final AtomicBoolean atualizacaoSituacoesEmAndamento = new AtomicBoolean(false);
    private final AtomicBoolean carregamentoItensEmAndamento = new AtomicBoolean(false);
    private boolean recarregarItensAoFinal = false;
    private String termoCarregamentoPendente = null;
    private boolean reaplicarFiltrosPendentes = false;

    public TelaPrincipal(Usuario usuario) {
        this.usuarioLogado = usuario;
        this.itemPerdidoController = new ItemPerdidoController();
        this.entregaController = new EntregaController();
        this.locaisCache = Collections.emptyList();
        this.tiposCache = Collections.emptyList();
        this.caixasCache = Collections.emptyList();
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Sistema de Achados e Perdidos");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        // Fundo com gradiente igual ao da tela de login
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #1E3A8A, #3B82F6);");
        root.setCenter(criarCarregamentoInicial());

        Scene scene = new Scene(root, 1200, 700);
        stage.setScene(scene);

        stage.setMinWidth(1380);
        stage.setMinHeight(700);

        stage.setMaximized(true);
        stage.show();

        PauseTransition prepararTela = new PauseTransition(Duration.millis(1));
        prepararTela.setOnFinished(event -> {
            root.setTop(criarBarraSuperior(stage));
            root.setCenter(criarConteudoCentral(stage));
            Platform.runLater(this::atualizarSituacoesVencidasEmSegundoPlano);
            carregarItens();
        });
        prepararTela.play();
    }

    private StackPane criarCarregamentoInicial() {
        VBox box = new VBox(12);
        box.setAlignment(Pos.CENTER);
        box.setPadding(new Insets(24));
        box.setMaxWidth(360);
        box.setStyle(
                "-fx-background-color: rgba(255, 255, 255, 0.96); " +
                        "-fx-background-radius: 4; " +
                        "-fx-border-color: rgba(255,255,255,0.5); " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        Label titulo = new Label("Carregando sistema");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        Label mensagem = new Label("Preparando a tela principal...");
        mensagem.setStyle("-fx-font-size: 13px; -fx-text-fill: #334155;");

        ProgressIndicator indicador = new ProgressIndicator();
        indicador.setPrefSize(42, 42);

        box.getChildren().addAll(indicador, titulo, mensagem);
        StackPane wrapper = new StackPane(box);
        wrapper.setPadding(new Insets(20));
        return wrapper;
    }

    private void atualizarSituacoesVencidasEmSegundoPlano() {
        if (!atualizacaoSituacoesEmAndamento.compareAndSet(false, true)) {
            return;
        }

        Task<Integer> atualizacaoTask = new Task<>() {
            @Override
            protected Integer call() {
                return itemPerdidoController.atualizarSituacoesVencidasComContagem();
            }
        };

        atualizacaoTask.setOnSucceeded(event -> {
            atualizacaoSituacoesEmAndamento.set(false);
            Integer itensAtualizados = atualizacaoTask.getValue();
            if (itensAtualizados != null && itensAtualizados > 0) {
                atualizarMantendoFiltro();
            }
        });

        atualizacaoTask.setOnFailed(event -> {
            atualizacaoSituacoesEmAndamento.set(false);
            Throwable erro = atualizacaoTask.getException();
            if (erro != null) {
                System.err.println("Erro ao atualizar situacoes em segundo plano: " + erro.getMessage());
                erro.printStackTrace();
            }
        });

        Thread worker = new Thread(atualizacaoTask, "atualizacao-situacoes-itens");
        worker.setDaemon(true);
        worker.start();
    }

    private HBox criarBarraSuperior(Stage stage) {
        HBox topBar = new HBox();
        topBar.setPadding(new Insets(12, 15, 12, 15));
        topBar.setStyle("-fx-background-color: linear-gradient(to right, #3B82F6, #1E3A8A); -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.3), 5, 0, 0, 3);");
        topBar.setAlignment(Pos.CENTER_LEFT);
        topBar.setSpacing(8);

        ImageView logoView = new ImageView();
        logoView.setFitWidth(60);
        logoView.setFitHeight(60);
        logoView.setPreserveRatio(true);
        logoView.setSmooth(true);

        try {
            File logoFile = new File("src/imagens/logo.png");
            if (logoFile.exists()) {
                FileInputStream fis = new FileInputStream(logoFile);
                Image logo = new Image(fis, 120, 120, true, true);
                logoView.setImage(logo);
            } else {
                System.out.println("Arquivo de logo não encontrado em: " + logoFile.getAbsolutePath());
            }
        } catch (FileNotFoundException e) {
            System.out.println("Erro ao carregar logo: " + e.getMessage());
        }

        Label titulo = new Label("Achados e Perdidos Shopping Iguatemi");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: white;");

        HBox tituloBox = new HBox(8);
        tituloBox.setAlignment(Pos.CENTER_LEFT);
        tituloBox.getChildren().addAll(logoView, titulo);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Label usuarioLabel = new Label("👤 " + usuarioLogado.getNome());
        usuarioLabel.setStyle("-fx-text-fill: white; -fx-font-size: 13px; -fx-background-color: rgba(255,255,255,0.2); -fx-padding: 4 10; -fx-background-radius: 4; -fx-font-weight: 500;");

        Button btnEntregas = new Button("Entregas");
        btnEntregas.setStyle(criarEstiloBotaoMenu("#10b981", "#059669"));
        btnEntregas.setOnMouseEntered(e -> btnEntregas.setStyle(criarEstiloBotaoMenuHover("#059669", "#10b981")));
        btnEntregas.setOnMouseExited(e -> btnEntregas.setStyle(criarEstiloBotaoMenu("#10b981", "#059669")));
        btnEntregas.setOnAction(e -> TelaEntrega.abrirTelaEntrega(stage, usuarioLogado.getId()));

        Button btnEncaminhamentos = new Button("Encaminhar");
        btnEncaminhamentos.setStyle(criarEstiloBotaoMenu("#f59e0b", "#d97706"));
        btnEncaminhamentos.setOnMouseEntered(e -> btnEncaminhamentos.setStyle(criarEstiloBotaoMenuHover("#d97706", "#f59e0b")));
        btnEncaminhamentos.setOnMouseExited(e -> btnEncaminhamentos.setStyle(criarEstiloBotaoMenu("#f59e0b", "#d97706")));
        btnEncaminhamentos.setOnAction(e -> TelaEncaminhamento.abrirTelaEncaminhamento(stage));

        Button btnRequisicoes = new Button("Requisições");
        btnRequisicoes.setStyle(criarEstiloBotaoMenu("#8b5cf6", "#7c3aed"));
        btnRequisicoes.setOnMouseEntered(e -> btnRequisicoes.setStyle(criarEstiloBotaoMenuHover("#7c3aed", "#8b5cf6")));
        btnRequisicoes.setOnMouseExited(e -> btnRequisicoes.setStyle(criarEstiloBotaoMenu("#8b5cf6", "#7c3aed")));
        btnRequisicoes.setOnAction(e -> TelaRequisicoes.abrirTelaRequisicoes(stage));

        Button btnRelatorio = new Button("Relatórios");
        btnRelatorio.setStyle(criarEstiloBotaoMenu("#3B82F6", "#2563eb"));
        btnRelatorio.setOnMouseEntered(e -> btnRelatorio.setStyle(criarEstiloBotaoMenuHover("#2563eb", "#3B82F6")));
        btnRelatorio.setOnMouseExited(e -> btnRelatorio.setStyle(criarEstiloBotaoMenu("#3B82F6", "#2563eb")));
        btnRelatorio.setOnAction(e -> TelaRelatorio.abrirTelaRelatorio(stage));

        // Botão de sair com ícone
        Button sairButton = new Button();
        ImageView sairIcon = new ImageView();
        sairIcon.setFitWidth(18);
        sairIcon.setFitHeight(18);
        sairIcon.setImage(new Image("https://img.icons8.com/ios-glyphs/30/ffffff/exit.png", true));
        sairButton.setGraphic(sairIcon);
        sairButton.setStyle(
                "-fx-background-color: #ef4444; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(239,68,68,0.3), 5, 0, 0, 2);"
        );
        sairButton.setOnMouseEntered(e -> sairButton.setStyle(
                "-fx-background-color: #dc2626; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(220,38,38,0.4), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;"
        ));
        sairButton.setOnMouseExited(e -> sairButton.setStyle(
                "-fx-background-color: #ef4444; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(239,68,68,0.3), 5, 0, 0, 2);"
        ));
        sairButton.setOnAction(e -> {
            try {
                new Login().start(new Stage());
                stage.close();
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });

        topBar.getChildren().addAll(tituloBox, spacer, btnEntregas, btnEncaminhamentos, btnRequisicoes, btnRelatorio);

        if (usuarioLogado.getNivelAcessoId() == 1) {
            Button btnCadastrarUsuario = new Button("+ Usuário");
            btnCadastrarUsuario.setStyle(criarEstiloBotaoMenu("#f97316", "#ea580c"));
            btnCadastrarUsuario.setOnMouseEntered(e -> btnCadastrarUsuario.setStyle(criarEstiloBotaoMenuHover("#ea580c", "#f97316")));
            btnCadastrarUsuario.setOnMouseExited(e -> btnCadastrarUsuario.setStyle(criarEstiloBotaoMenu("#f97316", "#ea580c")));
            btnCadastrarUsuario.setOnAction(e -> CadastroUsuario.abrirCadastroUsuario(stage));
            topBar.getChildren().add(btnCadastrarUsuario);
        }

        topBar.getChildren().addAll(usuarioLabel, sairButton);

        return topBar;
    }

    private String criarEstiloBotaoMenu(String corNormal, String corHover) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 12; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 5, 0, 0, 2);",
                corNormal
        );
    }

    private String criarEstiloBotaoMenuHover(String corHover, String corOriginal) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 12; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.3), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;",
                corHover
        );
    }

    private VBox criarConteudoCentral(Stage stage) {
        VBox conteudo = new VBox(12);
        conteudo.setPadding(new Insets(15));
        conteudo.setStyle(
                "-fx-background-color: rgba(255, 255, 255, 0.95); " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 20, 0, 0, 10); " +
                        "-fx-border-color: rgba(255,255,255,0.5); " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4;"
        );

        HBox barraBusca = new HBox(8);
        barraBusca.setAlignment(Pos.CENTER_LEFT);
        barraBusca.setPadding(new Insets(5, 0, 5, 0));

        // Campo de busca com ícone de lupa dentro e centralizado verticalmente
        HBox searchBox = new HBox(5);
        searchBox.setAlignment(Pos.CENTER_LEFT);
        searchBox.setStyle(
                "-fx-background-color: #F8FAFC; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 0;"
        );

        ImageView searchIcon = new ImageView();
        searchIcon.setFitWidth(18);
        searchIcon.setFitHeight(18);
        searchIcon.setImage(new Image("https://img.icons8.com/ios-glyphs/30/3B82F6/search.png", true));

        StackPane iconContainer = new StackPane(searchIcon);
        iconContainer.setPadding(new Insets(0, 0, 0, 8));
        iconContainer.setAlignment(Pos.CENTER);

        campoBusca = new TextField();
        campoBusca.setPromptText("Buscar...");
        campoBusca.setPrefWidth(250);
        campoBusca.setStyle(
                "-fx-background-color: transparent; " +
                        "-fx-border-color: transparent; " +
                        "-fx-font-size: 13px; " +
                        "-fx-padding: 8 0; " +
                        "-fx-alignment: center-left;"
        );

        searchBox.getChildren().addAll(iconContainer, campoBusca);

        // Efeitos hover no campo de busca
        searchBox.setOnMouseEntered(e ->
                searchBox.setStyle(
                        "-fx-background-color: #FFFFFF; " +
                                "-fx-border-color: #3B82F6; " +
                                "-fx-border-width: 1; " +
                                "-fx-border-radius: 4; " +
                                "-fx-background-radius: 4; " +
                                "-fx-padding: 0; " +
                                "-fx-effect: dropshadow(gaussian, rgba(59,130,246,0.2), 8, 0, 0, 3);"
                )
        );

        searchBox.setOnMouseExited(e ->
                searchBox.setStyle(
                        "-fx-background-color: #F8FAFC; " +
                                "-fx-border-color: #E2E8F0; " +
                                "-fx-border-width: 1; " +
                                "-fx-border-radius: 4; " +
                                "-fx-background-radius: 4; " +
                                "-fx-padding: 0;"
                )
        );

        campoBusca.setOnAction(e -> buscarItens());

        // Botão de pesquisa com ícone de lupa (sem texto)
        Button btnBuscar = new Button();
        ImageView btnSearchIcon = new ImageView();
        btnSearchIcon.setFitWidth(18);
        btnSearchIcon.setFitHeight(18);
        btnSearchIcon.setImage(new Image("https://img.icons8.com/ios-glyphs/30/ffffff/search.png", true));
        btnBuscar.setGraphic(btnSearchIcon);
        btnBuscar.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand;"
        );
        btnBuscar.setOnMouseEntered(e -> btnBuscar.setStyle(
                "-fx-background-color: #2563eb; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(37,99,235,0.3), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;"
        ));
        btnBuscar.setOnMouseExited(e -> btnBuscar.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand;"
        ));
        btnBuscar.setOnAction(e -> buscarItens());

        Button btnAtualizar = new Button("Atualizar");
        btnAtualizar.setStyle(criarEstiloBotaoAcao("#64748B", "#475569"));
        btnAtualizar.setOnMouseEntered(e -> btnAtualizar.setStyle(criarEstiloBotaoAcaoHover("#475569")));
        btnAtualizar.setOnMouseExited(e -> btnAtualizar.setStyle(criarEstiloBotaoAcao("#64748B", "#475569")));
        btnAtualizar.setOnAction(e -> atualizarMantendoFiltro());

        Button btnCadastrar = new Button("+ Cadastrar");
        btnCadastrar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb"));
        btnCadastrar.setOnMouseEntered(e -> btnCadastrar.setStyle(criarEstiloBotaoAcaoHover("#2563eb")));
        btnCadastrar.setOnMouseExited(e -> btnCadastrar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb")));
        btnCadastrar.setOnAction(e -> CadastroItem.abrirCadastroItem(stage, usuarioLogado.getId()));

        // Botão de filtro com ícone e cor #1E3A8A
        Button btnFiltros = new Button();
        ImageView filterIcon = new ImageView();
        filterIcon.setFitWidth(18);
        filterIcon.setFitHeight(18);
        filterIcon.setImage(new Image("https://img.icons8.com/ios-glyphs/30/ffffff/filter.png", true));
        btnFiltros.setGraphic(filterIcon);
        btnFiltros.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand;"
        );
        btnFiltros.setOnMouseEntered(e -> btnFiltros.setStyle(
                "-fx-background-color: #2563eb; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(37,99,235,0.3), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;"
        ));
        btnFiltros.setOnMouseExited(e -> btnFiltros.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-padding: 8; " +
                        "-fx-background-radius: 4; " +
                        "-fx-cursor: hand;"
        ));
        btnFiltros.setOnAction(e -> abrirPopupFiltros(stage));

        barraBusca.getChildren().addAll(
                searchBox, btnBuscar, btnAtualizar, btnCadastrar, btnFiltros
        );

        tabela = criarTabela();
        VBox.setVgrow(tabela, Priority.ALWAYS);

        // ========== NOVO: Configurar menu de contexto ==========
        tabela.setContextMenu(criarMenuContexto());

        tabela.setOnMouseClicked(event -> {
            if (event.getClickCount() == 2 && !tabela.getSelectionModel().isEmpty()) {
                ItemTabela itemSelecionado = tabela.getSelectionModel().getSelectedItem();
                if (itemSelecionado != null) {
                    abrirJanelaDetalhes(itemSelecionado);
                }
            }
        });

        pagination = new Pagination();
        pagination.setStyle(
                "-fx-page-information-visible: false; " +
                        "-fx-background-color: transparent; " +
                        "-fx-font-size: 11px;"
        );
        pagination.setPageFactory(this::criarPagina);

        conteudo.getChildren().addAll(barraBusca, tabela, pagination);
        return conteudo;
    }

    // ========== NOVO: Método para criar menu de contexto ==========
    private ContextMenu criarMenuContexto() {
        ContextMenu contextMenu = new ContextMenu();

        MenuItem itemDevolver = new MenuItem("🔄 Devolver Item");
        itemDevolver.setStyle("-fx-font-size: 13px; -fx-padding: 5 10; -fx-font-weight: bold;");

        // Ícone para o menu (opcional)
        try {
            ImageView devolverIcon = new ImageView(
                    new Image("https://img.icons8.com/ios-glyphs/30/1E3A8A/return-box.png", true)
            );
            devolverIcon.setFitWidth(16);
            devolverIcon.setFitHeight(16);
            itemDevolver.setGraphic(devolverIcon);
        } catch (Exception e) {
            // Se não conseguir carregar o ícone, continua sem ele
        }

        itemDevolver.setOnAction(e -> {
            ItemTabela itemSelecionado = tabela.getSelectionModel().getSelectedItem();
            if (itemSelecionado != null) {
                // Verificar se o item já foi devolvido ou finalizado
                if ("Devolvido".equals(itemSelecionado.getSituacao()) ||
                        "Finalizado".equals(itemSelecionado.getSituacao())) {
                    mostrarAlerta("Atenção",
                            "Este item já foi " + itemSelecionado.getSituacao().toLowerCase() +
                                    " e não pode ser devolvido novamente.",
                            Alert.AlertType.WARNING);
                    return;
                }

                abrirEntregaComItemSelecionado(itemSelecionado);
            }
        });

        contextMenu.getItems().add(itemDevolver);

        // Adicionar separador
        contextMenu.getItems().add(new SeparatorMenuItem());

        MenuItem itemDetalhes = new MenuItem("👁️ Ver Detalhes");
        itemDetalhes.setStyle("-fx-font-size: 13px; -fx-padding: 5 10;");
        itemDetalhes.setOnAction(e -> {
            ItemTabela itemSelecionado = tabela.getSelectionModel().getSelectedItem();
            if (itemSelecionado != null) {
                abrirJanelaDetalhes(itemSelecionado);
            }
        });

        contextMenu.getItems().add(itemDetalhes);

        return contextMenu;
    }

    // ========== NOVO: Método para abrir entrega com item selecionado ==========
    private void abrirEntregaComItemSelecionado(ItemTabela itemTabela) {
        try {
            // Buscar o ItemPerdido completo pelo número de registro
            int itemId = itemPerdidoController.getItemIdPorNumeroRegistro(itemTabela.getNumero());
            ItemPerdido itemCompleto = itemPerdidoController.buscarItemPorId(itemId);

            if (itemCompleto != null) {
                // Usar o novo método estático que aceita um item para pré-selecionar
                TelaEntrega.abrirTelaEntregaComItem(getStage(), usuarioLogado.getId(), itemCompleto);
            } else {
                mostrarAlerta("Erro", "Não foi possível encontrar o item completo.", Alert.AlertType.ERROR);
            }
        } catch (Exception e) {
            e.printStackTrace();
            mostrarAlerta("Erro", "Erro ao abrir tela de entrega: " + e.getMessage(), Alert.AlertType.ERROR);
        }
    }

    private String criarEstiloBotaoAcao(String corNormal, String corHover) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;",
                corNormal
        );
    }

    private String criarEstiloBotaoAcaoHover(String corHover) {
        return String.format(
                "-fx-background-color: %s; " +
                        "-fx-text-fill: white; " +
                        "-fx-padding: 8 15; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 8, 0, 0, 3); " +
                        "-fx-scale-x: 1.02; " +
                        "-fx-scale-y: 1.02;",
                corHover
        );
    }

    private void abrirPopupFiltros(Stage stage) {
        if (popupFiltrosStage != null && popupFiltrosStage.isShowing()) {
            popupFiltrosStage.toFront();
            popupFiltrosStage.requestFocus();
            return;
        }

        Stage popup = new Stage();
        popup.setTitle("Filtros Avançados");
        util.IconeUtil.aplicarIcone(popup);
        popup.initOwner(stage);
        popup.setAlwaysOnTop(true);

        VBox vbox = new VBox(10);
        vbox.setPadding(new Insets(15));
        vbox.setAlignment(Pos.CENTER_LEFT);
        vbox.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 15, 0, 0, 5);"
        );

        Label lblTitulo = new Label("Filtros Avançados");
        lblTitulo.setStyle("-fx-font-weight: bold; -fx-font-size: 18px; -fx-text-fill: #1E3A8A;");

        VBox situacaoBox = new VBox(6);
        situacaoBox.setPadding(new Insets(10));
        situacaoBox.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-width: 1; -fx-border-radius: 4; -fx-background-radius: 4;");

        Label lblSituacao = new Label("Situação do Item");
        lblSituacao.setStyle("-fx-font-weight: bold; -fx-font-size: 14px; -fx-text-fill: #1E3A8A;");

        chkTodos = new CheckBox("Mostrar todos");
        chkTodos.setSelected(true);
        chkTodos.setStyle("-fx-font-size: 13px;");

        chkNoPrazo = new CheckBox("No prazo");
        chkVenceHoje = new CheckBox("Vence hoje");
        chkVencido = new CheckBox("Vencido");
        chkDevolvido = new CheckBox("Devolvido");
        chkFinalizado = new CheckBox("Finalizado");

        String checkBoxStyle = "-fx-font-size: 13px; -fx-padding: 3 0;";
        chkNoPrazo.setStyle(checkBoxStyle);
        chkVenceHoje.setStyle(checkBoxStyle);
        chkVencido.setStyle(checkBoxStyle);
        chkDevolvido.setStyle(checkBoxStyle);
        chkFinalizado.setStyle(checkBoxStyle);

        chkTodos.selectedProperty().addListener((obs, oldVal, newVal) -> {
            if (newVal) {
                chkNoPrazo.setSelected(false);
                chkVenceHoje.setSelected(false);
                chkVencido.setSelected(false);
                chkDevolvido.setSelected(false);
                chkFinalizado.setSelected(false);
            }
            aplicarFiltrosAvancados();
        });

        ChangeListener<Boolean> desmarcarTodosListener = (obs, oldVal, newVal) -> {
            if (newVal) {
                chkTodos.setSelected(false);
            } else {
                if (!chkNoPrazo.isSelected() && !chkVenceHoje.isSelected() &&
                        !chkVencido.isSelected() && !chkDevolvido.isSelected() &&
                        !chkFinalizado.isSelected()) {
                    chkTodos.setSelected(true);
                }
            }
            aplicarFiltrosAvancados();
        };

        chkNoPrazo.selectedProperty().addListener(desmarcarTodosListener);
        chkVenceHoje.selectedProperty().addListener(desmarcarTodosListener);
        chkVencido.selectedProperty().addListener(desmarcarTodosListener);
        chkDevolvido.selectedProperty().addListener(desmarcarTodosListener);
        chkFinalizado.selectedProperty().addListener(desmarcarTodosListener);

        situacaoBox.getChildren().addAll(lblSituacao, chkTodos, new Separator(), chkNoPrazo, chkVenceHoje, chkVencido, chkDevolvido, chkFinalizado);

        VBox categoriaBox = new VBox(10);
        categoriaBox.setPadding(new Insets(10));
        categoriaBox.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-width: 1; -fx-border-radius: 4; -fx-background-radius: 4;");

        Label lblCategoria = new Label("Categoria / Localização");
        lblCategoria.setStyle("-fx-font-weight: bold; -fx-font-size: 14px; -fx-text-fill: #1E3A8A;");

        comboEstado = new ComboBox<>();
        comboEstado.getItems().add("Todos");
        comboEstado.getItems().addAll("Preservado", "Desgastado", "Danificado");
        comboEstado.setValue("Todos");
        comboEstado.setPrefWidth(220);
        comboEstado.setStyle("-fx-background-radius: 4; -fx-border-radius: 4;");

        comboTipo = new ComboBox<>();
        comboTipo.getItems().add("Todos");
        for (TipoObjeto t : tiposCache) {
            comboTipo.getItems().add(t.getNome());
        }
        comboTipo.setValue("Todos");
        comboTipo.setPrefWidth(220);
        comboTipo.setStyle("-fx-background-radius: 4; -fx-border-radius: 4;");

        comboCaixa = new ComboBox<>();
        comboCaixa.getItems().addAll("Todos", "Nenhuma");
        for (CaixaArmazenamento c : caixasCache) {
            String textoCaixa = getDescricaoCaixa(c.getId());
            comboCaixa.getItems().add(textoCaixa);
        }
        comboCaixa.setValue("Todos");
        comboCaixa.setPrefWidth(220);
        comboCaixa.setStyle("-fx-background-radius: 4; -fx-border-radius: 4;");

        categoriaBox.getChildren().addAll(
                lblCategoria,
                new Label("Estado:"), comboEstado,
                new Label("Categoria:"), comboTipo,
                new Label("Caixa:"), comboCaixa
        );

        HBox botoes = new HBox(10);
        botoes.setAlignment(Pos.CENTER);

        Button btnAplicar = new Button("Aplicar Filtros");
        btnAplicar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb"));
        btnAplicar.setOnMouseEntered(e -> btnAplicar.setStyle(criarEstiloBotaoAcaoHover("#2563eb")));
        btnAplicar.setOnMouseExited(e -> btnAplicar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb")));
        btnAplicar.setOnAction(e -> {
            aplicarFiltrosAvancados();
            popup.close();
        });

        Button btnLimpar = new Button("Limpar Tudo");
        btnLimpar.setStyle(criarEstiloBotaoAcao("#64748B", "#475569"));
        btnLimpar.setOnMouseEntered(e -> btnLimpar.setStyle(criarEstiloBotaoAcaoHover("#475569")));
        btnLimpar.setOnMouseExited(e -> btnLimpar.setStyle(criarEstiloBotaoAcao("#64748B", "#475569")));
        btnLimpar.setOnAction(e -> {
            if (chkTodos != null) chkTodos.setSelected(true);
            if (chkNoPrazo != null) chkNoPrazo.setSelected(false);
            if (chkVenceHoje != null) chkVenceHoje.setSelected(false);
            if (chkVencido != null) chkVencido.setSelected(false);
            if (chkDevolvido != null) chkDevolvido.setSelected(false);
            if (chkFinalizado != null) chkFinalizado.setSelected(false);
            if (comboEstado != null) comboEstado.setValue("Todos");
            if (comboTipo != null) comboTipo.setValue("Todos");
            if (comboCaixa != null) comboCaixa.setValue("Todos");
            aplicarFiltrosAvancados();
            popup.close();
        });

        botoes.getChildren().addAll(btnAplicar, btnLimpar);

        vbox.getChildren().addAll(lblTitulo, situacaoBox, categoriaBox, botoes);

        Scene scene = new Scene(vbox, 340, 580);
        popup.setScene(scene);
        popup.setResizable(false);

        popupFiltrosStage = popup;
        popup.setOnHidden(event -> popupFiltrosStage = null);
        popup.setOnCloseRequest(event -> popupFiltrosStage = null);

        popup.show();
    }

    private void aplicarFiltrosAvancados() {
        itensFiltrados.clear();

        boolean usarTodos = (chkTodos == null) || chkTodos.isSelected();

        for (ItemTabela item : todosOsItens) {
            boolean passaSituacao = usarTodos ||
                    (chkNoPrazo != null && chkNoPrazo.isSelected() && item.getSituacao().toLowerCase().contains("no prazo")) ||
                    (chkVenceHoje != null && chkVenceHoje.isSelected() && item.getSituacao().toLowerCase().contains("vence hoje")) ||
                    (chkVencido != null && chkVencido.isSelected() && item.getSituacao().toLowerCase().contains("vencido")) ||
                    (chkDevolvido != null && chkDevolvido.isSelected() && item.getSituacao().toLowerCase().contains("devolvido")) ||
                    (chkFinalizado != null && chkFinalizado.isSelected() && item.getSituacao().toLowerCase().contains("finalizado"));

            String estadoSelecionado = (comboEstado == null) ? "Todos" : comboEstado.getValue();
            boolean passaEstado = estadoSelecionado.equals("Todos") ||
                    (item.getEstado() != null &&
                            item.getEstado().trim().equalsIgnoreCase(estadoSelecionado.trim()));

            String tipoSelecionado = (comboTipo == null) ? "Todos" : comboTipo.getValue();
            boolean passaTipo = tipoSelecionado.equals("Todos") ||
                    (item.getTipo() != null && item.getTipo().equals(tipoSelecionado));

            String caixaSelecionada = (comboCaixa == null) ? "Todos" : comboCaixa.getValue();
            boolean passaCaixa = caixaSelecionada.equals("Todos") ||
                    (item.getCaixa() != null && item.getCaixa().equals(caixaSelecionada));

            if (passaSituacao && passaEstado && passaTipo && passaCaixa) {
                itensFiltrados.add(item);
            }
        }

        if (itensFiltrados.isEmpty() && !usarTodos) {
            if (chkTodos != null) chkTodos.setSelected(true);
            aplicarFiltrosAvancados();
        } else {
            atualizarPaginacao();

            if (itensFiltrados.isEmpty()) {
                mostrarAlerta("Nenhum resultado", "Nenhum item corresponde aos filtros selecionados.", Alert.AlertType.INFORMATION);
            }
        }
    }

    private TableView<ItemTabela> criarTabela() {
        TableView<ItemTabela> table = new TableView<>();
        table.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 5);"
        );

        table.setStyle(table.getStyle() +
                "-fx-font-family: 'Segoe UI'; " +
                "-fx-font-size: 11px;"
        );

        table.setFixedCellSize(32);

        table.setRowFactory(tv -> {
            TableRow<ItemTabela> row = new TableRow<>();

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

        TableColumn<ItemTabela, Integer> colNumero = new TableColumn<>("Nº");
        colNumero.setCellValueFactory(new PropertyValueFactory<>("numero"));
        colNumero.setPrefWidth(55);
        colNumero.setCellFactory(column -> new TableCell<ItemTabela, Integer>() {
            @Override
            protected void updateItem(Integer item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                } else {
                    setText(String.format("%04d", item));
                    setStyle("-fx-font-weight: bold; -fx-text-fill: #1E3A8A; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<ItemTabela, String> colData = new TableColumn<>("Data");
        colData.setCellValueFactory(new PropertyValueFactory<>("data"));
        colData.setPrefWidth(75);
        colData.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                } else {
                    setText(item.split(" ")[0]);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<ItemTabela, String> colNome = new TableColumn<>("Item");
        colNome.setCellValueFactory(new PropertyValueFactory<>("nome"));
        colNome.setPrefWidth(160);
        colNome.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-weight: 600; -fx-text-fill: #0f172a; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    if (item.length() > 25) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<ItemTabela, String> colMarca = new TableColumn<>("Marca");
        colMarca.setCellValueFactory(new PropertyValueFactory<>("marca"));
        colMarca.setPrefWidth(120);
        colMarca.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    if (item.length() > 18) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<ItemTabela, String> colLacre = new TableColumn<>("Lacre");
        colLacre.setCellValueFactory(new PropertyValueFactory<>("lacre"));
        colLacre.setPrefWidth(65);
        colLacre.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-font-family: 'Consolas', monospace; -fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                }
            }
        });

        TableColumn<ItemTabela, String> colEstado = new TableColumn<>("Estado");
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));
        colEstado.setPrefWidth(70);
        colEstado.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<ItemTabela, String> colLocal = new TableColumn<>("Local");
        colLocal.setCellValueFactory(new PropertyValueFactory<>("local"));
        colLocal.setPrefWidth(100);
        colLocal.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.equals("-")) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    if (item.length() > 15) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<ItemTabela, String> colTipo = new TableColumn<>("Categoria");
        colTipo.setCellValueFactory(new PropertyValueFactory<>("tipo"));
        colTipo.setPrefWidth(100);
        colTipo.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.equals("-")) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    if (item.length() > 15) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<ItemTabela, String> colCaixa = new TableColumn<>("Caixa");
        colCaixa.setCellValueFactory(new PropertyValueFactory<>("caixa"));
        colCaixa.setPrefWidth(220);
        colCaixa.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.equals("Nenhuma")) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    if (item.length() > 30) {
                        Tooltip tooltip = new Tooltip(item);
                        tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4;");
                        setTooltip(tooltip);
                    }
                }
            }
        });

        TableColumn<ItemTabela, String> colObservacao = new TableColumn<>("Observação");
        colObservacao.setCellValueFactory(new PropertyValueFactory<>("observacao"));
        colObservacao.setPrefWidth(250);
        colObservacao.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null || item.trim().isEmpty()) {
                    setText("—");
                    setStyle("-fx-text-fill: #94a3b8; -fx-font-style: italic; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    setStyle("-fx-text-fill: #334155; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 4; -fx-font-size: 11px;");

                    Tooltip tooltip = new Tooltip(item);
                    tooltip.setStyle("-fx-background-color: #1E3A8A; -fx-text-fill: white; -fx-font-size: 11px; -fx-padding: 4 8; -fx-background-radius: 4; -fx-wrap-text: true; -fx-max-width: 400px;");
                    setTooltip(tooltip);
                }
            }
        });

        TableColumn<ItemTabela, String> colSituacao = new TableColumn<>("Situação");
        colSituacao.setCellValueFactory(new PropertyValueFactory<>("situacao"));
        colSituacao.setPrefWidth(100);
        colSituacao.setCellFactory(column -> new TableCell<ItemTabela, String>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) {
                    setText(null);
                    setStyle("-fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0; -fx-padding: 6 2; -fx-font-size: 11px;");
                } else {
                    setText(item);
                    String estiloBase = "-fx-padding: 6 4; -fx-font-size: 11px; -fx-font-weight: bold; -fx-alignment: CENTER; -fx-border-color: #E2E8F0; -fx-border-width: 0 1 0 0;";

                    switch (item.toLowerCase()) {
                        case "no prazo":
                            setStyle(estiloBase + " -fx-background-color: #E6F0FF; -fx-text-fill: #001F5F;");
                            break;
                        case "vence hoje":
                            setStyle(estiloBase + " -fx-background-color: #FFF4E5; -fx-text-fill: #7A4D00;");
                            break;
                        case "vencido":
                            setStyle(estiloBase + " -fx-background-color: #FFE5E5; -fx-text-fill: #660000;");
                            break;
                        case "devolvido":
                            setStyle(estiloBase + " -fx-background-color: #E6F7E6; -fx-text-fill: #004D00;");
                            break;
                        case "finalizado":
                            setStyle(estiloBase + " -fx-background-color: #D3D3D3; -fx-text-fill: #1A1A1A;");
                            break;
                        default:
                            setStyle(estiloBase + " -fx-background-color: #F5F5F5; -fx-text-fill: #333333;");
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

        table.getColumns().addAll(
                colNumero, colData, colNome, colMarca,
                colLacre, colEstado, colLocal, colTipo, colCaixa,
                colObservacao, colSituacao
        );

        return table;
    }

    private VBox criarPagina(int pagina) {
        int inicio = pagina * ITENS_POR_PAGINA;
        int fim = Math.min(inicio + ITENS_POR_PAGINA, itensFiltrados.size());

        tabela.setItems(FXCollections.observableArrayList(
                itensFiltrados.subList(inicio, fim)
        ));

        return new VBox();
    }

    private void atualizarPaginacao() {
        int totalPaginas = (int) Math.ceil(
                (double) itensFiltrados.size() / ITENS_POR_PAGINA
        );

        pagination.setPageCount(Math.max(totalPaginas, 1));
        pagination.setCurrentPageIndex(0);
        criarPagina(0);
    }

    private String getNomeLocal(int localId) {
        return locaisCache.stream()
                .filter(l -> l.getId() == localId)
                .map(LocalShopping::getNome)
                .findFirst()
                .orElse("-");
    }

    private String getNomeTipo(int tipoId) {
        return tiposCache.stream()
                .filter(t -> t.getId() == tipoId)
                .map(TipoObjeto::getNome)
                .findFirst()
                .orElse("-");
    }

    private String getDescricaoCaixa(Integer caixaId) {
        if (caixaId == null) return "Nenhuma";

        return caixasCache.stream()
                .filter(c -> c.getId() == caixaId)
                .map(c -> {
                    String desc = c.getDescricao();
                    if (desc == null || desc.trim().isEmpty()) {
                        return "Caixa " + c.getNumero();
                    }
                    return "Caixa " + c.getNumero() + " - " + desc;
                })
                .findFirst()
                .orElse("Caixa desconhecida");
    }

    private void carregarItens() {
        carregarItensEmSegundoPlano(null, false);
    }

    private void buscarItens() {
        String termo = campoBusca.getText().trim();
        if (termo.isEmpty()) {
            carregarItens();
            return;
        }
        carregarItensEmSegundoPlano(termo, false);
    }

    private void atualizarMantendoFiltro() {
        String termo = campoBusca == null ? null : campoBusca.getText().trim();
        carregarItensEmSegundoPlano(termo == null || termo.isEmpty() ? null : termo, true);
    }

    private void carregarItensEmSegundoPlano(String termo, boolean reaplicarFiltros) {
        if (!carregamentoItensEmAndamento.compareAndSet(false, true)) {
            recarregarItensAoFinal = true;
            termoCarregamentoPendente = termo;
            reaplicarFiltrosPendentes = reaplicarFiltros;
            return;
        }

        if (tabela != null) {
            tabela.setDisable(true);
            tabela.setPlaceholder(new Label("Carregando itens..."));
        }
        if (pagination != null) {
            pagination.setDisable(true);
        }

        Task<CargaItensResultado> task = new Task<>() {
            @Override
            protected CargaItensResultado call() {
                List<LocalShopping> locais = localDao.listarLocais();
                List<TipoObjeto> tipos = tipoDao.listarTipos();
                List<CaixaArmazenamento> caixas = caixaDao.listarCaixas();
                List<ItemPerdido> itens = termo == null || termo.isBlank()
                        ? itemPerdidoController.listarItens()
                        : itemPerdidoController.buscarItens(termo);

                return new CargaItensResultado(locais, tipos, caixas,
                        montarItensTabela(itens, locais, tipos, caixas));
            }
        };

        task.setOnSucceeded(event -> {
            CargaItensResultado resultado = task.getValue();
            locaisCache = resultado.locais;
            tiposCache = resultado.tipos;
            caixasCache = resultado.caixas;

            todosOsItens.setAll(resultado.itens);
            itensFiltrados.setAll(resultado.itens);

            if (reaplicarFiltros) {
                aplicarFiltrosAvancados();
            } else {
                atualizarPaginacao();
            }

            finalizarCarregamentoItens();
        });

        task.setOnFailed(event -> {
            Throwable erro = task.getException();
            if (erro != null) {
                System.err.println("Erro ao carregar itens em segundo plano: " + erro.getMessage());
                erro.printStackTrace();
            }
            if (tabela != null) {
                tabela.setPlaceholder(new Label("Nao foi possivel carregar os itens."));
            }
            finalizarCarregamentoItens();
        });

        Thread worker = new Thread(task, "carregamento-itens-principal");
        worker.setDaemon(true);
        worker.start();
    }

    private void finalizarCarregamentoItens() {
        if (tabela != null) {
            tabela.setDisable(false);
        }
        if (pagination != null) {
            pagination.setDisable(false);
        }

        carregamentoItensEmAndamento.set(false);
        if (recarregarItensAoFinal) {
            String termoPendente = termoCarregamentoPendente;
            boolean reaplicarFiltros = reaplicarFiltrosPendentes;
            recarregarItensAoFinal = false;
            termoCarregamentoPendente = null;
            reaplicarFiltrosPendentes = false;
            carregarItensEmSegundoPlano(termoPendente, reaplicarFiltros);
        }
    }

    private List<ItemTabela> montarItensTabela(List<ItemPerdido> itens,
                                               List<LocalShopping> locais,
                                               List<TipoObjeto> tipos,
                                               List<CaixaArmazenamento> caixas) {
        Map<Integer, String> locaisPorId = new HashMap<>();
        for (LocalShopping local : locais) {
            locaisPorId.put(local.getId(), local.getNome());
        }

        Map<Integer, String> tiposPorId = new HashMap<>();
        for (TipoObjeto tipo : tipos) {
            tiposPorId.put(tipo.getId(), tipo.getNome());
        }

        Map<Integer, String> caixasPorId = new HashMap<>();
        for (CaixaArmazenamento caixa : caixas) {
            caixasPorId.put(caixa.getId(), formatarDescricaoCaixa(caixa));
        }

        List<ItemTabela> itensTabela = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");

        for (ItemPerdido item : itens) {
            String nomeEntregador = item.getNomeEntregador() != null ? item.getNomeEntregador() : "";
            String nomeResponsavel = item.getResponsavelCadastro() != null ? item.getResponsavelCadastro() : "";

            itensTabela.add(new ItemTabela(
                    item.getNumeroRegistro(),
                    item.getDataRegistro() != null ? sdf.format(item.getDataRegistro()) : "",
                    item.getNome(),
                    item.getMarca(),
                    String.valueOf(item.getNumeroLacre()),
                    item.getEstadoConservacao(),
                    locaisPorId.getOrDefault(item.getLocalId(), "-"),
                    tiposPorId.getOrDefault(item.getTipoId(), "-"),
                    item.getCaixaId() == null ? "Nenhuma" : caixasPorId.getOrDefault(item.getCaixaId(), "Caixa desconhecida"),
                    getSituacaoNome(item.getSituacaoId()),
                    item.getObservacao(),
                    item.getCaminhoFoto(),
                    nomeEntregador,
                    nomeResponsavel
            ));
        }

        return itensTabela;
    }

    private String formatarDescricaoCaixa(CaixaArmazenamento caixa) {
        String desc = caixa.getDescricao();
        if (desc == null || desc.trim().isEmpty()) {
            return "Caixa " + caixa.getNumero();
        }
        return "Caixa " + caixa.getNumero() + " - " + desc;
    }

    private String getSituacaoNome(int situacaoId) {
        switch (situacaoId) {
            case 1: return "No prazo";
            case 2: return "Vence hoje";
            case 3: return "Vencido";
            case 4: return "Devolvido";
            case 5: return "Finalizado";
            default: return "Desconhecida (" + situacaoId + ")";
        }
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

    private void abrirJanelaDetalhes(ItemTabela item) {
        Stage detalhesStage = new Stage();
        detalhesStage.setTitle("Detalhes do Item #" + item.getNumero());
        util.IconeUtil.aplicarIcone(detalhesStage);
        detalhesStage.setResizable(false);

        VBox root = new VBox(15);
        root.setPadding(new Insets(15));
        root.setAlignment(Pos.CENTER);
        root.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.2), 20, 0, 0, 10);"
        );

        VBox fotosBox = new VBox(10);
        fotosBox.setAlignment(Pos.CENTER);

        VBox boxCadastro = criarBoxFoto("Foto de Cadastro", item.getCaminhoFoto(), "cadastro");
        fotosBox.getChildren().add(boxCadastro);

        if ("Devolvido".equals(item.getSituacao())) {
            String caminhoDevolucao = buscarFotoDevolucao(item.getNumero());
            VBox boxDevolucao = criarBoxFoto("Foto de Devolução", caminhoDevolucao, "devolução");
            fotosBox.getChildren().add(boxDevolucao);
        }

        VBox infoBox = new VBox(12);
        infoBox.setAlignment(Pos.TOP_LEFT);

        Label tituloDetalhes = new Label("Detalhes do Item");
        tituloDetalhes.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane grid = new GridPane();
        grid.setHgap(15);
        grid.setVgap(6);
        grid.setAlignment(Pos.CENTER_LEFT);

        int row = 0;
        addDetailRow(grid, "Nº Registro", String.valueOf(item.getNumero()), row++);
        addDetailRow(grid, "Data", item.getData(), row++);
        addDetailRow(grid, "Nome", item.getNome(), row++);
        addDetailRow(grid, "Marca", item.getMarca(), row++);
        addDetailRow(grid, "Lacre", item.getLacre(), row++);
        addDetailRow(grid, "Estado", item.getEstado(), row++);
        addDetailRow(grid, "Local", item.getLocal(), row++);
        addDetailRow(grid, "Tipo", item.getTipo(), row++);
        addDetailRow(grid, "Caixa", item.getCaixa(), row++);
        addDetailRow(grid, "Situação", item.getSituacao(), row++);

        // Campo Entregue por
        String nomeEntregador = buscarNomeEntregador(item.getNumero());
        addDetailRow(grid, "Entregue por", nomeEntregador != null && !nomeEntregador.isEmpty() ? nomeEntregador : "Não informado", row++);

        // NOVO: Campo Cadastrado por
        String nomeResponsavel = buscarNomeResponsavel(item.getNumero());
        addDetailRow(grid, "Cadastrado por", nomeResponsavel != null && !nomeResponsavel.isEmpty() ? nomeResponsavel : "Não informado", row++);

        String assinaturaOperador = buscarAssinaturaOperador(item.getNumero());
        addDetailRow(grid, "Assinatura operador", assinaturaOperador != null && !assinaturaOperador.isEmpty() ? assinaturaOperador : "Não informado", row++);

        Label obsLabel = new Label("Observação:");
        obsLabel.setStyle("-fx-font-weight: bold; -fx-font-size: 14px; -fx-text-fill: #1E3A8A;");

        TextArea obsArea = new TextArea(item.getObservacao() != null ? item.getObservacao() : "Nenhuma observação registrada.");
        obsArea.setEditable(false);
        obsArea.setWrapText(true);
        obsArea.setPrefHeight(80);
        obsArea.setPrefWidth(320);
        obsArea.setStyle("-fx-background-color: #F8FAFC; -fx-border-color: #E2E8F0; -fx-border-width: 1; -fx-border-radius: 4; -fx-background-radius: 4; -fx-font-size: 12px;");

        infoBox.getChildren().addAll(tituloDetalhes, grid, obsLabel, obsArea);

        Button btnFechar = new Button("Fechar");
        btnFechar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb"));
        btnFechar.setOnMouseEntered(e -> btnFechar.setStyle(criarEstiloBotaoAcaoHover("#2563eb")));
        btnFechar.setOnMouseExited(e -> btnFechar.setStyle(criarEstiloBotaoAcao("#3B82F6", "#2563eb")));
        btnFechar.setOnAction(e -> detalhesStage.close());

        HBox botoesDetalhes = new HBox(10);
        botoesDetalhes.setAlignment(Pos.CENTER_LEFT);

        if (!"Devolvido".equals(item.getSituacao()) && !"Finalizado".equals(item.getSituacao())) {
            Button btnEntregar = new Button("Entregar");
            btnEntregar.setStyle(criarEstiloBotaoAcao("#10b981", "#059669"));
            btnEntregar.setOnMouseEntered(e -> btnEntregar.setStyle(criarEstiloBotaoAcaoHover("#059669")));
            btnEntregar.setOnMouseExited(e -> btnEntregar.setStyle(criarEstiloBotaoAcao("#10b981", "#059669")));
            btnEntregar.setOnAction(e -> {
                detalhesStage.close();
                abrirEntregaComItemSelecionado(item);
            });
            botoesDetalhes.getChildren().add(btnEntregar);
        }

        botoesDetalhes.getChildren().add(btnFechar);

        VBox rightBox = new VBox(15, infoBox, botoesDetalhes);
        rightBox.setAlignment(Pos.TOP_LEFT);

        HBox mainContent = new HBox(30, fotosBox, rightBox);
        mainContent.setAlignment(Pos.CENTER);

        root.getChildren().add(mainContent);

        Scene scene = new Scene(root, 700, 720);
        detalhesStage.setScene(scene);
        detalhesStage.show();
    }

    private VBox criarBoxFoto(String tituloTexto, String caminhoRelativo, String tipo) {
        VBox box = new VBox(8);
        box.setAlignment(Pos.CENTER);

        Label lbl = new Label(tituloTexto);
        lbl.setStyle("-fx-font-weight: bold; -fx-font-size: 14px; -fx-text-fill: #1E3A8A;");

        ImageView imageView = new ImageView();
        imageView.setFitWidth(280);
        imageView.setPreserveRatio(true);
        imageView.setSmooth(true);

        DropShadow shadow = new DropShadow();
        shadow.setColor(Color.rgb(0, 0, 0, 0.2));
        shadow.setRadius(10);
        shadow.setOffsetX(3);
        shadow.setOffsetY(3);
        imageView.setEffect(shadow);

        imageView.setImage(new Image("https://via.placeholder.com/280x280/cccccc/000000?text=Carregando..."));

        box.getChildren().addAll(lbl, imageView);

        if (caminhoRelativo == null || caminhoRelativo.trim().isEmpty()) {
            imageView.setImage(new Image("https://via.placeholder.com/280x280/cccccc/000000?text=Sem+Foto+" + tipo));
            return box;
        }

        Task<Image> carregarImagemTask = new Task<>() {
            @Override
            protected Image call() throws Exception {
                String caminhoNormalizado = caminhoRelativo.replace("/", File.separator).replace("\\", File.separator);
                String diretorioProjeto = System.getProperty("user.dir");
                String caminhoTentativa1 = diretorioProjeto + File.separator + caminhoNormalizado;
                String caminhoTentativa2 = diretorioProjeto + File.separator + "src" + File.separator + caminhoNormalizado;

                File arquivoFoto = new File(caminhoTentativa1);
                if (!arquivoFoto.exists() || !arquivoFoto.isFile()) {
                    arquivoFoto = new File(caminhoTentativa2);
                }

                if (arquivoFoto.exists() && arquivoFoto.isFile()) {
                    String uri = "file:///" + arquivoFoto.getAbsolutePath().replace("\\", "/");
                    return new Image(uri, true);
                } else {
                    return new Image("https://via.placeholder.com/280x280/ffcccc/000000?text=" + tipo + "+não+encontrada");
                }
            }

            @Override
            protected void succeeded() {
                imageView.setImage(getValue());
            }

            @Override
            protected void failed() {
                imageView.setImage(new Image("https://via.placeholder.com/280x280/ff0000/ffffff?text=Erro+ao+carregar"));
            }
        };

        new Thread(carregarImagemTask).start();

        return box;
    }

    private String buscarFotoDevolucao(int numeroRegistro) {
        int itemIdInterno = itemPerdidoController.getItemIdPorNumeroRegistro(numeroRegistro);

        if (itemIdInterno == -1) {
            return null;
        }

        List<Entrega> entregas = entregaController.listarEntregas();

        Entrega entrega = entregas.stream()
                .filter(e -> e.getItemId() == itemIdInterno)
                .findFirst()
                .orElse(null);

        if (entrega != null) {
            return entregaController.getCaminhoFotoEntrega(entrega.getId());
        }

        return null;
    }

    private void addDetailRow(GridPane grid, String labelText, String value, int row) {
        Label label = new Label(labelText + ":");
        label.setStyle("-fx-font-weight: bold; -fx-font-size: 14px; -fx-text-fill: #1E3A8A;");

        Label valueLabel = new Label(value != null && !value.trim().isEmpty() ? value : "—");
        valueLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #334155;");

        grid.add(label, 0, row);
        grid.add(valueLabel, 1, row);
    }

    /**
     * Busca o nome de quem entregou o item pelo número de registro
     */
    private String buscarNomeEntregador(int numeroRegistro) {
        try {
            int itemId = itemPerdidoController.getItemIdPorNumeroRegistro(numeroRegistro);
            if (itemId > 0) {
                ItemPerdido item = itemPerdidoController.buscarItemPorId(itemId);
                if (item != null) {
                    return item.getNomeEntregador();
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar nome do entregador: " + e.getMessage());
        }
        return null;
    }

    /**
     * NOVO: Busca o nome de quem cadastrou o item pelo número de registro
     */
    private String buscarNomeResponsavel(int numeroRegistro) {
        try {
            int itemId = itemPerdidoController.getItemIdPorNumeroRegistro(numeroRegistro);
            if (itemId > 0) {
                ItemPerdido item = itemPerdidoController.buscarItemPorId(itemId);
                if (item != null) {
                    return item.getResponsavelCadastro();
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar nome do responsável: " + e.getMessage());
        }
        return null;
    }

    private String buscarAssinaturaOperador(int numeroRegistro) {
        try {
            int itemId = itemPerdidoController.getItemIdPorNumeroRegistro(numeroRegistro);
            if (itemId > 0) {
                ItemPerdido item = itemPerdidoController.buscarItemPorId(itemId);
                if (item != null) {
                    return item.getAssinaturaOperador();
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao buscar assinatura do operador: " + e.getMessage());
        }
        return null;
    }

    private Stage getStage() {
        return (Stage) tabela.getScene().getWindow();
    }

    private static class CargaItensResultado {
        private final List<LocalShopping> locais;
        private final List<TipoObjeto> tipos;
        private final List<CaixaArmazenamento> caixas;
        private final List<ItemTabela> itens;

        private CargaItensResultado(List<LocalShopping> locais,
                                    List<TipoObjeto> tipos,
                                    List<CaixaArmazenamento> caixas,
                                    List<ItemTabela> itens) {
            this.locais = locais;
            this.tipos = tipos;
            this.caixas = caixas;
            this.itens = itens;
        }
    }

    public static class ItemTabela {
        private int numero;
        private String data;
        private String nome;
        private String marca;
        private String lacre;
        private String estado;
        private String local;
        private String tipo;
        private String caixa;
        private String situacao;
        private String observacao;
        private String caminhoFoto;
        private String nomeEntregador;
        private String nomeResponsavel;

        public ItemTabela(int numero, String data, String nome, String marca,
                          String lacre, String estado, String local, String tipo,
                          String caixa, String situacao, String observacao,
                          String caminhoFoto, String nomeEntregador, String nomeResponsavel) {
            this.numero = numero;
            this.data = data;
            this.nome = nome;
            this.marca = marca;
            this.lacre = lacre;
            this.estado = estado;
            this.local = local;
            this.tipo = tipo;
            this.caixa = caixa;
            this.situacao = situacao;
            this.observacao = observacao;
            this.caminhoFoto = caminhoFoto;
            this.nomeEntregador = nomeEntregador;
            this.nomeResponsavel = nomeResponsavel;
        }

        public int getNumero() { return numero; }
        public String getData() { return data; }
        public String getNome() { return nome; }
        public String getMarca() { return marca; }
        public String getLacre() { return lacre; }
        public String getEstado() { return estado; }
        public String getLocal() { return local; }
        public String getTipo() { return tipo; }
        public String getCaixa() { return caixa; }
        public String getSituacao() { return situacao; }
        public String getObservacao() { return observacao; }
        public String getCaminhoFoto() { return caminhoFoto; }
        public String getNomeEntregador() { return nomeEntregador; }
        public String getNomeResponsavel() { return nomeResponsavel; }
    }
}
