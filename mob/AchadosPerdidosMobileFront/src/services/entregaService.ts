// src/services/entregaService.ts
import api from './api';

export type Entrega = {
  id: number;
  data_entrega: string;
  codigo_autenticacao: string;
  tipo_registro: string;
  proprietario_id: number;
  item_id: number;
  usuario_id: number;
  ativo: boolean;
};

export type EntregaComDetalhes = Entrega & {
  proprietario_nome?: string;
  proprietario_telefone?: string;
  proprietario_cpf?: string;
  proprietario_rg?: string;
  item_nome?: string;
  item_numero_registro?: number;
  item_numero_lacre?: number;
  usuario_nome?: string;
  caminho_foto?: string | null;
};

export type DadosEntrega = {
  tipo_registro: string;
  proprietario: {
    nome: string;
    telefone: string;
    cpf?: string;
    rg?: string;
  };
  item_id: number;
};

class EntregaService {
  // ============================================
  // LISTAR ENTREGAS COM DETALHES E IMAGENS
  // ============================================
  async listarEntregas(): Promise<EntregaComDetalhes[]> {
    try {
      console.log('📦 Buscando entregas...');
      
      const response = await api.get('/entregas');
      const entregas = response.data;

      if (!entregas.length) {
        return [];
      }

      console.log(`📦 Encontradas ${entregas.length} entregas`);

      const itensResponse = await api.get('/itens');
      const itens = itensResponse.data;

      const itensMap = new Map();
      itens.forEach((item: any) => {
        itensMap.set(item.id, {
          nome: item.nome,
          numero_registro: item.numero_registro,
          numero_lacre: item.numero_lacre,
        });
      });

      // CORREÇÃO: Usar array em vez de Set com spread
      const proprietarioIds: number[] = [];
      entregas.forEach((e: Entrega) => {
        if (!proprietarioIds.includes(e.proprietario_id)) {
          proprietarioIds.push(e.proprietario_id);
        }
      });
      
      const proprietariosMap = new Map();

      await Promise.all(
        proprietarioIds.map(async (id) => {
          try {
            const propResponse = await api.get(`/proprietarios/${id}`);
            proprietariosMap.set(id, propResponse.data);
          } catch (error) {
            console.error(`Erro ao buscar proprietário ${id}:`, error);
          }
        })
      );

      const entregasComDetalhes = await Promise.all(
        entregas.map(async (entrega: Entrega) => {
          const item = itensMap.get(entrega.item_id);
          const proprietario = proprietariosMap.get(entrega.proprietario_id);
          
          let caminhoFoto = null;
          try {
            const imagensResponse = await api.get(`/imagens/entrega/${entrega.id}`);
            const imagens = imagensResponse.data;
            caminhoFoto = imagens.length > 0 ? imagens[0].caminho : null;
            console.log(`🖼️ Entrega ${entrega.id}: ${imagens.length} imagem(ns) encontrada(s)`);
          } catch (error) {
            console.log(`❌ Erro ao buscar imagem da entrega ${entrega.id}`);
          }

          return {
            ...entrega,
            item_nome: item?.nome,
            item_numero_registro: item?.numero_registro,
            item_numero_lacre: item?.numero_lacre,
            proprietario_nome: proprietario?.nome,
            proprietario_telefone: proprietario?.telefone,
            proprietario_cpf: proprietario?.cpf,
            proprietario_rg: proprietario?.rg,
            caminho_foto: caminhoFoto,
          };
        })
      );

      console.log('✅ Todas as entregas processadas com imagens');
      return entregasComDetalhes;
    } catch (error) {
      console.error('Erro ao listar entregas:', error);
      return [];
    }
  }

  // ============================================
  // BUSCAR ENTREGA POR ID DO ITEM
  // ============================================
  async buscarEntregaPorItemId(itemId: number): Promise<EntregaComDetalhes | null> {
    try {
      console.log(`🔍 Buscando entrega para o item ${itemId}...`);
      
      const response = await api.get('/entregas');
      const entregas = response.data;
      
      const entregaDoItem = entregas.find((e: Entrega) => e.item_id === itemId);
      
      if (!entregaDoItem) {
        console.log(`📭 Item ${itemId} não possui entrega`);
        return null;
      }
      
      console.log(`📦 Entrega encontrada: ID ${entregaDoItem.id}`);
      
      const item = await this.buscarItemPorId(entregaDoItem.item_id);
      
      let proprietario = null;
      try {
        const propResponse = await api.get(`/proprietarios/${entregaDoItem.proprietario_id}`);
        proprietario = propResponse.data;
      } catch (error) {
        console.error('Erro ao buscar proprietário:', error);
      }
      
      let caminhoFoto = null;
      try {
        const imagensResponse = await api.get(`/imagens/entrega/${entregaDoItem.id}`);
        const imagens = imagensResponse.data;
        caminhoFoto = imagens.length > 0 ? imagens[0].caminho : null;
      } catch (error) {
        console.log(`❌ Erro ao buscar imagem da entrega ${entregaDoItem.id}`);
      }
      
      return {
        ...entregaDoItem,
        item_nome: item?.nome,
        item_numero_registro: item?.numero_registro,
        item_numero_lacre: item?.numero_lacre,
        proprietario_nome: proprietario?.nome,
        proprietario_telefone: proprietario?.telefone,
        proprietario_cpf: proprietario?.cpf,
        proprietario_rg: proprietario?.rg,
        caminho_foto: caminhoFoto,
      };
    } catch (error) {
      console.error('Erro ao buscar entrega por item:', error);
      return null;
    }
  }

