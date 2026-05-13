import { apiFetch } from './client'

export interface EquipamentoResponse {
  id: string
  nome: string
  numeroSerie?: string
  descricao?: string
  status: string
  criadoEm: string
}

export interface InsumoResponse {
  id: string
  nome: string
  categoria: string
  descricao?: string
  status: string
  criadoEm: string
}

export interface AtribuicaoPatrimonioResponse {
  id: string
  patrimonioId: string
  tipoPatrimonio: string
  associadoId: string
  dataInicio: string
  dataFim?: string
  status: string
  observacao?: string
}

export interface CriarEquipamentoInput {
  nome: string
  numeroSerie?: string
  descricao?: string
}

export interface AtualizarEquipamentoInput {
  nome?: string
  numeroSerie?: string
  descricao?: string
}

export interface CriarInsumoInput {
  nome: string
  categoria: string
  descricao?: string
}

export interface AtualizarInsumoInput {
  nome?: string
  descricao?: string
}

export interface AtribuirPatrimonioInput {
  patrimonioId: string
  tipoPatrimonio: string
  associadoId: string
  observacao?: string
  dataInicio?: string
}

export interface SolicitacaoPatrimonioResponse {
  id: string
  patrimonioId: string
  tipoPatrimonio: string
  associadoId: string
  justificativa?: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'
  criadoEm: string
  resolvidoEm?: string
}

export interface CriarSolicitacaoInput {
  patrimonioId: string
  tipoPatrimonio: string
  justificativa?: string
}

export const patrimonioApi = {
  // Equipamentos
  listarEquipamentos: () =>
    apiFetch<EquipamentoResponse[]>('/patrimonio/equipamentos'),

  buscarEquipamento: (id: string) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`),

  criarEquipamento: (input: CriarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>('/patrimonio/equipamentos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarEquipamento: (id: string, input: AtualizarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  colocarEquipamentoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/equipamentos/${id}/manutencao`, { method: 'PATCH' }),

  liberarEquipamentoManutencao: (id: string) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}/liberar-manutencao`, { method: 'PATCH' }),

  excluirEquipamento: (id: string) =>
    apiFetch<void>(`/patrimonio/equipamentos/${id}`, { method: 'DELETE' }),

  // Insumos
  listarInsumos: () =>
    apiFetch<InsumoResponse[]>('/patrimonio/insumos'),

  buscarInsumo: (id: string) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}`),

  criarInsumo: (input: CriarInsumoInput) =>
    apiFetch<InsumoResponse>('/patrimonio/insumos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarInsumo: (id: string, input: AtualizarInsumoInput) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  colocarInsumoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/insumos/${id}/manutencao`, { method: 'PATCH' }),

  liberarInsumoManutencao: (id: string) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}/liberar-manutencao`, { method: 'PATCH' }),

  excluirInsumo: (id: string) =>
    apiFetch<void>(`/patrimonio/insumos/${id}`, { method: 'DELETE' }),

  // Atribuições
  listarTodasAtribuicoes: () =>
    apiFetch<AtribuicaoPatrimonioResponse[]>('/patrimonio/atribuicoes'),

  atribuirPatrimonio: (input: AtribuirPatrimonioInput) =>
    apiFetch<AtribuicaoPatrimonioResponse>('/patrimonio/atribuicoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  devolverPatrimonio: (id: string) =>
    apiFetch<void>(`/patrimonio/atribuicoes/${id}/devolver`, { method: 'POST' }),

  listarAtribuicoesPorAssociado: (associadoId: string) =>
    apiFetch<AtribuicaoPatrimonioResponse[]>(
      `/patrimonio/atribuicoes/associado/${associadoId}`,
    ),

  // Solicitações
  criarSolicitacao: (input: CriarSolicitacaoInput) =>
    apiFetch<SolicitacaoPatrimonioResponse>('/patrimonio/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listarSolicitacoes: (status?: string) =>
    apiFetch<SolicitacaoPatrimonioResponse[]>(
      `/patrimonio/solicitacoes${status ? `?status=${status}` : ''}`,
    ),

  aprovarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/aprovar`, {
      method: 'PATCH',
    }),

  rejeitarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/rejeitar`, {
      method: 'PATCH',
    }),
}
