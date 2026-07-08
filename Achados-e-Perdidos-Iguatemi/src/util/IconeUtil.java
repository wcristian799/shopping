package util;

import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

public class IconeUtil {

    private static List<Image> icones = new ArrayList<>();
    private static boolean iconesCarregados = false;

    static {
        carregarIcones();
    }

    private static void carregarIcones() {
        try {
            File arquivo = new File("src/imagens/icon.png");
            if (!arquivo.exists()) {
                arquivo = new File("src/imagens/icon.ico");
            }

            if (!arquivo.exists()) {
                System.out.println("❌ Ícone não encontrado!");
                return;
            }

            // 🔴 SUBSTITUA AS LINHAS ABAIXO POR ESTA:

            // Carrega APENAS um tamanho específico (64x64)
            icones.add(new Image(new FileInputStream(arquivo), 128, 128, true, true));

            iconesCarregados = true;

        } catch (Exception e) {
            System.out.println("❌ Erro: " + e.getMessage());
        }
    }

    public static void aplicarIcone(Stage stage) {
        if (!icones.isEmpty()) {
            stage.getIcons().addAll(icones);
            System.out.println("✅ Ícone aplicado à janela: " + stage.getTitle());
        }
    }

    public static boolean isIconesCarregados() {
        return iconesCarregados;
    }
}