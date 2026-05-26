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

/** Categoria do insumo: FERRAMENTA (patrimônio atribuível) ou CONSUMIVEL (estoque que se consome). INSUMO mantido para compatibilidade de dados existentes. */
export enum CategoriaInsumo {
  FERRAMENTA = 'FERRAMENTA',
  INSUMO = 'INSUMO',
  CONSUMIVEL = 'CONSUMIVEL',
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

/** Tipo de movimento financeiro. */
export enum TipoMovimentoFinanceiro {
  ANTECIPACAO = 'ANTECIPACAO',
  RATEIO_FINAL = 'RATEIO_FINAL',
  CUSTO = 'CUSTO',
  MENSALIDADE = 'MENSALIDADE',
}

/** Ciclo de vida de uma mensalidade associativa. ISENTO é reversível; PAGO é terminal (até estorno via Asaas). */
export enum StatusMensalidade {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ISENTO = 'ISENTO',
}

/** Forma de pagamento registrada ao quitar uma mensalidade. ONLINE reservado para integração Asaas (Fase Asaas). */
export enum MetodoPagamentoMensalidade {
  PRESENCIAL = 'PRESENCIAL',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ONLINE = 'ONLINE',
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

/** Tipo de florada apícola. Define a qualidade e o preço de referência do mel. */
export enum TipoFlorada {
  LARANJEIRA = 'LARANJEIRA',
  EUCALIPTO = 'EUCALIPTO',
  SILVESTRE = 'SILVESTRE',
  AROEIRA = 'AROEIRA',
  OUTRO = 'OUTRO',
}

/** Ciclo de vida de uma safra apícola. */
export enum StatusSafra {
  PLANEJADA = 'PLANEJADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  ENCERRADA = 'ENCERRADA',
}

/** Ciclo de vida de uma campanha (produção coletiva ou aquisição). */
export enum StatusCampanha {
  PLANEJADA = 'PLANEJADA',
  ATIVA = 'ATIVA',
  CONCLUIDA = 'CONCLUIDA',
  LIQUIDADA = 'LIQUIDADA',
  CANCELADA = 'CANCELADA',
}

/** Estado de execução de uma ordem de produção. */
export enum StatusOrdemProducao {
  RASCUNHO = 'RASCUNHO',
  CONCLUIDA = 'CONCLUIDA',
}

/** Categorias de despesa de uma campanha para fins de rastreabilidade financeira. */
export enum CategoriaCusto {
  EMBALAGEM = 'EMBALAGEM',
  ROTULO = 'ROTULO',
  TRANSPORTE = 'TRANSPORTE',
  PROCESSAMENTO = 'PROCESSAMENTO',
  CERTIFICACAO = 'CERTIFICACAO',
  TAXA = 'TAXA',
  PERDA = 'PERDA',
  MAO_DE_OBRA_CONTRATADA = 'MAO_DE_OBRA_CONTRATADA',
  OUTRO = 'OUTRO',
}

/** Tipo de contribuição de um associado a uma campanha. COLHEITA para campanhas de produção; DINHEIRO para campanhas de aquisição. */
export enum TipoContribuicao {
  COLHEITA = 'COLHEITA',
  DINHEIRO = 'DINHEIRO',
}

/** Destino do item adquirido numa campanha de AQUISIÇÃO. Define o que é criado após a compra. */
export enum TipoDestinoAquisicao {
  EQUIPAMENTO = 'EQUIPAMENTO',
  CONSUMIVEL = 'CONSUMIVEL',
  MATERIA_PRIMA = 'MATERIA_PRIMA',
}

/** Discrimina se a campanha de aquisição é para benefício individual dos associados ou patrimônio da APA. */
export enum DestinatarioCampanha {
  INDIVIDUAL = 'INDIVIDUAL',
  APA        = 'APA',
}

/** Origem de uma contribuição, cota ou pedido: associado físico ou caixa da própria APA. */
export enum OrigemContribuicao {
  ASSOCIADO       = 'ASSOCIADO',
  RECURSO_PROPRIO = 'RECURSO_PROPRIO',
}