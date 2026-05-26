import { CategoriaAviso, DestinatariosAviso } from '@apa/shared'

/** Propriedades da entidade Aviso. */
interface AvisoProps {
  id: string
  titulo: string
  conteudo: string
  categoria: CategoriaAviso
  publicado: boolean
  fixado: boolean
  destinatarios: DestinatariosAviso
  enviarEmail: boolean
  emailEnviado: boolean
  selectedMemberIds: string[]
  dataReuniao?: Date
  horarioReuniao?: string
  localReuniao?: string
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
  get destinatarios(): DestinatariosAviso { return this.props.destinatarios }
  get enviarEmail(): boolean { return this.props.enviarEmail }
  get emailEnviado(): boolean { return this.props.emailEnviado }
  get selectedMemberIds(): string[] { return this.props.selectedMemberIds }
  get dataReuniao(): Date | undefined { return this.props.dataReuniao }
  get horarioReuniao(): string | undefined { return this.props.horarioReuniao }
  get localReuniao(): string | undefined { return this.props.localReuniao }
  get criadoEm(): Date { return this.props.criadoEm }

  publicar(): Aviso {
    return new Aviso({ ...this.props, publicado: true })
  }

  despublicar(): Aviso {
    return new Aviso({ ...this.props, publicado: false })
  }

  marcarEmailEnviado(): Aviso {
    return new Aviso({ ...this.props, emailEnviado: true })
  }

  toJSON() { return { ...this.props } }
}
