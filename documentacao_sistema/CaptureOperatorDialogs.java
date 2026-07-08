import dao.OperadorDao;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.stage.Stage;
import model.Operador;

import java.lang.reflect.Method;

public class CaptureOperatorDialogs extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception {
        primaryStage.setTitle("CaptureOperatorDialogsHost");
        primaryStage.show();

        String mode = getParameters().getRaw().isEmpty() ? "cadastro" : getParameters().getRaw().get(0);
        Class<?> utilClass = Class.forName("view.OperadorSelectionUtil");

        if ("cadastro".equalsIgnoreCase(mode)) {
            Method method = utilClass.getDeclaredMethod("abrirCadastroOperador", Stage.class);
            method.setAccessible(true);
            method.invoke(null, primaryStage);
        } else if ("validacao".equalsIgnoreCase(mode)) {
            Operador operador = new OperadorDao().listarOperadores().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Nenhum operador encontrado para validacao."));
            Method method = utilClass.getDeclaredMethod("abrirValidacaoOperador", Stage.class, Operador.class);
            method.setAccessible(true);
            method.invoke(null, primaryStage, operador);
        } else {
            throw new IllegalArgumentException("Modo invalido: " + mode);
        }

        Platform.exit();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
