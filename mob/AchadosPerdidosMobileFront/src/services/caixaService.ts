// src/services/caixaService.ts
import api from './api';
import { ENDPOINTS } from '../constants/api';

export type Caixa = {
  id: number;
  numero: number;
  descricao: string;
  ativo: boolean;
};

class CaixaService {
  async listarCaixas(): Promise<Caixa[]> {
    try {
      const response = await api.get('/caixas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar caixas:', error);
      return [];
    }
  }

  async criarCaixa(numero: number, descricao: string): Promise<Caixa> {
    const response = await api.post('/caixas', { numero, descricao });
    return {
      id: response.data.id,
      numero: response.data.numero,
      descricao: response.data.descricao,
      ativo: true,
    };
  }
}

export const caixaService = new CaixaService();
