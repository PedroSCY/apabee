import { CategoriaInsumo } from '@apa/shared'

interface TipoInsumoProps {
  id: string
  nome: string
  descricao?: string
  categoria: CategoriaInsumo
  sigla: string
  criadoEm: Date
}

export class TipoInsumo {
  private readonly props: TipoInsumoProps

  constructor(props: TipoInsumoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get nome(): string { return this.props.nome }
  get descricao(): string | undefined { return this.props.descricao }
  get categoria(): CategoriaInsumo { return this.props.categoria }
  get sigla(): string { return this.props.sigla }
  get criadoEm(): Date { return this.props.criadoEm }

  atualizarDados(input: { nome?: string; descricao?: string; sigla?: string }): TipoInsumo {
    return new TipoInsumo({
      ...this.props,
      nome: input.nome ?? this.props.nome,
      descricao: input.descricao ?? this.props.descricao,
      sigla: input.sigla ?? this.props.sigla,
    })
  }

  toJSON(): TipoInsumoProps {
    return { ...this.props }
  }
}
