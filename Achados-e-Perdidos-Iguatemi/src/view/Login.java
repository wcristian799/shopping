package view;

import controller.UsuarioController;
import javafx.application.Application;
import javafx.concurrent.Task;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.stage.Stage;
import model.Usuario;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class Login extends Application {
    private UsuarioController usuarioController;

    public Login() {
        this.usuarioController = new UsuarioController();
    }

    @Override
    public void start(Stage stage) {
        stage.setTitle("Achados e Perdidos - Shopping Iguatemi");
        util.IconeUtil.aplicarIcone(stage);
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: linear-gradient(to bottom right, #1E3A8A, #3B82F6);");

        // Container principal com efeito de vidro (glass morphism) - REDUZIDO
        VBox centerBox = new VBox(15);
        centerBox.setAlignment(Pos.CENTER);
        centerBox.setPadding(new Insets(30, 35, 35, 35));
        centerBox.setMaxWidth(400);
        centerBox.setStyle(
                "-fx-background-color: rgba(255, 255, 255, 0.98);" +
                        "-fx-background-radius: 30;" +
                        "-fx-effect: dropshadow(gaussian, rgba(0,0,0,0.25), 30, 0, 0, 15);" +
                        "-fx-border-color: rgba(255,255,255,0.5);" +
                        "-fx-border-width: 1;" +
                        "-fx-border-radius: 30;"
        );

        // LOGO - AUMENTADA
        ImageView logoView = new ImageView();
        logoView.setFitWidth(140); // AUMENTADO: de 90 para 140
        logoView.setFitHeight(140); // AUMENTADO: de 90 para 140
        logoView.setPreserveRatio(true);
        logoView.setSmooth(true);
        logoView.setCache(true);

        try {
            File logoFile = new File("src/imagens/logo.png");
            if (logoFile.exists()) {
                FileInputStream fis = new FileInputStream(logoFile);
                Image logo = new Image(fis, 280, 280, true, true); // Tamanho de carregamento maior
                logoView.setImage(logo);
                System.out.println("Logo carregada com sucesso de: " + logoFile.getAbsolutePath());
            } else {
                System.out.println("Arquivo de logo não encontrado em: " + logoFile.getAbsolutePath());
                Label fallbackLogo = new Label("🏨");
                fallbackLogo.setStyle("-fx-font-size: 80px; -fx-text-fill: #1E3A8A;"); // Fallback também maior
                logoView = null;
            }
        } catch (FileNotFoundException e) {
            System.out.println("Erro ao carregar logo: " + e.getMessage());
            e.printStackTrace();
        }

        Text titulo = new Text("Bem-vindo de volta!");
        titulo.setFont(Font.font("System", FontWeight.BOLD, 22));

        Text subtitulo = new Text("Acesse sua conta para gerenciar os itens perdidos");
        subtitulo.setFont(Font.font("System", FontWeight.NORMAL, 12));

        VBox headerBox = new VBox(5);
        headerBox.setAlignment(Pos.CENTER);

        if (logoView != null) {
            headerBox.getChildren().add(logoView);
        } else {
            Label fallbackLogo = new Label("🏨");
            fallbackLogo.setStyle("-fx-font-size: 80px; -fx-text-fill: #1E3A8A;");
            headerBox.getChildren().add(fallbackLogo);
        }

        headerBox.getChildren().addAll(titulo, subtitulo);

        // Campos de entrada
        VBox emailBox = criarCampo("E-mail", "seu@email.com", true, false);
        VBox senhaBox = criarCampo("Senha", "••••••••", false, true);

        // BOTÃO DE LOGIN
        Button loginButton = new Button("Entrar");
        loginButton.setDefaultButton(true);
        loginButton.setMaxWidth(Double.MAX_VALUE);
        loginButton.setPrefHeight(50);
        loginButton.setStyle(
                "-fx-background-color: #1E3A8A;" +
                        "-fx-text-fill: white;" +
                        "-fx-font-size: 16px;" +
                        "-fx-font-weight: bold;" +
                        "-fx-background-radius: 15;" +
                        "-fx-cursor: hand;" +
                        "-fx-effect: dropshadow(gaussian, rgba(30,58,138,0.3), 10, 0, 0, 5);"
        );

        // Efeitos hover no botão
        loginButton.setOnMouseEntered(e ->
                loginButton.setStyle(
                        "-fx-background-color: #3B82F6;" +
                                "-fx-text-fill: white;" +
                                "-fx-font-size: 16px;" +
                                "-fx-font-weight: bold;" +
                                "-fx-background-radius: 15;" +
                                "-fx-cursor: hand;" +
                                "-fx-effect: dropshadow(gaussian, rgba(59,130,246,0.4), 15, 0, 0, 8);" +
                                "-fx-scale-x: 1.02;" +
                                "-fx-scale-y: 1.02;"
                )
        );

        loginButton.setOnMouseExited(e ->
                loginButton.setStyle(
                        "-fx-background-color: #1E3A8A;" +
                                "-fx-text-fill: white;" +
                                "-fx-font-size: 16px;" +
                                "-fx-font-weight: bold;" +
                                "-fx-background-radius: 15;" +
                                "-fx-cursor: hand;" +
                                "-fx-effect: dropshadow(gaussian, rgba(30,58,138,0.3), 10, 0, 0, 5);" +
                                "-fx-scale-x: 1;" +
                                "-fx-scale-y: 1;"
                )
        );

        loginButton.setOnAction(e -> {
            TextField emailField = (TextField) ((VBox) emailBox.getChildren().get(1)).getChildren().get(0);
            PasswordField senhaField = (PasswordField) ((VBox) senhaBox.getChildren().get(1)).getChildren().get(0);

            String email = emailField.getText().trim();
            String senha = senhaField.getText().trim();

            if (email.isEmpty() || senha.isEmpty()) {
                mostrarAlerta("Erro", "Por favor, preencha todos os campos", Alert.AlertType.ERROR);
                return;
            }

            loginButton.setDisable(true);
            loginButton.setText("Entrando...");
            emailField.setDisable(true);
            senhaField.setDisable(true);

            Task<Usuario> loginTask = new Task<>() {
                @Override
                protected Usuario call() {
                    return usuarioController.fazerLogin(email, senha);
                }
            };

            loginTask.setOnSucceeded(event -> {
                Usuario usuario = loginTask.getValue();
                if (usuario != null) {
                    try {
                        TelaPrincipal telaPrincipal = new TelaPrincipal(usuario);
                        telaPrincipal.start(new Stage());
                        stage.close();
                    } catch (Exception ex) {
                        restaurarFormularioLogin(loginButton, emailField, senhaField);
                        mostrarAlerta("Erro", "Erro ao abrir tela principal", Alert.AlertType.ERROR);
                    }
                } else {
                    restaurarFormularioLogin(loginButton, emailField, senhaField);
                    mostrarAlerta("Erro", "E-mail ou senha incorretos", Alert.AlertType.ERROR);
                }
            });

            loginTask.setOnFailed(event -> {
                restaurarFormularioLogin(loginButton, emailField, senhaField);
                Throwable erro = loginTask.getException();
                if (erro != null) {
                    erro.printStackTrace();
                }
                mostrarAlerta("Erro", "Erro ao fazer login", Alert.AlertType.ERROR);
            });

            Thread worker = new Thread(loginTask, "login-autenticacao");
            worker.setDaemon(true);
            worker.start();
        });

        centerBox.getChildren().addAll(
                headerBox,
                emailBox,
                senhaBox,
                loginButton
        );

        HBox centerContainer = new HBox(centerBox);
        centerContainer.setAlignment(Pos.CENTER);
        centerContainer.setPadding(new Insets(30));
        centerContainer.setMaxSize(Double.MAX_VALUE, Double.MAX_VALUE);

        root.setCenter(centerContainer);

        Scene scene = new Scene(root, 900, 600);
        stage.setScene(scene);
        stage.show();
    }

    private void restaurarFormularioLogin(Button loginButton, TextField emailField, PasswordField senhaField) {
        loginButton.setDisable(false);
        loginButton.setText("Entrar");
        emailField.setDisable(false);
        senhaField.setDisable(false);
    }

    private VBox criarCampo(String labelText, String placeholder, boolean isEmail, boolean isPassword) {
        VBox container = new VBox(5);
        container.setPrefWidth(300);

        Label label = new Label(labelText);
        label.setStyle(
                "-fx-font-size: 12px;" +
                        "-fx-font-weight: 600;" +
                        "-fx-text-fill: #1E293B;"
        );

        VBox inputContainer = new VBox();
        inputContainer.setStyle(
                "-fx-background-color: #F8FAFC;" +
                        "-fx-border-color: #E2E8F0;" +
                        "-fx-border-width: 2;" +
                        "-fx-border-radius: 15;" +
                        "-fx-background-radius: 15;" +
                        "-fx-padding: 2;"
        );

        Control input;
        if (isPassword) {
            PasswordField passwordField = new PasswordField();
            passwordField.setPromptText(placeholder);
            passwordField.setStyle(
                    "-fx-background-color: transparent;" +
                            "-fx-border-color: transparent;" +
                            "-fx-font-size: 12px;" +
                            "-fx-padding: 10 12;"
            );
            input = passwordField;
        } else {
            TextField textField = new TextField();
            textField.setPromptText(placeholder);
            if (isEmail) {
                textField.setPromptText("seu@email.com");
            }
            textField.setStyle(
                    "-fx-background-color: transparent;" +
                            "-fx-border-color: transparent;" +
                            "-fx-font-size: 12px;" +
                            "-fx-padding: 10 12;"
            );
            input = textField;
        }

        inputContainer.getChildren().add(input);

        // Efeito hover no campo
        inputContainer.setOnMouseEntered(e ->
                inputContainer.setStyle(
                        "-fx-background-color: #FFFFFF;" +
                                "-fx-border-color: #3B82F6;" +
                                "-fx-border-width: 2;" +
                                "-fx-border-radius: 15;" +
                                "-fx-background-radius: 15;" +
                                "-fx-padding: 2;" +
                                "-fx-effect: dropshadow(gaussian, rgba(59,130,246,0.2), 8, 0, 0, 3);"
                )
        );

        inputContainer.setOnMouseExited(e ->
                inputContainer.setStyle(
                        "-fx-background-color: #F8FAFC;" +
                                "-fx-border-color: #E2E8F0;" +
                                "-fx-border-width: 2;" +
                                "-fx-border-radius: 15;" +
                                "-fx-background-radius: 15;" +
                                "-fx-padding: 2;"
                )
        );

        container.getChildren().addAll(label, inputContainer);
        return container;
    }

    private void mostrarAlerta(String titulo, String mensagem, Alert.AlertType tipo) {
        Alert alert = new Alert(tipo);
        alert.setTitle(titulo);
        alert.setHeaderText(null);
        alert.setContentText(mensagem);

        DialogPane dialogPane = alert.getDialogPane();
        dialogPane.setStyle(
                "-fx-background-color: white;" +
                        "-fx-background-radius: 15;" +
                        "-fx-border-color: #E2E8F0;" +
                        "-fx-border-radius: 15;" +
                        "-fx-font-family: 'System';"
        );

        ButtonBar buttonBar = (ButtonBar) dialogPane.lookup(".button-bar");
        if (buttonBar != null) {
            buttonBar.setStyle("-fx-padding: 10;");
        }

        alert.showAndWait();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
