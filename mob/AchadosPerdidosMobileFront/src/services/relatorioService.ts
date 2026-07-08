// src/services/relatorioService.ts
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { File, Directory, Paths } from 'expo-file-system';
import api from './api';

class RelatorioService {
  async gerarPDFCompleto(dataInicio: string, dataFim: string, tipo: string = 'TODOS') {
    try {
      console.log('📄 Gerando PDF completo de', dataInicio, 'até', dataFim);

      const response = await api({
        method: 'GET',
        url: `/relatorios/gerar?dataInicio=${dataInicio}&dataFim=${dataFim}&formato=pdf&tipo=${tipo}`,
        responseType: 'arraybuffer',
      });

      const base64 = Buffer.from(response.data).toString('base64');

      const fileName = `relatorio_${dataInicio}_a_${dataFim}.pdf`;
      
      // Criar arquivo no diretório de cache
      const file = new File(Paths.cache, fileName);
      
      // Criar o arquivo se não existir
      if (!file.exists) {
        file.create();
      }
      
      // CORREÇÃO: Converter base64 para Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Escrever como bytes
      file.write(bytes);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Relatório PDF',
        });
      }

      return { success: true, filePath: file.uri };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }

  async gerarExcelCompleto(dataInicio: string, dataFim: string, tipo: string = 'TODOS') {
    try {
      console.log('📊 Gerando Excel completo de', dataInicio, 'até', dataFim);

      const response = await api({
        method: 'GET',
        url: `/relatorios/gerar?dataInicio=${dataInicio}&dataFim=${dataFim}&formato=excel&tipo=${tipo}`,
        responseType: 'arraybuffer',
      });

      const base64 = Buffer.from(response.data).toString('base64');

      const fileName = `relatorio_${dataInicio}_a_${dataFim}.xlsx`;
      
      // Criar arquivo no diretório de cache
      const file = new File(Paths.cache, fileName);
      
      if (!file.exists) {
        file.create();
      }
      
      // CORREÇÃO: Converter base64 para Uint8Array
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      file.write(bytes);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Relatório Excel',
        });
      }

      return { success: true, filePath: file.uri };
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      throw error;
    }
  }
}

export const relatorioService = new RelatorioService();
