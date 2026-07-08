// src/services/itemService.ts
import api from './api';
import { ENDPOINTS } from '../constants/api';
import { ItemComFoto } from '../types/item';

class ItemService {
  // ============================================
  // LISTAR TODOS OS ITENS COM SUAS IMAGENS
  // ============================================
  async listarItens(): Promise<ItemComFoto[]> {
    try {
      console.log('📦 Buscando itens...');
      
      // Buscar todos os itens
      const response = await api.get(ENDPOINTS.ITENS);
      const itens = response.data;
      
      console.log(`📦 Encontrados ${itens.length} itens`);
      
      // Para cada item, buscar suas imagens
      const itensComFoto = await Promise.all(
        itens.map(async (item: any) => {
          try {
            console.log(`🔍 Buscando imagens para o item ${item.id} - ${item.nome}`);
            
            // Buscar imagens do item
            const imagensResponse = await api.get(`/imagens/item/${item.id}`);
            const imagens = imagensResponse.data;
            
            console.log(`🖼️ Item ${item.id}: ${imagens.length} imagem(ns) encontrada(s)`);
            
            if (imagens.length > 0) {
              console.log(`🖼️ Primeira imagem:`, imagens[0].caminho);
            }
            
            return {
              ...item,
              caminho_foto: imagens.length > 0 ? imagens[0].caminho : null,
            };
          } catch (error) {
            console.log(`❌ Erro ao buscar imagens do item ${item.id}:`, error);
            return {
              ...item,
              caminho_foto: null,
            };
          }
        })
      );
      
      console.log('✅ Todos os itens processados com imagens');
      return itensComFoto;
    } catch (error) {
      console.error('[ItemService] Erro ao listar itens:', error);
      throw error;
    }
  }

  // ============================================
  // BUSCAR ITEM POR ID COM SUAS IMAGENS
  // ============================================
  async buscarItemPorId(id: number): Promise<ItemComFoto> {
    try {
      console.log(`🔍 Buscando item ${id}...`);
      
      const response = await api.get(ENDPOINTS.ITEM_BY_ID(id));
      const item = response.data;
      
      console.log(`📦 Item encontrado: ${item.nome}`);
      
      // Buscar imagens do item
      try {
        const imagensResponse = await api.get(`/imagens/item/${id}`);
        const imagens = imagensResponse.data;
        
        console.log(`🖼️ Item ${id}: ${imagens.length} imagem(ns) encontrada(s)`);
        
        return {
          ...item,
          caminho_foto: imagens.length > 0 ? imagens[0].caminho : null,
        };
      } catch (error) {
        console.log(`❌ Erro ao buscar imagens do item ${id}:`, error);
        return {
          ...item,
          caminho_foto: null,
        };
      }
    } catch (error) {
      console.error('[ItemService] Erro ao buscar item:', error);
      throw error;
    }
  }

  // ============================================
  // BUSCAR ITEM POR NÚMERO DE REGISTRO COM IMAGENS
  // ============================================
  async buscarItemPorNumeroRegistro(numero: number): Promise<ItemComFoto> {
    try {
      console.log(`🔍 Buscando item por número de registro: ${numero}...`);
      
      const response = await api.get(ENDPOINTS.ITEM_BY_NUMERO(numero));
      const item = response.data;
      
      console.log(`📦 Item encontrado: ${item.nome} (ID: ${item.id})`);
      
      // Buscar imagens do item
      try {
        const imagensResponse = await api.get(`/imagens/item/${item.id}`);
        const imagens = imagensResponse.data;
        
        console.log(`🖼️ Item ${item.id}: ${imagens.length} imagem(ns) encontrada(s)`);
        
        return {
          ...item,
          caminho_foto: imagens.length > 0 ? imagens[0].caminho : null,
        };
      } catch (error) {
        console.log(`❌ Erro ao buscar imagens do item ${item.id}:`, error);
        return {
          ...item,
          caminho_foto: null,
        };
      }
    } catch (error) {
      console.error('[ItemService] Erro ao buscar item por número:', error);
      throw error;
    }
  }

  // ============================================
  // BUSCAR ITENS POR TERMO COM IMAGENS
  // ============================================
  async buscarItens(termo: string): Promise<ItemComFoto[]> {
    try {
      console.log(`🔍 Buscando itens com termo: "${termo}"...`);
      
      const response = await api.get(ENDPOINTS.BUSCAR_ITENS(termo));
      const itens = response.data;
      
      console.log(`📦 Encontrados ${itens.length} itens`);
      
      // Para cada item, buscar suas imagens
      const itensComFoto = await Promise.all(
        itens.map(async (item: any) => {
          try {
            const imagensResponse = await api.get(`/imagens/item/${item.id}`);
            const imagens = imagensResponse.data;
            
            return {
              ...item,
              caminho_foto: imagens.length > 0 ? imagens[0].caminho : null,
            };
          } catch (error) {
            return {
              ...item,
              caminho_foto: null,
            };
          }
        })
      );
      
      return itensComFoto;
    } catch (error) {
      console.error('[ItemService] Erro ao buscar itens:', error);
      throw error;
    }
  }

  async buscarItensParecidos(tipoId: number | null, descricao: string): Promise<ItemComFoto[]> {
    try {
      const response = await api.get('/itens/parecidos', {
        params: {
          tipo_id: tipoId ?? undefined,
          descricao,
        },
      });
      return response.data;
    } catch (error) {
      console.error('[ItemService] Erro ao buscar itens parecidos:', error);
      return [];
    }
  }
}

export const itemService = new ItemService();
