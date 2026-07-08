package util;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

public class ConexaoDB {
    private String driver;
    private String url;
    private String usuario;
    private String senha;

    public ConexaoDB() {
        carregarConfiguracoes();
    }

    private void carregarConfiguracoes() {
        Properties props = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("config.properties")) {
            props.load(input);
            driver = props.getProperty("driver");
            url = props.getProperty("url");
            usuario = props.getProperty("usuario");
            senha = props.getProperty("senha");
        } catch (Exception e) {
            System.out.println("Erro ao carregar configurações: " + e.getMessage());
        }
    }

    public Connection conectar() {
        try {
            Class.forName(driver);
            return DriverManager.getConnection(url, usuario, senha);
        } catch (Exception e) {
            System.out.println("Erro ao conectar: " + e.getMessage());
            return null;
        }
    }
}