  // ============================================
  // BUSCAR ITEM POR TERMO
  // ============================================
  async buscarItemPorTermo(termo: string): Promise<any[]> {
    try {
      if (/^\d+$/.test(termo)) {
        const numero = parseInt(termo);
        try {
          const response = await api.get(`/itens/numero/${numero}`);
          return [response.data];
        } catch (e) {
          console.log('Item não encontrado por número de registro');
          return [];
        }
      }

      const response = await api.get(`/itens/buscar?termo=${encodeURIComponent(termo)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens por termo:', error);
      return [];
    }
  }

  // ============================================
  // BUSCAR ITEM POR ID
  // ============================================
  async buscarItemPorId(id: number): Promise<any | null> {
    try {
      const response = await api.get(`/itens/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item por ID:', error);
      return null;
    }
  }

  // ============================================
  // BUSCAR ITEM POR NÚMERO DE REGISTRO
  // ============================================
  async buscarItemPorNumeroRegistro(numero: number): Promise<any | null> {
    try {
      const response = await api.get(`/itens/numero/${numero}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item por número de registro:', error);
      return null;
    }
  }

  // ============================================
  // BUSCAR ITEM POR LACRE
  // ============================================
  async buscarItemPorLacre(lacre: number): Promise<any[]> {
    try {
      const response = await api.get('/itens');
      const itens = response.data;
      return itens.filter((i: any) => i.numero_lacre === lacre);
    } catch (error) {
      console.error('Erro ao buscar item por lacre:', error);
      return [];
    }
  }

  // ============================================
  // BUSCAR ENTREGA POR ID
  // ============================================
  async buscarPorId(id: number): Promise<EntregaComDetalhes | null> {
    try {
      const response = await api.get(`/entregas/${id}`);
      const entrega = response.data;

      const item = await this.buscarItemPorId(entrega.item_id);

      let proprietario = null;
      try {
        const propResponse = await api.get(`/proprietarios/${entrega.proprietario_id}`);
        proprietario = propResponse.data;
      } catch (error) {
        console.error('Erro ao buscar proprietário:', error);
      }

      let caminhoFoto = null;
      try {
        const imagensResponse = await api.get(`/imagens/entrega/${id}`);
        const imagens = imagensResponse.data;
        caminhoFoto = imagens.length > 0 ? imagens[0].caminho : null;
      } catch (error) {
        console.log(`Erro ao buscar imagem da entrega ${id}`);
      }

      return {
        ...entrega,
        item_nome: item?.nome,
        item_numero_registro: item?.numero_registro,
        item_numero_lacre: item?.numero_lacre,
        proprietario_nome: proprietario?.nome,
        proprietario_telefone: proprietario?.telefone,
        proprietario_cpf: proprietario?.cpf,
        proprietario_rg: proprietario?.rg,
        caminho_foto: caminhoFoto,
      };
    } catch (error) {
      console.error('Erro ao buscar entrega por ID:', error);
      return null;
    }
  }

  // ============================================
  // BUSCAR ENTREGA POR CÓDIGO
  // ============================================
  async buscarPorCodigo(codigo: string): Promise<EntregaComDetalhes | null> {
    try {
      const response = await api.get(`/entregas/codigo/${codigo}`);
      const entrega = response.data;

      const item = await this.buscarItemPorId(entrega.item_id);

      let proprietario = null;
      try {
        const propResponse = await api.get(`/proprietarios/${entrega.proprietario_id}`);
        proprietario = propResponse.data;
      } catch (error) {
        console.error('Erro ao buscar proprietário:', error);
      }

      let caminhoFoto = null;
      try {
        const imagensResponse = await api.get(`/imagens/entrega/${entrega.id}`);
        const imagens = imagensResponse.data;
        caminhoFoto = imagens.length > 0 ? imagens[0].caminho : null;
      } catch (error) {
        console.log(`Erro ao buscar imagem da entrega ${entrega.id}`);
      }

      return {
        ...entrega,
        item_nome: item?.nome,
        item_numero_registro: item?.numero_registro,
        item_numero_lacre: item?.numero_lacre,
        proprietario_nome: proprietario?.nome,
        proprietario_telefone: proprietario?.telefone,
        proprietario_cpf: proprietario?.cpf,
        proprietario_rg: proprietario?.rg,
        caminho_foto: caminhoFoto,
      };
    } catch (error) {
      console.error('Erro ao buscar entrega por código:', error);
      return null;
    }
  }

  // ============================================
  // REGISTRAR NOVA ENTREGA
  // ============================================
  async registrarEntrega(dados: DadosEntrega): Promise<{ entrega_id: number }> {
    try {
      const response = await api.post('/entregas', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar entrega:', error);
      throw error;
    }
  }

  // ============================================
  // UPLOAD DE IMAGEM DA ENTREGA
  // ============================================
  async uploadImagemEntrega(entregaId: number, uri: string): Promise<void> {
    try {
      console.log('📤 Iniciando upload para entrega', entregaId);
      console.log('📤 URI da imagem:', uri);
      
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      console.log('📤 Nome do arquivo:', filename);
      console.log('📤 Tipo:', type);

      // @ts-ignore - React Native FormData
      formData.append('imagem', {
        uri,
        name: filename,
        type,
      });

      const response = await api.post(`/imagens/entrega/${entregaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload resposta:', response.data);
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
    }
  }
}

export const entregaService = new EntregaService();