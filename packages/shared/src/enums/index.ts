export enum RoleUsuario {
  ADMIN = 'ADMIN',
  ASSOCIADO = 'ASSOCIADO',
}

export enum StatusAtribuicao {
  ATIVO = 'ATIVO',
  DEVOLVIDO = 'DEVOLVIDO',
}

export enum CategoriaInsumo {
  FERRAMENTA = 'FERRAMENTA',
  INSUMO = 'INSUMO',
}

export enum TipoPatrimonio {
  EQUIPAMENTO = 'EQUIPAMENTO',
  INSUMO = 'INSUMO'
}

export enum UnidadeMedida {
  KG = 'KG',
  LITRO = 'LITRO',
  UNIDADE = 'UNIDADE',
  GRAMA = 'GRAMA',
}

export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

export enum TipoLote {
  PRODUCAO = 'PRODUCAO',
  AQUISICAO = 'AQUISICAO',
}

export enum TipoVenda {
  COLETIVA = 'COLETIVA',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum TipoMovimentoFinanceiro {
  ANTECIPACAO = 'ANTECIPACAO',
  RATEIO_FINAL = 'RATEIO_FINAL',
}

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  EM_PREPARO = 'EM_PREPARO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export enum CategoriaDocumento {
  ATA = 'ATA',
  FINANCEIRO = 'FINANCEIRO',
  PRESTACAO_CONTAS = 'PRESTACAO_CONTAS',
  RELATORIO = 'RELATORIO',
  OUTRO = 'OUTRO',
}