// utils/senha.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT = 10;

// Função para validar senha do Java (PBKDF2)
function validarSenhaJava(senha: string, hashCompleto: string): boolean {
    try {
        // O formato é: "salt:hash" em base64
        const [saltBase64, hashBase64] = hashCompleto.split(':');
        
        if (!saltBase64 || !hashBase64) {
            return false;
        }
        
        const salt = Buffer.from(saltBase64, 'base64');
        const hashEsperado = Buffer.from(hashBase64, 'base64');
        
        // PBKDF2 com os mesmos parâmetros do Java
        const hashCalculado = crypto.pbkdf2Sync(
            senha,
            salt,
            100000, // ITERATIONS do Java
            32,     // KEY_LENGTH (256 bits = 32 bytes)
            'sha256'
        );
        
        // Comparação segura (tempo constante)
        return crypto.timingSafeEqual(hashCalculado, hashEsperado);
    } catch (error) {
        console.error("Erro ao validar senha Java:", error);
        return false;
    }
}

export async function gerarSenha(senha: string) {
    // Para novos usuários, usamos bcrypt (mais padrão)
    return bcrypt.hash(senha, SALT);
}

export async function validarSenha(senha: string, hash: string) {
    console.log("Tipo de hash detectado:");
    
    // Caso 1: Hash do Java (PBKDF2 com salt) - contém ":"
    if (hash.includes(':')) {
        console.log("📌 Hash no formato Java (PBKDF2)");
        return validarSenhaJava(senha, hash);
    }
    
    // Caso 2: Hash bcrypt - começa com $2b$ ou $2y$
    if (hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
        console.log("📌 Hash bcrypt detectado");
        const hashNormal = hash.replace("$2y$", "$2b$");
        return bcrypt.compare(senha, hashNormal);
    }
    
    // Caso 3: Senha em texto puro (APENAS PARA TESTES!)
    console.log("⚠️  Senha em texto puro detectada!");
    return senha === hash;
}