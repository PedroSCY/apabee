import { apiFetch } from './client'

// ─── Equipamento ─────────────────────────────────────────────────────────────

export interface EquipamentoResponse {
  id: string
  nome: string
  numeroSerie?: string
  descricao?: string
  status: string
  criadoEm: string
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

// ─── Tipo de Insumo ───────────────────────────────────────────────────────────

export interface TipoInsumoResponse {
  id: string
  nome: string
  categoria: string
  sigla: string
  descricao?: string
  criadoEm: string
}

export interface CriarTipoInsumoInput {
  nome: string
  categoria: string
  sigla: string
  descricao?: string
}

export interface AtualizarTipoInsumoInput {
  nome?: string
  sigla?: string
  descricao?: string
}

export interface AdicionarUnidadesInput {
  quantidade: number
  descricao?: string
}

// ─── Insumo (unidade individual) ─────────────────────────────────────────────

export interface InsumoResponse {
  id: string
  identificador: string
  tipoInsumoId: string
  tipoInsumo: Pick<TipoInsumoResponse, 'id' | 'nome' | 'categoria' | 'sigla'>
  descricao?: string
  status: string
  criadoEm: string
}

// ─── Atribuição ───────────────────────────────────────────────────────────────

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

export interface AtribuirPatrimonioInput {
  patrimonioId: string
  tipoPatrimonio: string
  associadoId: string
  observacao?: string
  dataInicio?: string
}

// ─── Solicitação ──────────────────────────────────────────────────────────────

export interface SolicitacaoPatrimonioResponse {
  id: string
  tipoPatrimonio: string
  patrimonioId?: string
  tipoInsumoId?: string
  quantidade?: number
  associadoId: string
  justificativa?: string
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA'
  criadoEm: string
  resolvidoEm?: string
}

export type CriarSolicitacaoInput =
  | { tipoPatrimonio: 'EQUIPAMENTO'; patrimonioId: string; justificativa?: string }
  | { tipoPatrimonio: 'INSUMO'; tipoInsumoId: string; quantidade: number; justificativa?: string }

// ─── API ──────────────────────────────────────────────────────────────────────

export const patrimonioApi = {
  // Equipamentos
  listarEquipamentos: () => apiFetch<EquipamentoResponse[]>('/patrimonio/equipamentos'),
  buscarEquipamento: (id: string) => apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`),
  criarEquipamento: (input: CriarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>('/patrimonio/equipamentos', { method: 'POST', body: JSON.stringify(input) }),
  atualizarEquipamento: (id: string, input: AtualizarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  colocarEquipamentoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/equipamentos/${id}/manutencao`, { method: 'PATCH' }),
  liberarEquipamentoManutencao: (id: string) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}/liberar-manutencao`, { method: 'PATCH' }),
  excluirEquipamento: (id: string) => apiFetch<void>(`/patrimonio/equipamentos/${id}`, { method: 'DELETE' }),

  // Tipos de Insumo
  listarTiposInsumo: () => apiFetch<TipoInsumoResponse[]>('/patrimonio/tipos-insumo'),
  buscarTipoInsumo: (id: string) => apiFetch<TipoInsumoResponse>(`/patrimonio/tipos-insumo/${id}`),
  criarTipoInsumo: (input: CriarTipoInsumoInput) =>
    apiFetch<TipoInsumoResponse>('/patrimonio/tipos-insumo', { method: 'POST', body: JSON.stringify(input) }),
  atualizarTipoInsumo: (id: string, input: AtualizarTipoInsumoInput) =>
    apiFetch<TipoInsumoResponse>(`/patrimonio/tipos-insumo/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  excluirTipoInsumo: (id: string) => apiFetch<void>(`/patrimonio/tipos-insumo/${id}`, { method: 'DELETE' }),
  adicionarUnidades: (tipoId: string, input: AdicionarUnidadesInput) =>
    apiFetch<InsumoResponse[]>(`/patrimonio/tipos-insumo/${tipoId}/unidades`, { method: 'POST', body: JSON.stringify(input) }),
  listarUnidadesPorTipo: (tipoId: string) =>
    apiFetch<InsumoResponse[]>(`/patrimonio/tipos-insumo/${tipoId}/unidades`),

  // Insumos (unidades individuais)
  listarInsumos: (tipoId?: string) =>
    apiFetch<InsumoResponse[]>(`/patrimonio/insumos${tipoId ? `?tipoId=${tipoId}` : ''}`),
  colocarInsumoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/insumos/${id}/manutencao`, { method: 'PATCH' }),
  liberarInsumoManutencao: (id: string) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}/liberar-manutencao`, { method: 'PATCH' }),
  excluirInsumo: (id: string) => apiFetch<void>(`/patrimonio/insumos/${id}`, { method: 'DELETE' }),

  // Atribuições
  listarTodasAtribuicoes: () => apiFetch<AtribuicaoPatrimonioResponse[]>('/patrimonio/atribuicoes'),
  atribuirPatrimonio: (input: AtribuirPatrimonioInput) =>
    apiFetch<AtribuicaoPatrimonioResponse>('/patrimonio/atribuicoes', { method: 'POST', body: JSON.stringify(input) }),
  devolverPatrimonio: (id: string) =>
    apiFetch<void>(`/patrimonio/atribuicoes/${id}/devolver`, { method: 'POST' }),
  listarAtribuicoesPorAssociado: (associadoId: string) =>
    apiFetch<AtribuicaoPatrimonioResponse[]>(`/patrimonio/atribuicoes/associado/${associadoId}`),

  // Solicitações
  criarSolicitacao: (input: CriarSolicitacaoInput) =>
    apiFetch<SolicitacaoPatrimonioResponse>('/patrimonio/solicitacoes', { method: 'POST', body: JSON.stringify(input) }),
  listarSolicitacoes: (status?: string) =>
    apiFetch<SolicitacaoPatrimonioResponse[]>(`/patrimonio/solicitacoes${status ? `?status=${status}` : ''}`),
  aprovarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/aprovar`, { method: 'PATCH' }),
  rejeitarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/rejeitar`, { method: 'PATCH' }),
}
