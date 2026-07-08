package util;  // ou no pacote que preferir

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

public class SenhaUtil {

    private static final int SALT_LENGTH = 16;      // 128 bits
    private static final int ITERATIONS = 100_000;  // custo alto (lento para força bruta)
    private static final int KEY_LENGTH = 256;      // 256 bits

    /**
     * Gera hash da senha com salt aleatório usando PBKDF2
     */
    public static String hashSenha(String senha) {
        try {
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[SALT_LENGTH];
            random.nextBytes(salt);

            PBEKeySpec spec = new PBEKeySpec(senha.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");

            byte[] hash = skf.generateSecret(spec).getEncoded();

            // Formato: salt:hash (base64)
            return Base64.getEncoder().encodeToString(salt) + ":" +
                    Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Erro ao gerar hash da senha", e);
        }
    }

    /**
     * Verifica se a senha digitada corresponde ao hash armazenado
     */
    public static boolean verificarSenha(String senhaDigitada, String hashArmazenado) {
        try {
            String[] parts = hashArmazenado.split(":");
            if (parts.length != 2) return false;

            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] hashEsperado = Base64.getDecoder().decode(parts[1]);

            PBEKeySpec spec = new PBEKeySpec(senhaDigitada.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");

            byte[] hashCalculado = skf.generateSecret(spec).getEncoded();

            // Comparação segura (tempo constante)
            return MessageDigest.isEqual(hashCalculado, hashEsperado);
        } catch (Exception e) {
            return false; // qualquer erro → falha na autenticação
        }
    }
}