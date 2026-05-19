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

// --- Colheitas ---
export interface ColheitaResponse {
  id: string
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  campanhaId?: string
  safraId?: string
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
  campanhaId?: string
  safraId?: string
  volume: number
  unidade: string
  dataColheita: string
  observacao?: string
}

// --- Pool de matéria-prima ---
export interface EstoquePoolResponse {
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: string
  atualizadoEm: string
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

  /** Deleta um tipo de matéria-prima (somente sem dependências). */
  deletarTipo: (id: string) =>
    apiFetch<void>(`/producao/tipos-materia-prima/${id}`, { method: 'DELETE' }),

  /** Lista todas as colheitas (visão admin). */
  listarColheitas: () =>
    apiFetch<ColheitaResponse[]>('/producao/colheitas'),

  /** Lista colheitas de um associado. */
  listarColheitasPorAssociado: (associadoId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/associado/${associadoId}`),

  /** Lista colheitas de uma campanha específica. */
  listarColheitasPorCampanha: (campanhaId: string) =>
    apiFetch<ColheitaResponse[]>(`/producao/colheitas/campanha/${campanhaId}`),

  /** Registra uma nova colheita. */
  criarColheita: (input: CriarColheitaInput) =>
    apiFetch<ColheitaResponse>('/producao/colheitas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Exclui uma colheita (somente se o estoque não foi consumido). */
  deletarColheita: (id: string) =>
    apiFetch<void>(`/producao/colheitas/${id}`, { method: 'DELETE' }),

  /** Consulta saldo do pool de matéria-prima. */
  consultarPool: () =>
    apiFetch<EstoquePoolResponse[]>('/producao/tipos-materia-prima/pool'),

  /** Remove item do pool quando saldo é zero. */
  deletarItemPool: (tipoId: string) =>
    apiFetch<void>(`/producao/tipos-materia-prima/pool/${tipoId}`, { method: 'DELETE' }),
}
