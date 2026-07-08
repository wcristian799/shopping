// src/services/tipoService.ts
import api from './api';
import { ENDPOINTS } from '../constants/api';

export type TipoItem = {
  id: number;
  nome: string;
  prazo_dias: number;
};

class TipoService {
  async listarTipos(): Promise<TipoItem[]> {
    try {
      const response = await api.get('/tipos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      return [];
    }
  }

  async criarTipo(nome: string, prazo_dias: number): Promise<TipoItem> {
    const response = await api.post('/tipos', { nome, prazo_dias });
    return {
      id: response.data.id,
      nome: response.data.nome,
      prazo_dias: response.data.prazo_dias,
    };
  }
}

export const tipoService = new TipoService();
