package view;

import controller.UsuarioController;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import javafx.stage.Modality;

public class CadastroUsuario extends Application {

    private UsuarioController usuarioController;

    // Controle para evitar múltiplas janelas abertas
    private static Stage cadastroUsuarioStage = null;

    public CadastroUsuario() {
        this.usuarioController = new UsuarioController();
    }

    /**
     * Método estático para abrir a tela de cadastro de usuário de forma segura.
     * Se já estiver aberta, foca na janela existente.
     * @param owner Janela pai (para initOwner)
     */
    public static void abrirCadastroUsuario(Stage owner) {
        if (cadastroUsuarioStage != null && cadastroUsuarioStage.isShowing()) {
            cadastroUsuarioStage.toFront();
            cadastroUsuarioStage.requestFocus();
            return;
        }

        Stage novaStage = new Stage();
        novaStage.initOwner(owner);
        novaStage.initModality(Modality.WINDOW_MODAL);

        try {
            new CadastroUsuario().start(novaStage);
            cadastroUsuarioStage = novaStage;

            novaStage.setOnHidden(event -> cadastroUsuarioStage = null);
            novaStage.setOnCloseRequest(event -> cadastroUsuarioStage = null);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Cadastrar Novo Usuário");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: white;");

        VBox centerContent = criarConteudoCentral(stage);
        root.setCenter(centerContent);

        // REDUZIDO: Tamanho da janela
        Scene scene = new Scene(root, 450, 550);
        stage.setScene(scene);
        stage.setMinWidth(400);
        stage.setMinHeight(500);
        stage.show();
    }

    private VBox criarConteudoCentral(Stage stage) {
        // REDUZIDO: Padding e espaçamento
        VBox conteudo = new VBox(15);
        conteudo.setPadding(new Insets(15, 15, 15, 15));
        conteudo.setStyle(
                "-fx-background-color: white; " +
                        "-fx-background-radius: 20; " +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 20, 0, 0, 10);"
        );

        // REDUZIDO: Título de 28px para 22px
        Label titulo = new Label("Novo Usuário");
        titulo.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane grid = new GridPane();
        grid.setHgap(10); // REDUZIDO: de 15 para 10
        grid.setVgap(10); // REDUZIDO: de 15 para 10
        grid.setPadding(new Insets(5, 0, 5, 0)); // REDUZIDO: de 10 para 5
        grid.setAlignment(Pos.CENTER);

        // REDUZIDO: Padding e fonte dos campos
        String campoStyle =
                "-fx-background-color: white; " +
                        "-fx-border-color: #E2E8F0; " +
                        "-fx-border-width: 1; " +
                        "-fx-border-radius: 4; " +
                        "-fx-background-radius: 4; " +
                        "-fx-padding: 6 8; " + // REDUZIDO: de 8 10 para 6 8
                        "-fx-font-size: 12px;"; // REDUZIDO: de 14px para 12px

        TextField campoNome = new TextField();
        campoNome.setPromptText("Nome completo");
        campoNome.setPrefWidth(280); // REDUZIDO: de 350 para 280
        campoNome.setStyle(campoStyle);

        TextField campoEmail = new TextField();
        campoEmail.setPromptText("E-mail");
        campoEmail.setPrefWidth(280); // REDUZIDO: de 350 para 280
        campoEmail.setStyle(campoStyle);

        PasswordField campoSenha = new PasswordField();
        campoSenha.setPromptText("Senha");
        campoSenha.setPrefWidth(280); // REDUZIDO: de 350 para 280
        campoSenha.setStyle(campoStyle);

        PasswordField campoConfirmaSenha = new PasswordField();
        campoConfirmaSenha.setPromptText("Confirmar senha");
        campoConfirmaSenha.setPrefWidth(280); // REDUZIDO: de 350 para 280
        campoConfirmaSenha.setStyle(campoStyle);

        ComboBox<String> comboNivelAcesso = new ComboBox<>();
        comboNivelAcesso.getItems().addAll("Administrador", "Operador");
        comboNivelAcesso.setValue("Operador");
        comboNivelAcesso.setPrefWidth(280); // REDUZIDO: de 350 para 280
        estilizarComboBox(comboNivelAcesso);

        int row = 0;
        grid.add(criarLabel("Nome:"), 0, row);
        grid.add(campoNome, 1, row++);

