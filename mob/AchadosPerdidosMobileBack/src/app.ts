import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import handlerRouter from "./routes/router";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CAMINHO_BASE_IMAGENS = process.env.IMAGENS_PATH || path.resolve(process.cwd(), "storage", "imagens");
const CAMINHO_ITENS = path.join(CAMINHO_BASE_IMAGENS, "itens");
const CAMINHO_ENTREGAS = path.join(CAMINHO_BASE_IMAGENS, "entregas");

console.log("Servindo imagens de:");
console.log(`Base: ${CAMINHO_BASE_IMAGENS}`);
console.log(`Itens: ${CAMINHO_ITENS}`);
console.log(`Entregas: ${CAMINHO_ENTREGAS}`);

if (!fs.existsSync(CAMINHO_ITENS)) {
    fs.mkdirSync(CAMINHO_ITENS, { recursive: true });
    console.log(`Pasta itens criada: ${CAMINHO_ITENS}`);
}

if (!fs.existsSync(CAMINHO_ENTREGAS)) {
    fs.mkdirSync(CAMINHO_ENTREGAS, { recursive: true });
    console.log(`Pasta entregas criada: ${CAMINHO_ENTREGAS}`);
}

app.use("/imagens", express.static(CAMINHO_BASE_IMAGENS));
app.use("/uploads", express.static(CAMINHO_BASE_IMAGENS));
app.use("/imagens/itens", express.static(CAMINHO_ITENS));
app.use("/uploads/itens", express.static(CAMINHO_ITENS));
app.use("/imagens/entregas", express.static(CAMINHO_ENTREGAS));
app.use("/uploads/entregas", express.static(CAMINHO_ENTREGAS));

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

    return res.status(404).json({ erro: "Imagem nao encontrada" });
});

app.use(handlerRouter);

export default app;
