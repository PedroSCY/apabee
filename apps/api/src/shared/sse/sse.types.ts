export type SseEventTipo =
  // Financeiro
  | 'financeiro:mensalidade-quitada'
  | 'financeiro:mensalidade-isenta'
  | 'financeiro:mensalidade-reativada'
  | 'financeiro:mensalidade-estornada'
  | 'financeiro:mensalidade-gerada'
  | 'financeiro:mensalidade-excluida'
  | 'financeiro:cobranca-emitida'
  | 'financeiro:cobranca-cancelada'
  // Identidade
  | 'identidade:associado-criado'
  | 'identidade:associado-aprovado'
  | 'identidade:associado-atualizado'
  | 'identidade:associado-excluido'
  | 'identidade:usuario-ativado'
  | 'identidade:usuario-desativado'
  | 'identidade:isencao-marcada'
  | 'identidade:isencao-removida'
  // Produção
  | 'producao:campanha-criada'
  | 'producao:campanha-iniciada'
  | 'producao:campanha-concluida'
  | 'producao:campanha-cancelada'
  | 'producao:campanha-liquidada'
  | 'producao:campanha-atualizada'
  | 'producao:contribuicao-registrada'
  | 'producao:contribuicao-removida'
  | 'producao:cota-registrada'
  | 'producao:cota-confirmada'
  | 'producao:cota-cancelada'
  | 'producao:ordem-executada'
  | 'producao:ordem-confirmada'
  | 'producao:colheita-confirmada'
  // Gestão
  | 'gestao:documento-publicado'
  | 'gestao:documento-despublicado'
  | 'gestao:ata-criada'
  | 'gestao:ata-atualizada'
  // Comunicação
  | 'comunicacao:aviso-publicado'
  | 'comunicacao:aviso-despublicado'
  // Catálogo
  | 'catalogo:produto-atualizado'
  // Patrimônio
  | 'patrimonio:solicitacao-criada'
  | 'patrimonio:solicitacao-aprovada'
  | 'patrimonio:solicitacao-rejeitada'

export interface SseEvent {
  tipo: SseEventTipo
  id?: string
  timestamp: string
  dados?: Record<string, unknown>
}
