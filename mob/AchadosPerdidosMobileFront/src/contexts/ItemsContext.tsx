// src/contexts/ItemsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ItemComFoto } from '../types/item';
import { itemService } from '../services/itemService';
import { localService } from '../services/localService';
import { tipoService } from '../services/tipoService';
import { caixaService } from '../services/caixaService';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';

type Filtros = {
  situacoes: number[];
  estados: string[];
  tipos: number[];
  locais: number[];
  caixas: number[];
};

type ItemsContextData = {
  items: ItemComFoto[];
  filteredItems: ItemComFoto[];
  loading: boolean;
  refreshing: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtros: Filtros;
  setFiltros: (filtros: Filtros) => void;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
  loadItems: () => Promise<void>;
  refreshItems: () => Promise<void>;
  getItemById: (id: number) => ItemComFoto | undefined;
  getLocalNome: (id: number) => string;
  getTipoNome: (id: number) => string;
  getCaixaDescricao: (id: number | null) => string;
  getUsuarioNome: (id: number) => string;
};

const filtrosIniciais: Filtros = {
  situacoes: [],
  estados: [],
  tipos: [],
  locais: [],
  caixas: [],
};

const ItemsContext = createContext<ItemsContextData | undefined>(undefined);

export const ItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<ItemComFoto[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemComFoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [locaisMap, setLocaisMap] = useState<Map<number, { id: number; nome: string }>>(new Map());
  const [tiposMap, setTiposMap] = useState<Map<number, { id: number; nome: string; prazo_dias: number }>>(new Map());
  const [caixasMap, setCaixasMap] = useState<Map<number, { id: number; numero: number; descricao: string }>>(new Map());
  const [usuariosMap, setUsuariosMap] = useState<Map<number, { id: number; nome: string }>>(new Map());

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [debouncedSearchTerm, items, filtros]);

  async function loadItems() {
    try {
      setLoading(true);
      
      // Buscar itens
      const itensData = await itemService.listarItens();
      
      // Buscar locais
      const locaisData = await localService.listarLocais();
      
      // Buscar tipos
      const tiposData = await tipoService.listarTipos();
      
      // Buscar caixas
      const caixasData = await caixaService.listarCaixas();
      
      // Buscar usuários - COM TRATAMENTO DE ERRO
      let usuariosData: any[] = [];
      try {
        const usuariosResponse = await api.get('/usuarios');
        usuariosData = usuariosResponse.data;
        console.log('✅ Usuários carregados:', usuariosData.length);
      } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        // Se não conseguir carregar, usa um mapa vazio
        usuariosData = [];
      }
      
      const locais = new Map(locaisData.map(l => [l.id, l]));
      const tipos = new Map(tiposData.map(t => [t.id, t]));
      const caixas = new Map(caixasData.map(c => [c.id, c]));
      
      // CORREÇÃO: Verificar se usuariosData é um array e mapear corretamente
      const usuarios = new Map();
      if (Array.isArray(usuariosData)) {
        usuariosData.forEach((u: any) => {
          usuarios.set(u.id, { id: u.id, nome: u.nome });
        });
      }
      
      setLocaisMap(locais);
      setTiposMap(tipos);
      setCaixasMap(caixas);
      setUsuariosMap(usuarios);
      setItems(itensData);
      setFilteredItems(itensData);
      
      console.log('✅ ItemsContext carregado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshItems() {
    try {
      setRefreshing(true);
      await loadItems();
    } finally {
      setRefreshing(false);
    }
  }

  const removerAcentos = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  function aplicarFiltros() {
    let filtered = [...items];

    if (debouncedSearchTerm.trim()) {
      const termoBusca = removerAcentos(debouncedSearchTerm.toLowerCase());
      
      filtered = filtered.filter(item => {
        const nome = removerAcentos(item.nome?.toLowerCase() || '');
        const marca = removerAcentos(item.marca?.toLowerCase() || '');
        const observacao = removerAcentos(item.observacao?.toLowerCase() || '');
        const registro = item.numero_registro.toString();
        
        return nome.includes(termoBusca) ||
               marca.includes(termoBusca) ||
               observacao.includes(termoBusca) ||
               registro.includes(termoBusca);
      });
    }

    if (filtros.situacoes.length > 0) {
      filtered = filtered.filter(item => filtros.situacoes.includes(item.situacao_id));
    }

    if (filtros.estados.length > 0) {
      filtered = filtered.filter(item => filtros.estados.includes(item.estado_conservacao));
    }

    if (filtros.tipos.length > 0) {
      filtered = filtered.filter(item => filtros.tipos.includes(item.tipo_id));
    }

    if (filtros.locais.length > 0) {
      filtered = filtered.filter(item => filtros.locais.includes(item.local_id));
    }

    if (filtros.caixas.length > 0) {
      filtered = filtered.filter(item => 
        item.caixa_id ? filtros.caixas.includes(item.caixa_id) : false
      );
    }

    setFilteredItems(filtered);
  }

  function limparFiltros() {
    setFiltros(filtrosIniciais);
    setSearchTerm('');
  }

  function getItemById(id: number): ItemComFoto | undefined {
    return items.find(item => item.id === id);
  }

  function getLocalNome(id: number): string {
    return locaisMap.get(id)?.nome || `Local ${id}`;
  }

  function getTipoNome(id: number): string {
    return tiposMap.get(id)?.nome || `Tipo ${id}`;
  }

  function getCaixaDescricao(id: number | null): string {
    if (!id) return 'Nenhuma';
    const caixa = caixasMap.get(id);
    return caixa ? `Caixa ${caixa.numero} - ${caixa.descricao}` : `Caixa ${id}`;
  }

  function getUsuarioNome(id: number): string {
    const usuario = usuariosMap.get(id);
    return usuario?.nome || `Usuário ${id}`;
  }

  return (
    <ItemsContext.Provider
      value={{
        items,
        filteredItems,
        loading,
        refreshing,
        searchTerm,
        setSearchTerm,
        filtros,
        setFiltros,
        aplicarFiltros,
        limparFiltros,
        loadItems,
        refreshItems,
        getItemById,
        getLocalNome,
        getTipoNome,
        getCaixaDescricao,
        getUsuarioNome,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};