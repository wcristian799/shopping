// controllers/imagemController.ts
import { Request, Response } from "express";
import imagemRepository from "../repositories/imagemRepository";
import fs from "fs";
import path from "path";

// CAMINHO ÚNICO para TODAS as imagens (APENAS ESTE LOCAL)
const CAMINHO_BASE_IMAGENS = "C:\\Users\\User\\Downloads\\Drop\\Achados-e-Perdidos-Iguatemi\\src\\imagens";
const CAMINHO_ITENS = path.join(CAMINHO_BASE_IMAGENS, "itens");
const CAMINHO_ENTREGAS = path.join(CAMINHO_BASE_IMAGENS, "entregas");

export async function uploadImagemItem(req: Request, res: Response) {
    const { item_id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ erro: "Nenhuma imagem enviada" });
    }

    try {
        // Usar o nome gerado pelo multer (já é único)
        const fileName = file.filename;
        
        // Caminho ÚNICO onde a imagem será salva
        const destinoFinal = path.join(CAMINHO_ITENS, fileName);
        
        console.log(`📸 Salvando imagem em: ${destinoFinal}`);
        console.log(`📸 Arquivo temporário em: ${file.path}`);
        
        // Criar diretório se não existir
        if (!fs.existsSync(CAMINHO_ITENS)) {
            fs.mkdirSync(CAMINHO_ITENS, { recursive: true });
            console.log(`📁 Pasta criada: ${CAMINHO_ITENS}`);
        }

        // Mover o arquivo diretamente para o local correto (não copiar)
        // Isso evita ter duas cópias da mesma imagem
        fs.renameSync(file.path, destinoFinal);
        
        console.log(`✅ Imagem movida com sucesso para: ${destinoFinal}`);
        
        // Salvar caminho RELATIVO no banco (formato que o desktop espera)
        const caminhoRelativo = `src/imagens/itens/${fileName}`;
        
        const imagemId = await imagemRepository.salvarImagem(caminhoRelativo);
        await imagemRepository.associarImagemItem(imagemId, parseInt(item_id));

        return res.status(201).json({
            mensagem: "Imagem salva com sucesso",
            imagem_id: imagemId,
            caminho: caminhoRelativo
        });

    } catch (error) {
        console.error("❌ Erro ao salvar imagem:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function uploadImagemEntrega(req: Request, res: Response) {
    const { entrega_id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ erro: "Nenhuma imagem enviada" });
    }

    try {
        const fileName = file.filename;
        const destinoFinal = path.join(CAMINHO_ENTREGAS, fileName);
        
        console.log(`📸 Salvando imagem de entrega em: ${destinoFinal}`);
        console.log(`📸 Arquivo temporário em: ${file.path}`);
        
        if (!fs.existsSync(CAMINHO_ENTREGAS)) {
            fs.mkdirSync(CAMINHO_ENTREGAS, { recursive: true });
            console.log(`📁 Pasta criada: ${CAMINHO_ENTREGAS}`);
        }

        // Mover (não copiar) o arquivo
        fs.renameSync(file.path, destinoFinal);
        
        console.log(`✅ Imagem de entrega movida com sucesso para: ${destinoFinal}`);
        
        const caminhoRelativo = `src/imagens/entregas/${fileName}`;
        
        const imagemId = await imagemRepository.salvarImagem(caminhoRelativo);
        await imagemRepository.associarImagemEntrega(imagemId, parseInt(entrega_id));

        return res.status(201).json({
            mensagem: "Imagem salva com sucesso",
            imagem_id: imagemId,
            caminho: caminhoRelativo
        });

    } catch (error) {
        console.error("❌ Erro ao salvar imagem de entrega:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function listarImagensItem(req: Request, res: Response) {
    const { item_id } = req.params;

    try {
        const imagens = await imagemRepository.buscarImagensPorItemId(parseInt(item_id));
        return res.status(200).json(imagens);
    } catch (error) {
        console.error("Erro ao listar imagens:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}

export async function listarImagensEntrega(req: Request, res: Response) {
    const { entrega_id } = req.params;

    try {
        const imagens = await imagemRepository.buscarImagensPorEntregaId(parseInt(entrega_id));
        return res.status(200).json(imagens);
    } catch (error) {
        console.error("Erro ao listar imagens:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
}