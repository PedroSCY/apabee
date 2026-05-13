/** Define os papéis de usuário no sistema. ADMIN tem acesso total, ASSOCIADO tem acesso restrito aos próprios dados. */
export enum RoleUsuario {
  ADMIN = 'ADMIN',
  ASSOCIADO = 'ASSOCIADO',
}

/** Status do vínculo de um patrimônio a um associado. ATIVO = item em uso; DEVOLVIDO = item retornado. */
export enum StatusAtribuicao {
  ATIVO = 'ATIVO',
  DEVOLVIDO = 'DEVOLVIDO',
}

/** Categoria do insumo: FERRAMENTA (durável) ou INSUMO (consumível). */
export enum CategoriaInsumo {
  FERRAMENTA = 'FERRAMENTA',
  INSUMO = 'INSUMO',
}

/** Discrimina o tipo de patrimônio para unificar Equipamento e Insumo em AtribuicaoPatrimonio. */
export enum TipoPatrimonio {
  EQUIPAMENTO = 'EQUIPAMENTO',
  INSUMO = 'INSUMO'
}

/** Unidades de medida para matérias-primas e produtos. */
export enum UnidadeMedida {
  KG = 'KG',
  LITRO = 'LITRO',
  UNIDADE = 'UNIDADE',
  GRAMA = 'GRAMA',
}

/** Direção da movimentação de estoque. */
export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

/** Tipo do lote: PRODUCAO (colheita coletiva) ou AQUISICAO (compra para revenda). */
export enum TipoLote {
  PRODUCAO = 'PRODUCAO',
  AQUISICAO = 'AQUISICAO',
}

/** Tipo de venda: COLETIVA (lote inteiro) ou INDIVIDUAL (associado específico). */
export enum TipoVenda {
  COLETIVA = 'COLETIVA',
  INDIVIDUAL = 'INDIVIDUAL',
}

/** Tipo de movimento financeiro: ANTECIPACAO (venda individual) ou RATEIO_FINAL (fechamento do lote). */
export enum TipoMovimentoFinanceiro {
  ANTECIPACAO = 'ANTECIPACAO',
  RATEIO_FINAL = 'RATEIO_FINAL',
}

/** Ciclo de vida de um pedido da loja. Cancelamento só permitido até PENDENTE. */
export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_PREPARO = 'EM_PREPARO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

/** Categorias para classificação de documentos enviados. */
export enum CategoriaDocumento {
  ATA = 'ATA',
  FINANCEIRO = 'FINANCEIRO',
  PRESTACAO_CONTAS = 'PRESTACAO_CONTAS',
  RELATORIO = 'RELATORIO',
  OUTRO = 'OUTRO',
}

/** Ciclo de vida do associado. Pendente aguarda aprovação; Suspenso tem acesso bloqueado; Inativo é remoção permanente. */
export enum StatusAssociado {
  ATIVO = 'ATIVO',
  PENDENTE = 'PENDENTE',
  SUSPENSO = 'SUSPENSO',
  INATIVO = 'INATIVO',
}

/** Situação física de um equipamento ou insumo. */
export enum StatusPatrimonio {
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  MANUTENCAO = 'MANUTENCAO',
}

/** Status de um lote de produção/aquisição. */
export enum StatusLote {
  ABERTO = 'ABERTO',
  FECHADO = 'FECHADO',
}

/** Ciclo de publicação de um produto no catálogo. */
export enum StatusProduto {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
  ARQUIVADO = 'ARQUIVADO',
}

/** Status de uma solicitação de uso de patrimônio feita por associado. @deprecated Substituído por StatusSolicitacaoPatrimonio. */
export enum StatusSolicitacao {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  NA_FILA = 'NA_FILA',
  REPROVADO = 'REPROVADO',
}

/** Define a categoria do aviso interno. Usado para filtrar comunicados no dashboard. */
export enum CategoriaAviso {
  GERAL = 'GERAL',
  URGENTE = 'URGENTE',
  REUNIAO = 'REUNIAO',
  FINANCEIRO = 'FINANCEIRO',
}

/** Status da solicitação de uso de patrimônio. Aprovada gera AtribuicaoPatrimonio automaticamente. */
export enum StatusSolicitacaoPatrimonio {
  PENDENTE = 'PENDENTE',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA',
}

/** Tipo de solicitação de contato do formulário público. INTEGRACAO pode virar um Associado Pendente. */
export enum TipoSolicitacaoContato {
  CONTATO = 'CONTATO',
  COLETA = 'COLETA',
  INTEGRACAO = 'INTEGRACAO',
}

/** Status da solicitação de contato. Gerenciado pelo admin no painel de comunicação. */
export enum StatusSolicitacaoContato {
  PENDENTE = 'PENDENTE',
  VISUALIZADA = 'VISUALIZADA',
  RESOLVIDA = 'RESOLVIDA',
}