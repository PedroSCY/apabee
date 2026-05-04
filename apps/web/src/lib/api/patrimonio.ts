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

  // Atribuições
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
}
