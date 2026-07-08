// src/services/localService.ts
import api from './api';
import { ENDPOINTS } from '../constants/api';

export type Local = {
  id: number;
  nome: string;
  ativo: boolean;
};

class LocalService {
  async listarLocais(): Promise<Local[]> {
    try {
      const response = await api.get('/locais');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
      return [];
    }
  }

  async criarLocal(nome: string): Promise<Local> {
    const response = await api.post('/locais', { nome });
    return {
      id: response.data.id,
      nome: response.data.nome,
      ativo: true,
    };
  }
}

export const localService = new LocalService();
