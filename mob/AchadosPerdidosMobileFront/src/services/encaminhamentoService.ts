// src/services/encaminhamentoService.ts
import api from './api';

export type Destino = {
  id: number;
  nome: string;
  ativo: boolean;
};

export type TipoItem = {
  id: number;
  nome: string;
  prazo_dias: number;
};

export type Encaminhamento = {
  id: number;
  data_envio: string;
  data_inventario: string | null;
  item_id: number;
  destino_id: number;
  responsavel_encaminhamento?: string | null;
  ativo: boolean;
};

export type EncaminhamentoComDetalhes = Encaminhamento & {
  item_nome?: string;
  item_numero_registro?: number;
  item_tipo_id?: number;
  item_tipo_nome?: string;
  destino_nome?: string;
};

export type DadosEncaminhamento = {
  data_envio: string;
  data_inventario?: string | null;
  item_id: number;
  destino_id: number;
  responsavel_encaminhamento?: string | null;
};

export type DadosEncaminhamentoLote = {
  data_envio: string;
  data_inventario?: string | null;
  item_ids: number[];
  destino_id: number;
  responsavel_encaminhamento?: string | null;
};

class EncaminhamentoService {
  // ============================================
  // LISTAR DESTINOS
  // ============================================
  async listarDestinos(): Promise<Destino[]> {
    try {
      const response = await api.get('/destinos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar destinos:', error);
      return [];
    }
  }

  // ============================================
  // LISTAR TIPOS DE ITENS (NOVO)
  // ============================================
  async listarTiposItens(): Promise<TipoItem[]> {
    try {
      const response = await api.get('/tipos');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar tipos de itens:', error);
      return [];
    }
  }

  // ============================================
  // LISTAR ITENS VENCIDOS NÃO ENCAMINHADOS
  // ============================================
  async listarItensVencidos(): Promise<any[]> {
    try {
      const response = await api.get('/dashboard/itens/vencidos-nao-encaminhados');
      const itens = response.data;
      
      // Buscar tipos para adicionar nome do tipo a cada item
      const tipos = await this.listarTiposItens();
      const tiposMap = new Map(tipos.map(t => [t.id, t]));
      
      return itens.map((item: any) => ({
        ...item,
        tipo_nome: tiposMap.get(item.tipo_id)?.nome,
      }));
    } catch (error) {
      console.error('Erro ao listar itens vencidos:', error);
      return [];
    }
  }

  // ============================================
  // LISTAR ITENS VENCIDOS POR TIPO (NOVO)
  // ============================================
  async listarItensVencidosPorTipo(tipoIds: number[]): Promise<any[]> {
    try {
      // Buscar todos os itens vencidos
      const itens = await this.listarItensVencidos();
      
      // Se não houver filtro, retorna todos
      if (!tipoIds || tipoIds.length === 0) {
        return itens;
      }
      
      // Filtrar por tipo
      return itens.filter((item: any) => tipoIds.includes(item.tipo_id));
    } catch (error) {
      console.error('Erro ao listar itens vencidos por tipo:', error);
      return [];
    }
  }

  // ============================================
  // LISTAR ENCAMINHAMENTOS COM DETALHES
  // ============================================
  async listarEncaminhamentos(): Promise<EncaminhamentoComDetalhes[]> {
    try {
      // Buscar encaminhamentos
      const response = await api.get('/destinos/itens');
      const encaminhamentos = response.data;
      
      if (!encaminhamentos.length) {
        return [];
      }

      // Buscar TODOS os itens de uma vez
      const itensResponse = await api.get('/itens');
      const itens = itensResponse.data;
      
      // Criar um mapa de itens para acesso rápido
      const itensMap = new Map();
      itens.forEach((item: any) => {
        itensMap.set(item.id, {
          ...item,
        });
      });

      // Buscar TODOS os destinos
      const destinosResponse = await api.get('/destinos');
      const destinos = destinosResponse.data;
      
      // Criar um mapa de destinos para acesso rápido
      const destinosMap = new Map();
      destinos.forEach((destino: any) => {
        destinosMap.set(destino.id, destino);
      });

      // Buscar tipos para os itens
      const tipos = await this.listarTiposItens();
      const tiposMap = new Map(tipos.map(t => [t.id, t]));

      // Combinar os dados
      const encaminhamentosComDetalhes = encaminhamentos.map((enc: Encaminhamento) => {
        const item = itensMap.get(enc.item_id);
        const destino = destinosMap.get(enc.destino_id);
        
        return {
          ...enc,
          item_nome: item?.nome,
          item_numero_registro: item?.numero_registro,
          item_tipo_id: item?.tipo_id,
          item_tipo_nome: tiposMap.get(item?.tipo_id)?.nome,
          destino_nome: destino?.nome,
        };
      });
      
      return encaminhamentosComDetalhes;
    } catch (error) {
      console.error('Erro ao listar encaminhamentos:', error);
      return [];
    }
  }

  // ============================================
  // REGISTRAR UM ÚNICO ENCAMINHAMENTO
  // ============================================
  async registrarEncaminhamento(dados: DadosEncaminhamento): Promise<{ encaminhamento_id: number }> {
    try {
      const response = await api.post('/destinos/encaminhar', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao registrar encaminhamento:', error);
      throw error;
    }
  }

  // ============================================
  // REGISTRAR MÚLTIPLOS ENCAMINHAMENTOS (LOTE)
  // ============================================
  async registrarEncaminhamentosLote(dados: DadosEncaminhamentoLote): Promise<{ sucessos: number, erros: number }> {
    try {
      let sucessos = 0;
      let erros = 0;

      // Registrar cada item individualmente
      for (const itemId of dados.item_ids) {
        try {
          await this.registrarEncaminhamento({
            data_envio: dados.data_envio,
            data_inventario: dados.data_inventario,
            item_id: itemId,
            destino_id: dados.destino_id,
            responsavel_encaminhamento: dados.responsavel_encaminhamento,
          });
          sucessos++;
        } catch (error) {
          console.error(`Erro ao encaminhar item ${itemId}:`, error);
          erros++;
        }
      }

      return { sucessos, erros };
    } catch (error) {
      console.error('Erro ao registrar encaminhamentos em lote:', error);
      throw error;
    }
  }

  // ============================================
  // BUSCAR ITEM POR ID (UTILITÁRIO)
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
  // BUSCAR ITEM POR NÚMERO DE REGISTRO (UTILITÁRIO)
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
  // BUSCAR ITEM POR LACRE (UTILITÁRIO)
  // ============================================
  async buscarItemPorLacre(lacre: number): Promise<any[]> {
    try {
      // Busca todos os itens e filtra por lacre
      const response = await api.get('/itens');
      const itens = response.data;
      return itens.filter((i: any) => i.numero_lacre === lacre);
    } catch (error) {
      console.error('Erro ao buscar item por lacre:', error);
      return [];
    }
  }
}

export const encaminhamentoService = new EncaminhamentoService();