        grid.add(criarLabel("E-mail:"), 0, row);
        grid.add(campoEmail, 1, row++);

        grid.add(criarLabel("Senha:"), 0, row);
        grid.add(campoSenha, 1, row++);

        grid.add(criarLabel("Confirmar senha:"), 0, row);
        grid.add(campoConfirmaSenha, 1, row++);

        grid.add(criarLabel("Nível de acesso:"), 0, row);
        grid.add(comboNivelAcesso, 1, row++);

        HBox botoes = new HBox(10); // REDUZIDO: de 15 para 10
        botoes.setAlignment(Pos.CENTER);
        botoes.setPadding(new Insets(10, 0, 0, 0)); // REDUZIDO: de 15 para 10

        Button btnSalvar = new Button("Cadastrar");
        btnSalvar.setPrefWidth(130); // REDUZIDO: de 150 para 130
        btnSalvar.setPrefHeight(35); // REDUZIDO: de 40 para 35
        btnSalvar.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " + // REDUZIDO: de 15px para 13px
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        );
        btnSalvar.setOnMouseEntered(e -> btnSalvar.setStyle(
                "-fx-background-color: #3B82F6; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        ));
        btnSalvar.setOnMouseExited(e -> btnSalvar.setStyle(
                "-fx-background-color: #1E3A8A; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        ));

        btnSalvar.setOnAction(e -> {
            try {
                String nome = campoNome.getText().trim();
                String email = campoEmail.getText().trim();
                String senha = campoSenha.getText();
                String confirma = campoConfirmaSenha.getText();
                String nivelStr = comboNivelAcesso.getValue();

                if (nome.isEmpty() || email.isEmpty() || senha.isEmpty() || confirma.isEmpty()) {
                    mostrarAlerta("Erro", "Preencha todos os campos obrigatórios", Alert.AlertType.ERROR);
                    return;
                }

                if (!senha.equals(confirma)) {
                    mostrarAlerta("Erro", "As senhas não coincidem", Alert.AlertType.ERROR);
                    return;
                }

                if (senha.length() < 6) {
                    mostrarAlerta("Erro", "A senha deve ter pelo menos 6 caracteres", Alert.AlertType.ERROR);
                    return;
                }

                int nivelAcessoId;
                switch (nivelStr) {
                    case "Administrador": nivelAcessoId = 1; break;
                    case "Operador":      nivelAcessoId = 2; break;
                    default: nivelAcessoId = 2;
                }

                boolean sucesso = usuarioController.cadastrarUsuario(nome, email, senha, nivelAcessoId);

                if (sucesso) {
                    mostrarAlerta("Sucesso", "Usuário cadastrado com sucesso!", Alert.AlertType.INFORMATION);
                    stage.close();
                } else {
                    mostrarAlerta("Erro", "Não foi possível cadastrar o usuário.\nVerifique se o e-mail já existe.", Alert.AlertType.ERROR);
                }
            } catch (Exception ex) {
                mostrarAlerta("Erro", "Erro inesperado: " + ex.getMessage(), Alert.AlertType.ERROR);
            }
        });

        Button btnCancelar = new Button("Cancelar");
        btnCancelar.setPrefWidth(130); // REDUZIDO: de 150 para 130
        btnCancelar.setPrefHeight(35); // REDUZIDO: de 40 para 35
        btnCancelar.setStyle(
                "-fx-background-color: #64748B; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " + // REDUZIDO: de 15px para 13px
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        );
        btnCancelar.setOnMouseEntered(e -> btnCancelar.setStyle(
                "-fx-background-color: #475569; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        ));
        btnCancelar.setOnMouseExited(e -> btnCancelar.setStyle(
                "-fx-background-color: #64748B; " +
                        "-fx-text-fill: white; " +
                        "-fx-background-radius: 4; " +
                        "-fx-font-size: 13px; " +
                        "-fx-font-weight: bold; " +
                        "-fx-cursor: hand;"
        ));
        btnCancelar.setOnAction(e -> stage.close());

        botoes.getChildren().addAll(btnSalvar, btnCancelar);

        conteudo.getChildren().addAll(titulo, grid, botoes);
        return conteudo;
    }

    private Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;"); // REDUZIDO: de 14px para 12px
        return label;
    }

    private void estilizarComboBox(ComboBox<String> comboBox) {
        // REDUZIDO: Padding e fonte
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

    public static void main(String[] args) {
        launch(args);
    }
}