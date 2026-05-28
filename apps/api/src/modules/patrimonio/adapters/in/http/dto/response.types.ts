import { CategoriaInsumo, StatusAtribuicao, StatusPatrimonio, StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'

// ─── Equipamento ─────────────────────────────────────────────────────────────

export interface EquipamentoResponse {
  id: string
  nome: string
  numeroSerie?: string
  descricao?: string
  status: StatusPatrimonio
  criadoEm: Date
}

// ─── Tipo insumo ─────────────────────────────────────────────────────────────

export interface TipoInsumoResponse {
  id: string
  nome: string
  categoria: CategoriaInsumo
  sigla: string
  descricao?: string
  criadoEm: Date
}

export interface TipoInsumoResumoResponse {
  id: string
  nome: string
  categoria: CategoriaInsumo
  sigla: string
}

// ─── Insumo ──────────────────────────────────────────────────────────────────

export interface InsumoResponse {
  id: string
  identificador: string
  tipoInsumoId: string
  tipoInsumo: TipoInsumoResumoResponse
  descricao?: string
  status: StatusPatrimonio
  criadoEm: Date
}

// ─── Atribuição patrimônio ───────────────────────────────────────────────────

export interface AtribuicaoPatrimonioResponse {
  id: string
  patrimonioId: string
  tipoPatrimonio: TipoPatrimonio
  associadoId: string
  dataInicio: Date
  dataFim?: Date
  status: StatusAtribuicao
  observacao?: string
}

// ─── Solicitação patrimônio ──────────────────────────────────────────────────

export interface SolicitacaoPatrimonioResponse {
  id: string
  tipoPatrimonio: TipoPatrimonio
  patrimonioId?: string
  tipoInsumoId?: string
  quantidade?: number
  associadoId: string
  justificativa?: string
  status: StatusSolicitacaoPatrimonio
  criadoEm: Date
  resolvidoEm?: Date
}
