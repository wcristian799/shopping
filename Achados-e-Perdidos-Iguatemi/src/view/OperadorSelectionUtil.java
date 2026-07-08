package view;

import dao.OperadorDao;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import model.Operador;
import util.CpfUtil;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class OperadorSelectionUtil {
    private static final String ADD_OPTION = "+ Cadastrar operador";

    public static class OperadorSelecionado {
        private final Operador operador;
        private final String assinatura;

        public OperadorSelecionado(Operador operador, String assinatura) {
            this.operador = operador;
            this.assinatura = assinatura;
        }

        public Operador getOperador() {
            return operador;
        }

        public String getAssinatura() {
            return assinatura;
        }
    }

    public static void configurar(
            ComboBox<String> comboOperador,
            Button btnAdicionar,
            Stage owner,
            Consumer<OperadorSelecionado> onSelecionado
    ) {
        OperadorDao operadorDao = new OperadorDao();
        Map<String, Operador> operadoresPorOpcao = new LinkedHashMap<>();
        boolean[] atualizando = {false};
        OperadorSelecionado[] selecaoAtual = new OperadorSelecionado[1];

        Runnable carregar = () -> {
            atualizando[0] = true;
            operadoresPorOpcao.clear();
            ObservableList<String> opcoes = FXCollections.observableArrayList();
            List<Operador> operadores = operadorDao.listarOperadores();
            for (Operador operador : operadores) {
                String opcao = criarOpcao(operador);
                operadoresPorOpcao.put(opcao, operador);
                opcoes.add(opcao);
            }
            opcoes.add(ADD_OPTION);
            comboOperador.setItems(opcoes);
            atualizando[0] = false;
        };

        carregar.run();

        Runnable validarTextoDigitado = () -> {
            if (atualizando[0] || selecaoAtual[0] != null) {
                return;
            }

            String texto = comboOperador.getEditor().getText();
            Operador operador = buscarOperadorPorTextoDigitado(texto, operadoresPorOpcao);
            if (operador != null) {
                validarESelecionar(comboOperador, operador, owner, onSelecionado, atualizando, selecaoAtual);
            }
        };

        comboOperador.getEditor().setOnAction(e -> validarTextoDigitado.run());
        comboOperador.focusedProperty().addListener((obs, estavaFocado, estaFocado) -> {
            if (!estaFocado) {
                validarTextoDigitado.run();
            }
        });

        comboOperador.getEditor().textProperty().addListener((obs, oldValue, newValue) -> {
            if (atualizando[0]) {
                return;
            }

            String texto = newValue == null ? "" : newValue.trim();
            if (selecaoAtual[0] != null && textoConfereOperadorValidado(texto, selecaoAtual[0].getOperador())) {
                return;
            }

            selecaoAtual[0] = null;
            comboOperador.setTooltip(null);
            onSelecionado.accept(null);

            String termo = texto.toLowerCase();
            ObservableList<String> filtrados = FXCollections.observableArrayList();
            for (String opcao : operadoresPorOpcao.keySet()) {
                if (termo.isEmpty() || opcao.toLowerCase().contains(termo)) {
                    filtrados.add(opcao);
                }
            }
            filtrados.add(ADD_OPTION);

            atualizando[0] = true;
            comboOperador.setItems(filtrados);
            atualizando[0] = false;

            if (!termo.isEmpty()) {
                comboOperador.show();
            }
        });

        comboOperador.valueProperty().addListener((obs, oldValue, newValue) -> {
            if (atualizando[0] || newValue == null || newValue.trim().isEmpty()) {
                return;
            }

            if (selecaoAtual[0] != null && newValue.equals(criarOpcao(selecaoAtual[0].getOperador()))) {
                return;
            }

            if (ADD_OPTION.equals(newValue)) {
                Operador operadorCriado = abrirCadastroOperador(owner);
                carregar.run();
                if (operadorCriado != null) {
                    validarESelecionar(comboOperador, operadorCriado, owner, onSelecionado, atualizando, selecaoAtual);
                } else {
                    limpar(comboOperador, onSelecionado, atualizando, selecaoAtual);
                }
                return;
            }

            Operador operador = operadoresPorOpcao.get(newValue);
            if (operador != null) {
                validarESelecionar(comboOperador, operador, owner, onSelecionado, atualizando, selecaoAtual);
            }
        });

        btnAdicionar.setOnAction(e -> {
            Operador operadorCriado = abrirCadastroOperador(owner);
            carregar.run();
            if (operadorCriado != null) {
                validarESelecionar(comboOperador, operadorCriado, owner, onSelecionado, atualizando, selecaoAtual);
            }
        });
    }

    private static void validarESelecionar(
            ComboBox<String> comboOperador,
            Operador operador,
            Stage owner,
            Consumer<OperadorSelecionado> onSelecionado,
            boolean[] atualizando,
            OperadorSelecionado[] selecaoAtual
    ) {
        OperadorSelecionado selecionado = abrirValidacaoOperador(owner, operador);
        if (selecionado == null) {
            limpar(comboOperador, onSelecionado, atualizando, selecaoAtual);
            return;
        }

        atualizando[0] = true;
        String opcao = criarOpcao(operador);
        comboOperador.setValue(opcao);
        comboOperador.getEditor().setText(opcao);
        comboOperador.setTooltip(new Tooltip("Operador validado com CPF e assinatura."));
        atualizando[0] = false;
        selecaoAtual[0] = selecionado;
        onSelecionado.accept(selecionado);
    }

    private static void limpar(ComboBox<String> comboOperador, Consumer<OperadorSelecionado> onSelecionado, boolean[] atualizando, OperadorSelecionado[] selecaoAtual) {
        atualizando[0] = true;
        comboOperador.setValue(null);
        comboOperador.getEditor().clear();
        comboOperador.setTooltip(null);
        atualizando[0] = false;
        selecaoAtual[0] = null;
        onSelecionado.accept(null);
    }

    private static Operador abrirCadastroOperador(Stage owner) {
        Stage dialog = new Stage();
        dialog.setTitle("Cadastrar operador");
        util.IconeUtil.aplicarIcone(dialog);
        dialog.initOwner(owner);
        dialog.initModality(Modality.WINDOW_MODAL);
        dialog.setResizable(false);

        VBox root = new VBox(14);
        root.setPadding(new Insets(18));
        root.setStyle("-fx-background-color: white;");

        Label titulo = new Label("Cadastrar operador");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);

        TextField campoNome = new TextField();
        campoNome.setPromptText("Nome completo");
        campoNome.setPrefWidth(280);

        TextField campoCpf = new TextField();
        campoCpf.setPromptText("CPF completo");

        DatePicker dataNascimento = new DatePicker();
        dataNascimento.setPromptText("Data de nascimento");
        dataNascimento.setPrefWidth(280);

        grid.add(criarLabel("Nome completo:"), 0, 0);
        grid.add(campoNome, 1, 0);
        grid.add(criarLabel("CPF:"), 0, 1);
        grid.add(campoCpf, 1, 1);
        grid.add(criarLabel("Nascimento:"), 0, 2);
        grid.add(dataNascimento, 1, 2);

        Operador[] operadorCriado = new Operador[1];

        Button btnSalvar = criarBotao("Cadastrar", "#1E3A8A");
        Button btnCancelar = criarBotao("Cancelar", "#64748B");
        btnCancelar.setOnAction(e -> dialog.close());

        btnSalvar.setOnAction(e -> {
            String nome = campoNome.getText().trim();
            String cpf = CpfUtil.somenteDigitos(campoCpf.getText());
            LocalDate nascimento = dataNascimento.getValue();

            if (nome.isEmpty() || cpf.isEmpty() || nascimento == null) {
                mostrarAlerta("Erro", "Preencha nome completo, CPF e data de nascimento.", Alert.AlertType.ERROR);
                return;
            }

            if (!CpfUtil.isCpfValido(cpf)) {
                mostrarAlerta("Erro", "CPF invalido.", Alert.AlertType.ERROR);
                return;
            }

            OperadorDao dao = new OperadorDao();
            if (dao.buscarPorCpf(cpf) != null) {
                mostrarAlerta("Erro", "Ja existe um operador cadastrado com esse CPF.", Alert.AlertType.ERROR);
                return;
            }

            Operador operador = new Operador();
            operador.setNomeCompleto(nome);
            operador.setCpf(cpf);
            operador.setDataNascimento(java.util.Date.from(nascimento.atStartOfDay(ZoneId.systemDefault()).toInstant()));

            int id = dao.inserirOperador(operador);
            if (id <= 0) {
                mostrarAlerta("Erro", "Nao foi possivel cadastrar o operador.", Alert.AlertType.ERROR);
                return;
            }

            operador.setId(id);
            operadorCriado[0] = operador;
            dialog.close();
        });

        HBox botoes = new HBox(10, btnSalvar, btnCancelar);
        botoes.setAlignment(Pos.CENTER);

        root.getChildren().addAll(titulo, grid, botoes);

        dialog.setScene(new Scene(root, 420, 240));
        dialog.showAndWait();
        return operadorCriado[0];
    }

    private static OperadorSelecionado abrirValidacaoOperador(Stage owner, Operador operador) {
        Stage dialog = new Stage();
        dialog.setTitle("Validar operador");
        util.IconeUtil.aplicarIcone(dialog);
        dialog.initOwner(owner);
        dialog.initModality(Modality.WINDOW_MODAL);
        dialog.setResizable(false);

        VBox root = new VBox(14);
        root.setPadding(new Insets(18));
        root.setStyle("-fx-background-color: white;");

        Label titulo = new Label("Validar operador");
        titulo.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        Label nomeOperador = new Label(operador.getNomeCompleto());
        nomeOperador.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #334155;");

        TextField campoCpf = new TextField();
        campoCpf.setPromptText("Digite o CPF para confirmar");
        campoCpf.setPrefWidth(280);

        TextField campoAssinatura = new TextField();
        campoAssinatura.setPromptText("Assinatura do operador");

        OperadorSelecionado[] selecionado = new OperadorSelecionado[1];

        Button btnConfirmar = criarBotao("Confirmar", "#1E3A8A");
        Button btnCancelar = criarBotao("Cancelar", "#64748B");
        btnCancelar.setOnAction(e -> dialog.close());

        btnConfirmar.setOnAction(e -> {
            String cpf = campoCpf.getText().trim();
            String assinatura = campoAssinatura.getText().trim();

            if (cpf.isEmpty() || assinatura.isEmpty()) {
                mostrarAlerta("Erro", "Informe o CPF e a assinatura do operador.", Alert.AlertType.ERROR);
                return;
            }

            OperadorDao dao = new OperadorDao();
            if (!dao.validarCpfOperador(operador.getId(), cpf)) {
                mostrarAlerta("Erro", "CPF nao confere com o operador selecionado.", Alert.AlertType.ERROR);
                return;
            }

            selecionado[0] = new OperadorSelecionado(operador, assinatura);
            dialog.close();
        });

        HBox botoes = new HBox(10, btnConfirmar, btnCancelar);
        botoes.setAlignment(Pos.CENTER);

        root.getChildren().addAll(titulo, nomeOperador, campoCpf, campoAssinatura, botoes);
        dialog.setScene(new Scene(root, 400, 250));
        dialog.showAndWait();
        return selecionado[0];
    }

    private static Label criarLabel(String texto) {
        Label label = new Label(texto);
        label.setStyle("-fx-font-weight: 600; -fx-text-fill: #1E3A8A; -fx-font-size: 12px;");
        return label;
    }

    private static Button criarBotao(String texto, String cor) {
        Button botao = new Button(texto);
        botao.setPrefWidth(120);
        botao.setStyle("-fx-background-color: " + cor + "; -fx-text-fill: white; -fx-font-weight: bold; -fx-background-radius: 4; -fx-padding: 8 12; -fx-cursor: hand;");
        return botao;
    }

    private static void mostrarAlerta(String titulo, String mensagem, Alert.AlertType tipo) {
        Alert alert = new Alert(tipo);
        alert.setTitle(titulo);
        alert.setHeaderText(null);
        alert.setContentText(mensagem);
        alert.showAndWait();
    }

    private static String criarOpcao(Operador operador) {
        return operador.getNomeCompleto() + " - CPF final " + CpfUtil.ultimosQuatro(operador.getCpf());
    }

    private static Operador buscarOperadorPorTextoDigitado(String texto, Map<String, Operador> operadoresPorOpcao) {
        if (texto == null || texto.trim().isEmpty()) {
            return null;
        }

        String termo = texto.trim().toLowerCase();
        for (Map.Entry<String, Operador> entry : operadoresPorOpcao.entrySet()) {
            Operador operador = entry.getValue();
            String nome = operador.getNomeCompleto() == null ? "" : operador.getNomeCompleto().trim().toLowerCase();
            if (entry.getKey().toLowerCase().equals(termo) || nome.equals(termo)) {
                return operador;
            }
        }

        if (termo.length() < 3) {
            return null;
        }

        Operador candidatoUnico = null;
        for (Map.Entry<String, Operador> entry : operadoresPorOpcao.entrySet()) {
            Operador operador = entry.getValue();
            String nome = operador.getNomeCompleto() == null ? "" : operador.getNomeCompleto().trim().toLowerCase();
            if (entry.getKey().toLowerCase().contains(termo) || nome.contains(termo)) {
                if (candidatoUnico != null && candidatoUnico.getId() != operador.getId()) {
                    return null;
                }
                candidatoUnico = operador;
            }
        }

        return candidatoUnico;
    }

    private static boolean textoConfereOperadorValidado(String texto, Operador operador) {
        if (texto == null || texto.trim().isEmpty() || operador == null) {
            return false;
        }

        String textoNormalizado = texto.trim();
        String nome = operador.getNomeCompleto() == null ? "" : operador.getNomeCompleto().trim();
        return textoNormalizado.equalsIgnoreCase(nome)
                || textoNormalizado.equalsIgnoreCase(criarOpcao(operador));
    }
}
