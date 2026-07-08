import api from './api';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  cargo?: string | null;
  ativo: boolean;
};

class UsuarioService {
  async listarUsuarios(): Promise<Usuario[]> {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }
}

export const usuarioService = new UsuarioService();
