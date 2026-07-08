// src/services/requisicaoService.ts
import api from './api';

// Defina o tipo do item retornado pela API
type ItemBasico = {
  id: number;
  nome: string;
  numero_registro: number;
  // outras propriedades se necessário
};

export type Requisicao = {
  id: number;
  codigo_requisicao: string;
  nome_cliente: string;
  telefone: string;
  categoria_objeto: string | null;
  descricao: string;
  responsavel_cadastro?: string | null;
  data_requisicao: string;
  encontrado: boolean;
  item_id: number | null;
  operador_id?: number | null;
  operador_nome?: string | null;
  assinatura_operador?: string | null;
  ativo: boolean;
};

export type RequisicaoComDetalhes = Requisicao & {
  item_nome?: string;
  item_numero_registro?: number;
};

export type DadosRequisicao = {
  nome_cliente: string;
  telefone: string;
  categoria_objeto?: string;
  descricao: string;
  responsavel_cadastro?: string;
  operador_id?: number | null;
  assinatura_operador?: string | null;
};

class RequisicaoService {
  async listarTodas(): Promise<RequisicaoComDetalhes[]> {
    try {
      const response = await api.get('/requisicoes/todas');
      const requisicoes = response.data;
      
      if (!requisicoes.length) return [];

      // Buscar todos os itens para obter os nomes
      const itensResponse = await api.get('/itens');
      const itens = itensResponse.data as ItemBasico[]; // ← CAST AQUI!
      const itensMap = new Map(itens.map((item: ItemBasico) => [item.id, item]));

      // Adicionar nome do item quando disponível
      return requisicoes.map((req: Requisicao) => {
        const item = req.item_id ? itensMap.get(req.item_id) : undefined;
        return {
          ...req,
          item_nome: item?.nome,
          item_numero_registro: item?.numero_registro,
        };
      });
    } catch (error) {
      console.error('Erro ao listar requisições:', error);
      return [];
    }
  }

  async listarPendentes(): Promise<RequisicaoComDetalhes[]> {
    try {
      const response = await api.get('/requisicoes/pendentes');
      const requisicoes = response.data;
      
      if (!requisicoes.length) return [];

      // Buscar todos os itens para obter os nomes
      const itensResponse = await api.get('/itens');
      const itens = itensResponse.data as ItemBasico[]; // ← CAST AQUI!
      const itensMap = new Map(itens.map((item: ItemBasico) => [item.id, item]));

      return requisicoes.map((req: Requisicao) => {
        const item = req.item_id ? itensMap.get(req.item_id) : undefined;
        return {
          ...req,
          item_nome: item?.nome,
          item_numero_registro: item?.numero_registro,
        };
      });
    } catch (error) {
      console.error('Erro ao listar requisições pendentes:', error);
      return [];
    }
  }

  async buscarPorId(id: number): Promise<RequisicaoComDetalhes | null> {
    try {
      const response = await api.get(`/requisicoes/${id}`);
      const requisicao = response.data;
      
      if (requisicao.item_id) {
        try {
          const itemResponse = await api.get(`/itens/${requisicao.item_id}`);
          const item = itemResponse.data as ItemBasico; // ← CAST AQUI!
          return {
            ...requisicao,
            item_nome: item.nome,
            item_numero_registro: item.numero_registro,
          };
        } catch (error) {
          console.error('Erro ao buscar item da requisição:', error);
        }
      }
      
      return requisicao;
    } catch (error) {
      console.error('Erro ao buscar requisição:', error);
      return null;
    }
  }

  async cadastrarRequisicao(dados: DadosRequisicao): Promise<{ requisicao_id: number }> {
    try {
      const response = await api.post('/requisicoes', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar requisição:', error);
      throw error;
    }
  }

  async buscarParecidas(categoria_objeto: string | undefined, descricao: string): Promise<RequisicaoComDetalhes[]> {
    try {
      const response = await api.get('/requisicoes/parecidas', {
        params: { categoria_objeto, descricao },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar requisições parecidas:', error);
      return [];
    }
  }

  async associarItemEncontrado(requisicaoId: number, itemId: number): Promise<void> {
    try {
      await api.put(`/requisicoes/${requisicaoId}/encontrado`, { item_id: itemId });
    } catch (error) {
      console.error('Erro ao associar item:', error);
      throw error;
    }
  }
}

export const requisicaoService = new RequisicaoService();
