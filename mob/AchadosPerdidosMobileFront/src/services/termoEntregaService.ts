// src/services/termoEntregaService.ts (VERSÃO CORRIGIDA)
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Directory, Paths } from 'expo-file-system';

export type DadosTermo = {
  codigo: string;
  dataEntrega: string;
  proprietario: {
    nome: string;
    telefone: string;
    cpf?: string;
    rg?: string;
  };
  item: {
    nome: string;
    numeroRegistro: number;
    numeroLacre: number;
    marca?: string | null;
  };
  assinaturaBase64: string;
};

class TermoEntregaService {
  async gerarTermo(dados: DadosTermo): Promise<string> {
    try {
      console.log('📄 Gerando termo de entrega...');

      // Criar diretório para termos se não existir
      const termosDir = new Directory(Paths.document, 'termos');
      if (!termosDir.exists) {
        await termosDir.create({ intermediates: true });
      }

      // Remover o prefixo data:image/png;base64, se existir
      const assinaturaLimpa = dados.assinaturaBase64.replace(/^data:image\/\w+;base64,/, '');

      // Formatar telefone
      const telefoneFormatado = dados.proprietario.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      
      // Formatar CPF se existir
      const cpfFormatado = dados.proprietario.cpf 
        ? dados.proprietario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        : 'Não informado';
      
      // Formatar RG se existir
      const rgFormatado = dados.proprietario.rg || 'Não informado';

      // Criar HTML do termo
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              color: #333;
            }
            h1 { 
              color: #1E3A8A; 
              text-align: center;
              border-bottom: 2px solid #1E3A8A;
              padding-bottom: 10px;
            }
            .header {
              margin-bottom: 30px;
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
            }
            .section { 
              margin: 25px 0; 
            }
            .section-title { 
              color: #1E3A8A; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .data-row { 
              margin: 8px 0; 
              display: flex; 
            }
            .label { 
              font-weight: bold; 
              width: 140px; 
              color: #555; 
            }
            .value { 
              flex: 1; 
            }
            .signature { 
              margin: 30px 0; 
              text-align: center; 
              border: 2px dashed #1E3A8A; 
              padding: 20px; 
              background: #fafafa; 
            }
            .signature img { 
              max-width: 300px; 
              max-height: 100px; 
              margin: 10px 0; 
            }
            .declaration { 
              margin: 30px 0; 
              padding: 20px; 
              background: #f0f7ff; 
              text-align: center; 
              font-weight: bold; 
              border-radius: 5px; 
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #888; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <h1>TERMO DE ENTREGA</h1>
          
          <div class="header">
            <div class="data-row">
              <span class="label">Código:</span>
              <span class="value"><strong>${dados.codigo}</strong></span>
            </div>
            <div class="data-row">
              <span class="label">Data:</span>
              <span class="value">${dados.dataEntrega}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">DADOS DO PROPRIETÁRIO</div>
            <div class="data-row"><span class="label">Nome:</span> <span class="value">${dados.proprietario.nome}</span></div>
            <div class="data-row"><span class="label">Telefone:</span> <span class="value">${telefoneFormatado}</span></div>
            <div class="data-row"><span class="label">CPF:</span> <span class="value">${cpfFormatado}</span></div>
            <div class="data-row"><span class="label">RG:</span> <span class="value">${rgFormatado}</span></div>
          </div>
          
          <div class="section">
            <div class="section-title">DADOS DO ITEM</div>
            <div class="data-row"><span class="label">Item:</span> <span class="value">${dados.item.nome}</span></div>
            <div class="data-row"><span class="label">Nº Registro:</span> <span class="value">${dados.item.numeroRegistro}</span></div>
            <div class="data-row"><span class="label">Nº Lacre:</span> <span class="value">${dados.item.numeroLacre}</span></div>
            <div class="data-row"><span class="label">Marca:</span> <span class="value">${dados.item.marca || 'Não informada'}</span></div>
          </div>
          
          <div class="signature">
            <div class="section-title">ASSINATURA DIGITAL</div>
            <img src="data:image/png;base64,${assinaturaLimpa}" alt="Assinatura" />
            <div style="color: #888; margin-top: 10px;">Assinatura do proprietário</div>
          </div>
          
          <div class="declaration">
            DECLARO QUE RECEBI O OBJETO ACIMA DESCRITO EM PERFEITAS CONDIÇÕES.
          </div>
          
          <div class="footer">
            Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}<br>
            Sistema de Achados e Perdidos
          </div>
        </body>
        </html>
      `;

      // Gerar PDF temporário
      const { uri } = await Print.printToFileAsync({ html });
      
      // Criar arquivo temporário a partir da URI
      const tempFile = new File(uri);
      
      // Nome do arquivo final
      const fileName = `termo_entrega_${Date.now()}.pdf`;
      
      // Criar arquivo final no diretório de termos
      const finalFile = new File(termosDir, fileName);
      
      // Mover o arquivo (copia e depois deleta o original)
      await tempFile.move(finalFile);

      console.log('✅ PDF salvo em:', finalFile.uri);
      
      return finalFile.uri;
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      throw error;
    }
  }

  async visualizarPDF(pdfPath: string) {
    try {
      // Criar referência ao arquivo
      const file = new File(pdfPath);
      
      // Verificar se o arquivo existe
      if (!file.exists) {
        throw new Error('Arquivo não encontrado');
      }
      
      // Compartilhar/visualizar o PDF
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Termo de Entrega',
      });
    } catch (error) {
      console.error('❌ Erro ao visualizar PDF:', error);
      throw error;
    }
  }

  async listarPDFs(): Promise<File[]> {
    try {
      const termosDir = new Directory(Paths.document, 'termos');
      
      if (!termosDir.exists) {
        return [];
      }
      
      // Listar conteúdo do diretório
      const contents = termosDir.list();
      
      // Filtrar apenas arquivos PDF
      return contents.filter(item => 
        item instanceof File && item.name.endsWith('.pdf')
      ) as File[];
    } catch (error) {
      console.error('Erro ao listar PDFs:', error);
      return [];
    }
  }

  async excluirPDF(pdfPath: string): Promise<void> {
    try {
      const file = new File(pdfPath);
      if (file.exists) {
        await file.delete();
        console.log('✅ PDF excluído:', pdfPath);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir PDF:', error);
      throw error;
    }
  }
}

export const termoEntregaService = new TermoEntregaService();