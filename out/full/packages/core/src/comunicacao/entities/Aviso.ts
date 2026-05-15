import { CategoriaAviso } from '@apa/shared'

/** Propriedades da entidade Aviso. */
interface AvisoProps {
  id: string
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  publicado: boolean
  fixado: boolean
  criadoEm: Date
}

/** Aviso interno publicado pela associação. */
export class Aviso {
  private readonly props: AvisoProps

  constructor(props: AvisoProps) {
    this.props = props
  }

  get id(): string { return this.props.id }
  get titulo(): string { return this.props.titulo }
  get conteudo(): string { return this.props.conteudo }
  get categoria(): CategoriaAviso { return this.props.categoria }
  get publicado(): boolean { return this.props.publicado }
  get fixado(): boolean { return this.props.fixado }
  get criadoEm(): Date { return this.props.criadoEm }

  /** Marca o aviso como publicado. */
  publicar(): Aviso {
    return new Aviso({ ...this.props, publicado: true })
  }

  /** Marca o aviso como não publicado. */
  despublicar(): Aviso {
    return new Aviso({ ...this.props, publicado: false })
  }

  toJSON() { return { ...this.props } }
}
