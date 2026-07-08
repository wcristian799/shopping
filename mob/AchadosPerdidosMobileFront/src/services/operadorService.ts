import api from './api';

export type Operador = {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  ativo: boolean;
};

class OperadorService {
  async listarOperadores(): Promise<Operador[]> {
    try {
      const response = await api.get('/operadores');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar operadores:', error);
      return [];
    }
  }

  async criarOperador(dados: { nome_completo: string; cpf: string; data_nascimento: string }): Promise<number> {
    const response = await api.post('/operadores', dados);
    return response.data.id;
  }

  async validarOperador(operador_id: number, cpf: string): Promise<void> {
    await api.post('/operadores/validar', { operador_id, cpf });
  }
}

export const operadorService = new OperadorService();
