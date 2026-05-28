import {
  CategoriaCusto,
  DestinatarioCampanha,
  OrigemContribuicao,
  StatusCampanha,
  StatusOrdemProducao,
  StatusSafra,
  TipoContribuicao,
  TipoLote,
} from '@apa/shared'

// ─── Florada ─────────────────────────────────────────────────────────────────

export interface FloradaResponse {
  id: string
  nome: string
  descricao?: string
  ativa: boolean
  criadoEm: Date
}

// ─── Safra ───────────────────────────────────────────────────────────────────

export interface SafraResponse {
  id: string
  nome: string
  floradaId: string
  floradaNome?: string
  dataInicio: Date
  dataFim?: Date
  status: StatusSafra
}

// ─── Campanha ─────────────────────────────────────────────────────────────────

export interface CampanhaResponse {
  id: string
  codigo: string
  nome: string
  tipo: TipoLote
  safraId?: string
  dataInicio: Date
  dataFim?: Date
  status: StatusCampanha
  destinatario?: DestinatarioCampanha
  valorMeta?: number
  prazoContribuicao?: Date
  valorMinimo?: number
  valorMaximo?: number
  receitaTotal: number
  custoTotal: number
  criadoEm: Date
}

// ─── Contribuição ─────────────────────────────────────────────────────────────

export interface ContribuicaoResponse {
  id: string
  campanhaId: string
  associadoId: string | null
  tipo: TipoContribuicao
  valorMonetario?: number
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  descricao?: string
  liquidado: boolean
  criadoEm: Date
}

// ─── Cota ────────────────────────────────────────────────────────────────────

export interface CotaResponse {
  id: string
  campanhaId: string
  associadoId: string | null
  origem: OrigemContribuicao
  valor: number
  pago: boolean
  dataRegistro: Date
  dataConfirmacao: Date | null
}

// ─── Custo Campanha ───────────────────────────────────────────────────────────

export interface CustoCampanhaResponse {
  id: string
  campanhaId: string
  descricao: string
  valor: number
  categoria: CategoriaCusto
  pagoPorId?: string
  comprovanteUrl?: string
  criadoEm: Date
}

// ─── Ordem de Produção ────────────────────────────────────────────────────────

export interface OrdemProducaoResponse {
  id: string
  campanhaId: string
  produtoId: string
  quantidade: number
  status: StatusOrdemProducao
  perdaPercentual: number
  produtosGerados?: number
  quantidadeReal: number | null
  sobrasRecuperadas: number | null
  observacao: string | null
  materiaisConsumidos: any[]
  criadoEm: Date
  confirmadoEm: Date | null
}

// ─── Apuração Campanha ────────────────────────────────────────────────────────

export interface ApuracaoCampanhaResponse {
  id: string
  campanhaId: string
  faturamentoTotal: number
  custoTotal: number
  lucroLiquido: number
  liquidadoEm: Date
  participantes: any[]
}

// ─── Item de Aquisição ────────────────────────────────────────────────────────

export interface ItemAquisicaoResponse {
  id: string
  campanhaId: string
  nome: string
  precoUnitario: number
  quantidadeMeta: number
  quantidadeTotalPedida: number
  unidade: string
  tipoDestinoId?: string
  metaAtingida: boolean
  valorTotalPedido: number
  criadoEm: Date
}

// ─── Meta de Produção ─────────────────────────────────────────────────────────

export interface MetaProducaoResponse {
  id: string
  campanhaId: string
  produtoId: string
  nomeProduto?: string
  precoProduto?: number
  quantidadePlanejada: number
  perdaPercentualEstimada?: number
  receitaEsperada?: number
  materiaisNecessarios?: any[]
  viavelComEstoqueCampanha?: boolean
  criadoEm: Date
}

// ─── Pedido de Aquisição ──────────────────────────────────────────────────────

export interface PedidoAquisicaoResponse {
  id: string
  campanhaId: string
  itemAquisicaoId: string
  associadoId?: string
  origem: OrigemContribuicao
  quantidade: number
  valorTotal: number
  pago: boolean
  pagoEm?: Date
  entregue: boolean
  entregueEm?: Date
  criadoEm: Date
}

// ─── Colheita ─────────────────────────────────────────────────────────────────

export interface ColheitaResponse {
  id: string
  associadoId: string
  tipoMateriaPrimaId: string
  equipamentoId?: string
  campanhaId?: string
  safraId?: string
  volume: number
  dataColheita: Date
  observacao?: string
  criadoEm: Date
}

// ─── Tipo Matéria-Prima ───────────────────────────────────────────────────────

export interface TipoMateriaPrimaResponse {
  id: string
  nome: string
  unidade: string
  descricao?: string
}

// ─── Estoque Campanha ─────────────────────────────────────────────────────────

export interface EstoqueCampanhaResponse {
  id: string
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: string
}

// ─── Pool Matéria-Prima ───────────────────────────────────────────────────────

export interface PoolMateriaPrimaResponse {
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: string
  atualizadoEm: Date
}

// ─── Consumível com Saldo ─────────────────────────────────────────────────────

export interface ConsumivelComSaldoResponse {
  tipo: TipoMateriaPrimaResponse
  saldo: number
}
