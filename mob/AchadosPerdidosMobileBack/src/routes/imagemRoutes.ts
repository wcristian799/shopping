// routes/imagemRoutes.ts
import { Router } from "express";
import { 
    uploadImagemItem,
    uploadImagemEntrega,
    listarImagensItem,
    listarImagensEntrega
} from "../controllers/imagemController";
import { middleware } from "./jwtMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// PEGAR O CAMINHO DO .env COM VERIFICAÇÃO
const CAMINHO_BASE_IMAGENS = process.env.IMAGENS_PATH;

// VERIFICAR SE A VARIÁVEL EXISTE
if (!CAMINHO_BASE_IMAGENS) {
    console.error("\n❌ ERRO CRÍTICO: A variável IMAGENS_PATH não está definida no arquivo .env!");
    console.error("📝 Adicione esta linha no seu arquivo .env:");
    console.error('IMAGENS_PATH=C:\\Users\\User\\Downloads\\Projeto\\src\\imagens');
    console.error("\n🛑 O servidor não pode iniciar sem essa configuração.\n");
    process.exit(1); // Encerra o servidor
}

// Agora podemos usar com segurança
const CAMINHO_ITENS = path.join(CAMINHO_BASE_IMAGENS, "itens");
const CAMINHO_ENTREGAS = path.join(CAMINHO_BASE_IMAGENS, "entregas");

console.log(`\n📁 Configuração de imagens:`);
console.log(`📁 Base: ${CAMINHO_BASE_IMAGENS}`);
console.log(`📁 Itens: ${CAMINHO_ITENS}`);
console.log(`📁 Entregas: ${CAMINHO_ENTREGAS}`);

// VERIFICAR SE O CAMINHO BASE EXISTE
if (!fs.existsSync(CAMINHO_BASE_IMAGENS)) {
    console.log(`⚠️ Criando pasta base: ${CAMINHO_BASE_IMAGENS}`);
    fs.mkdirSync(CAMINHO_BASE_IMAGENS, { recursive: true });
}

// VERIFICAR SE A PASTA DE ITENS EXISTE
if (!fs.existsSync(CAMINHO_ITENS)) {
    console.log(`📁 Criando pasta itens: ${CAMINHO_ITENS}`);
    fs.mkdirSync(CAMINHO_ITENS, { recursive: true });
}

// VERIFICAR SE A PASTA DE ENTREGAS EXISTE
if (!fs.existsSync(CAMINHO_ENTREGAS)) {
    console.log(`📁 Criando pasta entregas: ${CAMINHO_ENTREGAS}`);
    fs.mkdirSync(CAMINHO_ENTREGAS, { recursive: true });
}

// Configurar multer para salvar DIRETAMENTE em itens
const storageItem = multer.diskStorage({
    destination: (req, file, cb) => {
        // Garantir que a pasta existe (já verificamos acima, mas vamos garantir)
        if (!fs.existsSync(CAMINHO_ITENS)) {
            fs.mkdirSync(CAMINHO_ITENS, { recursive: true });
        }
        cb(null, CAMINHO_ITENS);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + "-" + uniqueSuffix + ext;
        console.log(`📸 Salvando imagem em: ${path.join(CAMINHO_ITENS, filename)}`);
        cb(null, filename);
    }
});

// Configurar multer para salvar DIRETAMENTE em entregas
const storageEntrega = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(CAMINHO_ENTREGAS)) {
            fs.mkdirSync(CAMINHO_ENTREGAS, { recursive: true });
        }
        cb(null, CAMINHO_ENTREGAS);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + "-" + uniqueSuffix + ext;
        console.log(`📸 Salvando imagem de entrega em: ${path.join(CAMINHO_ENTREGAS, filename)}`);
        cb(null, filename);
    }
});

// Configuração comum de validação
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, gif)"));
    }
};

const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

const uploadItem = multer({ 
    storage: storageItem,
    limits,
    fileFilter
});

const uploadEntrega = multer({ 
    storage: storageEntrega,
    limits,
    fileFilter
});

const rotaImagem = Router();
rotaImagem.use(middleware);

// Rotas para imagens de itens
rotaImagem.post("/item/:item_id", uploadItem.single("imagem"), uploadImagemItem);
rotaImagem.get("/item/:item_id", listarImagensItem);

// Rotas para imagens de entregas
rotaImagem.post("/entrega/:entrega_id", uploadEntrega.single("imagem"), uploadImagemEntrega);
rotaImagem.get("/entrega/:entrega_id", listarImagensEntrega);

// Rota de diagnóstico
rotaImagem.get("/debug", (req, res) => {
    const stats = {
        caminhoBase: CAMINHO_BASE_IMAGENS,
        caminhoItens: CAMINHO_ITENS,
        caminhoEntregas: CAMINHO_ENTREGAS,
        itensExiste: fs.existsSync(CAMINHO_ITENS),
        entregasExiste: fs.existsSync(CAMINHO_ENTREGAS),
        itensArquivos: fs.existsSync(CAMINHO_ITENS) ? fs.readdirSync(CAMINHO_ITENS).length : 0,
        entregasArquivos: fs.existsSync(CAMINHO_ENTREGAS) ? fs.readdirSync(CAMINHO_ENTREGAS).length : 0,
        env: {
            IMAGENS_PATH: process.env.IMAGENS_PATH
        }
    };
    
    console.log('📊 Diagnóstico de imagens:', stats);
    res.json(stats);
});

export default rotaImagem;