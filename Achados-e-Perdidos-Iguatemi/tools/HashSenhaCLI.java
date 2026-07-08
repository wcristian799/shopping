import util.SenhaUtil;

public class HashSenhaCLI {
    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Uso: java HashSenhaCLI <senha>");
            System.exit(1);
        }
        System.out.print(SenhaUtil.hashSenha(args[0]));
    }
}

