import { apiFetch } from './client'

export type StatusCampanha = 'PLANEJADA' | 'ATIVA' | 'CONCLUIDA' | 'LIQUIDADA' | 'CANCELADA'
export type TipoCampanha = 'PRODUCAO' | 'AQUISICAO'
export type DestinatarioCampanha = 'INDIVIDUAL' | 'APA'
export type OrigemContribuicao = 'ASSOCIADO' | 'RECURSO_PROPRIO'
export type TipoContribuicao = 'COLHEITA' | 'DINHEIRO'
export type CategoriaCusto = 'EMBALAGEM' | 'ROTULO' | 'TRANSPORTE' | 'PROCESSAMENTO' | 'CERTIFICACAO' | 'TAXA' | 'PERDA' | 'MAO_DE_OBRA_CONTRATADA' | 'OUTRO'

export interface CampanhaResponse {
  id: string
  codigo: string
  nome: string
  tipo: TipoCampanha
  safraId?: string
  dataInicio: string
  dataFim?: string
  status: StatusCampanha
  destinatario?: DestinatarioCampanha
  valorMeta?: number
  prazoContribuicao?: string
  valorMinimo?: number
  valorMaximo?: number
  receitaTotal: number
  custoTotal: number
  criadoEm: string
}

export interface CriarCampanhaInput {
  nome: string
  tipo: TipoCampanha
  safraId?: string
  dataInicio: string
  dataFim?: string
  destinatario?: DestinatarioCampanha
  valorMeta?: number
  prazoContribuicao?: string
  valorMinimo?: number
  valorMaximo?: number
}

export interface ContribuicaoResponse {
  id: string
  campanhaId: string
  associadoId: string
  tipo: TipoContribuicao
  valorMonetario: number
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  descricao?: string
  liquidado: boolean
  criadoEm: string
}

export interface RegistrarContribuicaoInput {
  associadoId: string
  tipo: TipoContribuicao
  valorMonetario: number
  colheitaId?: string
  volume?: number
  tipoMateriaPrimaId?: string
  descricao?: string
}

export interface CustoResponse {
  id: string
  campanhaId: string
  descricao: string
  valor: number
  categoria: CategoriaCusto
  pagoPorId?: string
  comprovanteUrl?: string
  criadoEm: string
}

export interface RegistrarCustoInput {
  descricao: string
  valor: number
  categoria: CategoriaCusto
  pagoPorId?: string
}

// --- Ordens de Produção ---
export interface OrdemProducaoResponse {
  id: string
  campanhaId: string
  produtoId: string
  quantidade: number
  perdaPercentual: number
  status: 'PENDENTE' | 'EM_EXECUCAO' | 'CONCLUIDA'
  criadoEm: string
}

export interface CriarOrdemInput {
  produtoId: string
  quantidade: number
  perdaPercentual?: number
}

export interface ConsumoMaterial {
  nome: string
  quantidade: number
  unidade: string
}

// --- Cotas ---
export interface CotaResponse {
  id: string
  campanhaId: string
  associadoId?: string
  origem: OrigemContribuicao
  valor: number
  pago: boolean
  dataRegistro: string
  dataConfirmacao?: string
}

export interface RegistrarCotaInput {
  associadoId?: string
  valor: number
}

// --- Itens de Aquisição ---
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
  criadoEm: string
}

export interface CriarItemAquisicaoInput {
  nome: string
  precoUnitario: number
  quantidadeMeta: number
  unidade: string
  tipoDestinoId?: string
}

// --- Pedidos de Aquisição ---
export interface PedidoAquisicaoResponse {
  id: string
  campanhaId: string
  itemAquisicaoId: string
  associadoId?: string
  origem: OrigemContribuicao
  quantidade: number
  valorTotal: number
  pago: boolean
  pagoEm?: string
  entregue: boolean
  entregueEm?: string
  criadoEm: string
}

export interface RegistrarPedidoInput {
  itemAquisicaoId: string
  associadoId?: string
  origem: OrigemContribuicao
  quantidade: number
}

// --- Apuração ---
export interface ApuracaoParticipante {
  associadoId: string
  contribuicaoTotal: number
  percentual: number
  valorBruto: number
  custosRateados: number
  antecipacoes: number
  valorFinal: number
}

export interface ApuracaoResponse {
  id: string
  campanhaId: string
  faturamentoTotal: number
  custoTotal: number
  lucroLiquido: number
  liquidadoEm: string
  participantes: ApuracaoParticipante[]
}

export interface EstoqueCampanhaResponse {
  id: string
  tipoMateriaPrimaId: string
  quantidadeDisponivel: number
  unidade: string
}

