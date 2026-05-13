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
  dataFim?: string
}

// --- Participações ---
export interface ParticipacaoLoteResponse {
  id: string
  loteProducaoId: string
  associadoId: string
  percentual: number
  percentualManual: boolean
  volume?: number
  valorInvestido?: number
}

export interface RegistrarParticipacaoInput {
  associadoId: string
  volume?: number
  valorInvestido?: number
}

export interface AtualizarParticipacaoInput {
  volume?: number
  valorInvestido?: number
  percentual?: number
  percentualManual?: boolean
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
  /** Lista todos os tipos de matéria-prima. */
  listarTipos: () =>
    apiFetch<TipoMateriaPrimaResponse[]>('/producao/tipos-materia-prima'),

  /** Cria um novo tipo de matéria-prima. */
  criarTipo: (input: CriarTipoMateriaPrimaInput) =>
    apiFetch<TipoMateriaPrimaResponse>('/producao/tipos-materia-prima', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Lista todos os lotes de produção. */
  listarLotes: () =>
    apiFetch<LoteProducaoResponse[]>('/producao/lotes'),

  /** Busca um lote de produção pelo ID. */
  buscarLote: (id: string) =>
    apiFetch<LoteProducaoResponse>(`/producao/lotes/${id}`),

  /** Cria um novo lote de produção. */
  criarLote: (input: CriarLoteInput) =>
    apiFetch<LoteProducaoResponse>('/producao/lotes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Encerra um lote de produção. */
  encerrarLote: (id: string) =>
    apiFetch<LoteProducaoResponse>(`/producao/lotes/${id}/encerrar`, { method: 'PATCH' }),

  /** Lista as participações de um lote. */
  listarParticipacoes: (loteId: string) =>
    apiFetch<ParticipacaoLoteResponse[]>(`/producao/lotes/${loteId}/participacoes`),

  /** Registra a participação de um associado em um lote. */
  registrarParticipacao: (loteId: string, input: RegistrarParticipacaoInput) =>
    apiFetch<ParticipacaoLoteResponse>(`/producao/lotes/${loteId}/participacoes`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Atualiza a participação de um associado em um lote. */
  atualizarParticipacao: (loteId: string, associadoId: string, input: AtualizarParticipacaoInput) =>
    apiFetch<ParticipacaoLoteResponse>(`/producao/lotes/${loteId}/participacoes/${associadoId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Calcula o rateio financeiro de um lote. */
  calcularRateio: (loteId: string) =>
    apiFetch<ParticipacaoLoteResponse[]>(`/producao/lotes/${loteId}/rateio`, { method: 'POST' }),

  /** Lista participações de um associado em todos os lotes. */
  listarParticipacoesPorAssociado: (associadoId: string) =>
    apiFetch<ParticipacaoLoteResponse[]>(`/producao/participacoes/associado/${associadoId}`),

  /** Lista colheitas de um associado. */
  listarColheitasPorAssociado: (associadoId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/associado/${associadoId}`),

  /** Lista colheitas de um lote específico. */
  listarColheitasPorLote: (loteId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/lote/${loteId}`),

  /** Registra uma nova colheita. */
  criarColheita: (input: CriarColheitaInput) =>
    apiFetch<ColheitaResponse>('/producao/colheitas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
