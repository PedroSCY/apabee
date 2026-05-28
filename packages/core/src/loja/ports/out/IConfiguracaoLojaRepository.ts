export interface ConfiguracaoLoja {
  id: string
  ativaEntregaPrata: boolean
  ativaRetiradaLocal: boolean
  ativaACombinar: boolean
  ativaCorreios: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  pixExpiracaoMinutos: number
  mensagemConfirmacao?: string
  aceitaPix: boolean
  aceitaCartao: boolean
  maxParcelas: number
  minValorParcela: number
  /** E-mail do responsável que recebe notificações de novos pedidos */
  emailResponsavel?: string
}

export interface AtualizarConfiguracaoLojaInput {
  ativaEntregaPrata?: boolean
  ativaRetiradaLocal?: boolean
  ativaACombinar?: boolean
  ativaCorreios?: boolean
  enderecoRetirada?: string
  horarioAtendimento?: string
  contatoEntrega?: string
  pixExpiracaoMinutos?: number
  mensagemConfirmacao?: string
  aceitaPix?: boolean
  aceitaCartao?: boolean
  maxParcelas?: number
  minValorParcela?: number
  emailResponsavel?: string
}

export interface IConfiguracaoLojaRepository {
  obter(): Promise<ConfiguracaoLoja>
  atualizar(input: AtualizarConfiguracaoLojaInput): Promise<ConfiguracaoLoja>
}
