import { CategoriaAviso } from '@apa/shared'

interface AvisoProps {
  id: string
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  publicado: boolean
  fixado: boolean
  criadoEm: Date
}

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

  publicar(): Aviso {
    return new Aviso({ ...this.props, publicado: true })
  }

  despublicar(): Aviso {
    return new Aviso({ ...this.props, publicado: false })
  }

  toJSON() { return { ...this.props } }
}
