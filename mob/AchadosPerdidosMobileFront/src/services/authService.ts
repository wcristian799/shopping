// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { API_URL } from '../constants/api';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  nivel_acesso_id: number;
  ativo: boolean;
  data_cadastro: string;
};

export type LoginResponse = {
  token: string;
  usuario: Usuario;
};

export type CadastroData = {
  nome: string;
  email: string;
  senha: string;
  nivel_acesso_id: number;
};

class AuthService {
  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      console.log('[AuthService] Tentando login com:', { email });
      
      const response = await api.post('/auth/login', {
        email,
        senha,
      });

      console.log('[AuthService] Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Erro no login:', error.response?.data || error.message);
      throw error;
    }
  }

  async cadastro(data: CadastroData): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/cadastro', data);
      return response.data;
    } catch (error: any) {
      console.error('[AuthService] Erro no cadastro:', error.response?.data || error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Apenas limpa o token local
    await AsyncStorage.removeItem('@app:token');
    await AsyncStorage.removeItem('@app:user');
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@app:token');
  }

  async getUser(): Promise<Usuario | null> {
    const userStr = await AsyncStorage.getItem('@app:user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();