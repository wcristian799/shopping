// src/constants/api.ts
const apiUrlFromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = (apiUrlFromEnv && apiUrlFromEnv.replace(/\/+$/, "")) || "https://seu-backend.exemplo.com";

export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/cadastro",

  // Itens
  ITENS: "/itens",
  ITEM_BY_ID: (id: number) => `/itens/${id}`,
  ITEM_BY_NUMERO: (numero: number) => `/itens/numero/${numero}`,
  BUSCAR_ITENS: (termo: string) => `/itens/buscar?termo=${termo}`,

  // Entregas
  ENTREGAS: "/entregas",
  ENTREGA_BY_ID: (id: number) => `/entregas/${id}`,
  ENTREGA_BY_CODIGO: (codigo: string) => `/entregas/codigo/${codigo}`,

  // Requisicoes
  REQUISICOES: "/requisicoes",
  REQUISICOES_PENDENTES: "/requisicoes/pendentes",
  REQUISICOES_TODAS: "/requisicoes/todas",

  // Destinos
  DESTINOS: "/destinos",
  ITENS_DESTINADOS: "/destinos/itens",

  // Dashboard
  DASHBOARD_ESTATISTICAS: "/dashboard/estatisticas",
  DASHBOARD_ITENS_CATEGORIA: "/dashboard/itens/categoria",
  DASHBOARD_ITENS_LOCAL: "/dashboard/itens/local",

  // Usuarios (admin)
  USUARIOS: "/usuarios",
  USUARIO_BY_ID: (id: number) => `/usuarios/${id}`,

  // Relatorios
  RELATORIO_GERAR: "/relatorios/gerar",
  RELATORIO_DADOS: "/relatorios/dados",
} as const;
