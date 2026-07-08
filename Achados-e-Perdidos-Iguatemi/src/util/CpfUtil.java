package util;

public class CpfUtil {

    public static String somenteDigitos(String cpf) {
        if (cpf == null) {
            return "";
        }
        return cpf.replaceAll("\\D", "");
    }

    public static boolean isCpfValido(String cpf) {
        String digitos = somenteDigitos(cpf);
        if (digitos.length() != 11 || digitos.matches("(\\d)\\1{10}")) {
            return false;
        }

        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += Character.getNumericValue(digitos.charAt(i)) * (10 - i);
        }
        int primeiroDigito = 11 - (soma % 11);
        if (primeiroDigito >= 10) {
            primeiroDigito = 0;
        }

        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += Character.getNumericValue(digitos.charAt(i)) * (11 - i);
        }
        int segundoDigito = 11 - (soma % 11);
        if (segundoDigito >= 10) {
            segundoDigito = 0;
        }

        return primeiroDigito == Character.getNumericValue(digitos.charAt(9))
                && segundoDigito == Character.getNumericValue(digitos.charAt(10));
    }

    public static String ultimosQuatro(String cpf) {
        String digitos = somenteDigitos(cpf);
        if (digitos.length() < 4) {
            return digitos;
        }
        return digitos.substring(digitos.length() - 4);
    }
}
