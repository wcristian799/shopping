// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';
import { useRouter } from 'expo-router';

type Usuario = {
  id: number;
  nome: string;
  email: string;
  nivel_acesso_id: number;
  ativo: boolean;
  data_cadastro: string;
};

type AuthContextData = {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        senha: password,
      });

      const { token, usuario } = response.data;
      
      setToken(token);
      setUser(usuario);
      
      await AsyncStorage.setItem('@app:token', token);
      await AsyncStorage.setItem('@app:user', JSON.stringify(usuario));
      
      // REDIRECIONAR PARA A TELA PRINCIPAP AFTER LOGIN
      router.replace('/(tabs)/home');
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@app:token');
    await AsyncStorage.removeItem('@app:user');
    
    // REDIRECIONAR PARA O LOGIN AFTER LOGOUT
    router.replace('/(auth)');
  }

  const isAdmin = user?.nivel_acesso_id === 1;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};