import { apiFetch } from './client'

// --- Tipos de matéria-prima ---
export interface TipoMateriaPrimaResponse {
  id: string
  nome: string
  unidade: string
  descricao?: string
}

export interface CriarTipoMateriaPrimaInput {
  nome: string
  unidade: string
  descricao?: string
}

// --- Lotes ---
export interface LoteProducaoResponse {
  id: string
  tipo: string
  periodo: string
  dataInicio: string
  dataFim?: string
  status: string
  custoTotal: number
}

export interface CriarLoteInput {
  tipo: string
  periodo: string
  dataInicio: string
}

// --- Participações ---
export interface ParticipacaoLoteResponse {
  id: string
  loteProducaoId: string
  associadoId: string
  percentual: number
  volume?: number
  valorInvestido?: number
}

export interface RegistrarParticipacaoInput {
  associadoId: string
  percentual: number
  volume?: number
  valorInvestido?: number
}

export interface AtualizarParticipacaoInput {
  percentual?: number
  volume?: number
  valorInvestido?: number
}

// --- Colheitas ---
export interface ColheitaResponse {
  id: string
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  loteProducaoId: string
  volume: number
  unidade: string
  dataColheita: string
  observacao?: string
  criadoEm: string
}

export interface CriarColheitaInput {
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  loteProducaoId: string
  volume: number
  unidade: string
  dataColheita: string
  observacao?: string
}

export const producaoApi = {
  // Tipos de matéria-prima
  listarTipos: () =>
    apiFetch<TipoMateriaPrimaResponse[]>('/producao/tipos-materia-prima'),

  criarTipo: (input: CriarTipoMateriaPrimaInput) =>
    apiFetch<TipoMateriaPrimaResponse>('/producao/tipos-materia-prima', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // Lotes
  listarLotes: () =>
    apiFetch<LoteProducaoResponse[]>('/producao/lotes'),

  buscarLote: (id: string) =>
    apiFetch<LoteProducaoResponse>(`/producao/lotes/${id}`),

  criarLote: (input: CriarLoteInput) =>
    apiFetch<LoteProducaoResponse>('/producao/lotes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  encerrarLote: (id: string) =>
    apiFetch<LoteProducaoResponse>(`/producao/lotes/${id}/encerrar`, { method: 'PATCH' }),

  // Participações
  listarParticipacoes: (loteId: string) =>
    apiFetch<ParticipacaoLoteResponse[]>(`/producao/lotes/${loteId}/participacoes`),

  registrarParticipacao: (loteId: string, input: RegistrarParticipacaoInput) =>
    apiFetch<ParticipacaoLoteResponse>(`/producao/lotes/${loteId}/participacoes`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  atualizarParticipacao: (loteId: string, associadoId: string, input: AtualizarParticipacaoInput) =>
    apiFetch<ParticipacaoLoteResponse>(`/producao/lotes/${loteId}/participacoes/${associadoId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // Colheitas
  listarColheitasPorAssociado: (associadoId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/associado/${associadoId}`),

  listarColheitasPorLote: (loteId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/lote/${loteId}`),

  criarColheita: (input: CriarColheitaInput) =>
    apiFetch<ColheitaResponse>('/producao/colheitas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