export const campanhasApi = {
  listar: () => apiFetch<CampanhaResponse[]>('/producao/campanhas'),
  criar: (input: CriarCampanhaInput) =>
    apiFetch<CampanhaResponse>('/producao/campanhas', { method: 'POST', body: JSON.stringify(input) }),
  buscar: (id: string) => apiFetch<CampanhaResponse>(`/producao/campanhas/${id}`),
  iniciar: (id: string) =>
    apiFetch<CampanhaResponse>(`/producao/campanhas/${id}/iniciar`, { method: 'PATCH' }),
  concluir: (id: string) =>
    apiFetch<CampanhaResponse>(`/producao/campanhas/${id}/concluir`, { method: 'PATCH' }),
  cancelar: (id: string) =>
    apiFetch<CampanhaResponse>(`/producao/campanhas/${id}/cancelar`, { method: 'PATCH' }),
  atualizarReceita: (id: string, receitaTotal: number) =>
    apiFetch<CampanhaResponse>(`/producao/campanhas/${id}/receita`, {
      method: 'PATCH',
      body: JSON.stringify({ receitaTotal }),
    }),
  liquidar: (id: string) =>
    apiFetch<CampanhaResponse>(`/producao/campanhas/${id}/liquidar`, { method: 'PATCH' }),
  deletar: (id: string) =>
    apiFetch<void>(`/producao/campanhas/${id}`, { method: 'DELETE' }),

  listarContribuicoes: (id: string) =>
    apiFetch<ContribuicaoResponse[]>(`/producao/campanhas/${id}/contribuicoes`),
  registrarContribuicao: (id: string, input: RegistrarContribuicaoInput) =>
    apiFetch<ContribuicaoResponse>(`/producao/campanhas/${id}/contribuicoes`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  removerContribuicao: (campanhaId: string, contribuicaoId: string) =>
    apiFetch<void>(`/producao/campanhas/${campanhaId}/contribuicoes/${contribuicaoId}`, { method: 'DELETE' }),

  listarCustos: (id: string) =>
    apiFetch<CustoResponse[]>(`/producao/campanhas/${id}/custos`),
  registrarCusto: (id: string, input: RegistrarCustoInput) =>
    apiFetch<CustoResponse>(`/producao/campanhas/${id}/custos`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  removerCusto: (campanhaId: string, custoId: string) =>
    apiFetch<void>(`/producao/campanhas/${campanhaId}/custos/${custoId}`, { method: 'DELETE' }),

  // Ordens de Produção
  listarOrdens: (campanhaId: string) =>
    apiFetch<OrdemProducaoResponse[]>(`/producao/campanhas/${campanhaId}/ordens`),
  criarOrdem: (campanhaId: string, input: CriarOrdemInput) =>
    apiFetch<OrdemProducaoResponse>(`/producao/campanhas/${campanhaId}/ordens`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  executarOrdem: (campanhaId: string, ordemId: string) =>
    apiFetch<OrdemProducaoResponse>(
      `/producao/campanhas/${campanhaId}/ordens/${ordemId}/executar`, { method: 'PATCH' }
    ),
  removerOrdem: (campanhaId: string, ordemId: string) =>
    apiFetch<void>(`/producao/campanhas/${campanhaId}/ordens/${ordemId}`, { method: 'DELETE' }),
  calcularConsumo: (campanhaId: string, ordemId: string) =>
    apiFetch<{ materiais: ConsumoMaterial[] }>(
      `/producao/campanhas/${campanhaId}/ordens/${ordemId}/consumo`
    ),

  // Cotas
  listarCotas: (campanhaId: string) =>
    apiFetch<CotaResponse[]>(`/producao/campanhas/${campanhaId}/cotas`),
  registrarCota: (campanhaId: string, input: RegistrarCotaInput) =>
    apiFetch<CotaResponse>(`/producao/campanhas/${campanhaId}/cotas`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  confirmarCota: (campanhaId: string, cotaId: string) =>
    apiFetch<CotaResponse>(`/producao/campanhas/${campanhaId}/cotas/${cotaId}/confirmar`, {
      method: 'PATCH',
    }),
  cancelarCota: (campanhaId: string, cotaId: string) =>
    apiFetch<void>(`/producao/campanhas/${campanhaId}/cotas/${cotaId}`, { method: 'DELETE' }),

  // Itens de Aquisição
  listarItens: (campanhaId: string) =>
    apiFetch<ItemAquisicaoResponse[]>(`/producao/campanhas/${campanhaId}/itens`),
  adicionarItem: (campanhaId: string, input: CriarItemAquisicaoInput) =>
    apiFetch<ItemAquisicaoResponse>(`/producao/campanhas/${campanhaId}/itens`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  removerItem: (campanhaId: string, itemId: string) =>
    apiFetch<void>(`/producao/campanhas/${campanhaId}/itens/${itemId}`, { method: 'DELETE' }),
  distribuirItens: (campanhaId: string) =>
    apiFetch<ApuracaoResponse>(`/producao/campanhas/${campanhaId}/distribuir`, { method: 'POST' }),

  // Estoque da campanha
  listarEstoque: (campanhaId: string) =>
    apiFetch<EstoqueCampanhaResponse[]>(`/producao/campanhas/${campanhaId}/estoque-campanha`),

  // Pedidos de Aquisição
  listarPedidos: (campanhaId: string, associadoId?: string) =>
    apiFetch<PedidoAquisicaoResponse[]>(
      `/producao/campanhas/${campanhaId}/pedidos-aquisicao${associadoId ? `?associadoId=${associadoId}` : ''}`
    ),
  registrarPedido: (campanhaId: string, input: RegistrarPedidoInput) =>
    apiFetch<PedidoAquisicaoResponse>(`/producao/campanhas/${campanhaId}/pedidos-aquisicao`, {
      method: 'POST', body: JSON.stringify(input),
    }),
  confirmarPagamentoPedido: (pedidoId: string) =>
    apiFetch<PedidoAquisicaoResponse>(`/producao/campanhas/pedidos-aquisicao/${pedidoId}/pagar`, { method: 'PATCH' }),
  marcarPedidoEntregue: (pedidoId: string) =>
    apiFetch<PedidoAquisicaoResponse>(`/producao/campanhas/pedidos-aquisicao/${pedidoId}/entregar`, { method: 'PATCH' }),

  // Apuração
  obterApuracao: (campanhaId: string) =>
    apiFetch<ApuracaoResponse>(`/producao/campanhas/${campanhaId}/apuracao`),
  calcularPreviewRateio: (campanhaId: string) =>
    apiFetch<{ participantes: ApuracaoParticipante[] }>(
      `/producao/campanhas/${campanhaId}/rateio-preview`
    ),
}
