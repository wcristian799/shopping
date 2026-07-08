// app.ts
import express from "express";
import handlerRouter from "./routes/router";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PEGAR DO .env COM VERIFICAÇÃO
const CAMINHO_BASE_IMAGENS = process.env.IMAGENS_PATH;

if (!CAMINHO_BASE_IMAGENS) {
    console.error("❌ ERRO: A variável IMAGENS_PATH não está definida no arquivo .env!");
    console.error("📝 O servidor não pode iniciar sem essa configuração.");
    process.exit(1);
}

const CAMINHO_ITENS = path.join(CAMINHO_BASE_IMAGENS, "itens");
const CAMINHO_ENTREGAS = path.join(CAMINHO_BASE_IMAGENS, "entregas");

console.log(`🖼️ Servindo imagens de:`);
console.log(`📁 Base: ${CAMINHO_BASE_IMAGENS}`);
console.log(`📁 Itens: ${CAMINHO_ITENS}`);
console.log(`📁 Entregas: ${CAMINHO_ENTREGAS}`);

// Verificar se as pastas existem
if (!fs.existsSync(CAMINHO_ITENS)) {
    fs.mkdirSync(CAMINHO_ITENS, { recursive: true });
    console.log(`📁 Pasta itens criada: ${CAMINHO_ITENS}`);
}

if (!fs.existsSync(CAMINHO_ENTREGAS)) {
    fs.mkdirSync(CAMINHO_ENTREGAS, { recursive: true });
    console.log(`📁 Pasta entregas criada: ${CAMINHO_ENTREGAS}`);
}

// Servir imagens
app.use("/imagens", express.static(CAMINHO_BASE_IMAGENS));
app.use("/uploads", express.static(CAMINHO_BASE_IMAGENS));
app.use("/imagens/itens", express.static(CAMINHO_ITENS));
app.use("/uploads/itens", express.static(CAMINHO_ITENS));
app.use("/imagens/entregas", express.static(CAMINHO_ENTREGAS));
app.use("/uploads/entregas", express.static(CAMINHO_ENTREGAS));

// Rota dinâmica
app.get("/imagem/:filename", (req, res) => {
    const filename = req.params.filename;
    
    const possiblePaths = [
        path.join(CAMINHO_ITENS, filename),
        path.join(CAMINHO_ENTREGAS, filename),
        path.join(CAMINHO_BASE_IMAGENS, filename),
    ];

    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }

    res.status(404).json({ erro: "Imagem não encontrada" });
});

app.use(handlerRouter);

export default app;