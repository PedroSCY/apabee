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
  /** Lista todos os equipamentos. */
  listarEquipamentos: () =>
    apiFetch<EquipamentoResponse[]>('/patrimonio/equipamentos'),

  /** Busca um equipamento pelo ID. */
  buscarEquipamento: (id: string) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`),

  /** Cria um novo equipamento. */
  criarEquipamento: (input: CriarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>('/patrimonio/equipamentos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Atualiza dados de um equipamento. */
  atualizarEquipamento: (id: string, input: AtualizarEquipamentoInput) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Marca um equipamento como em manutenção. */
  colocarEquipamentoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/equipamentos/${id}/manutencao`, { method: 'PATCH' }),

  /** Libera um equipamento da manutenção. */
  liberarEquipamentoManutencao: (id: string) =>
    apiFetch<EquipamentoResponse>(`/patrimonio/equipamentos/${id}/liberar-manutencao`, { method: 'PATCH' }),

  /** Exclui um equipamento. */
  excluirEquipamento: (id: string) =>
    apiFetch<void>(`/patrimonio/equipamentos/${id}`, { method: 'DELETE' }),

  /** Lista todos os insumos. */
  listarInsumos: () =>
    apiFetch<InsumoResponse[]>('/patrimonio/insumos'),

  /** Busca um insumo pelo ID. */
  buscarInsumo: (id: string) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}`),

  /** Cria um novo insumo. */
  criarInsumo: (input: CriarInsumoInput) =>
    apiFetch<InsumoResponse>('/patrimonio/insumos', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Atualiza dados de um insumo. */
  atualizarInsumo: (id: string, input: AtualizarInsumoInput) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  /** Marca um insumo como em manutenção. */
  colocarInsumoEmManutencao: (id: string) =>
    apiFetch<void>(`/patrimonio/insumos/${id}/manutencao`, { method: 'PATCH' }),

  /** Libera um insumo da manutenção. */
  liberarInsumoManutencao: (id: string) =>
    apiFetch<InsumoResponse>(`/patrimonio/insumos/${id}/liberar-manutencao`, { method: 'PATCH' }),

  /** Exclui um insumo. */
  excluirInsumo: (id: string) =>
    apiFetch<void>(`/patrimonio/insumos/${id}`, { method: 'DELETE' }),

  /** Lista todas as atribuições de patrimônio. */
  listarTodasAtribuicoes: () =>
    apiFetch<AtribuicaoPatrimonioResponse[]>('/patrimonio/atribuicoes'),

  /** Atribui um patrimônio a um associado. */
  atribuirPatrimonio: (input: AtribuirPatrimonioInput) =>
    apiFetch<AtribuicaoPatrimonioResponse>('/patrimonio/atribuicoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Devolve um patrimônio atribuído. */
  devolverPatrimonio: (id: string) =>
    apiFetch<void>(`/patrimonio/atribuicoes/${id}/devolver`, { method: 'POST' }),

  /** Lista atribuições de um associado específico. */
  listarAtribuicoesPorAssociado: (associadoId: string) =>
    apiFetch<AtribuicaoPatrimonioResponse[]>(
      `/patrimonio/atribuicoes/associado/${associadoId}`,
    ),

  /** Cria uma solicitação de patrimônio. */
  criarSolicitacao: (input: CriarSolicitacaoInput) =>
    apiFetch<SolicitacaoPatrimonioResponse>('/patrimonio/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  /** Lista solicitações de patrimônio, opcionalmente filtradas por status. */
  listarSolicitacoes: (status?: string) =>
    apiFetch<SolicitacaoPatrimonioResponse[]>(
      `/patrimonio/solicitacoes${status ? `?status=${status}` : ''}`,
    ),

  /** Aprova uma solicitação de patrimônio. */
  aprovarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/aprovar`, {
      method: 'PATCH',
    }),

  /** Rejeita uma solicitação de patrimônio. */
  rejeitarSolicitacao: (id: string) =>
    apiFetch<SolicitacaoPatrimonioResponse>(`/patrimonio/solicitacoes/${id}/rejeitar`, {
      method: 'PATCH',
    }),
}
