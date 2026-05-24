/** Propriedades da entidade ParticipanteAta. */
interface ParticipanteAtaProps {
  id: string;
  ataId: string;
  associadoId: string;
}

/** Associado participante de uma ata. */
export class ParticipanteAta {
  private readonly props: ParticipanteAtaProps;

  constructor(props: ParticipanteAtaProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get ataId(): string { return this.props.ataId; }
  get associadoId(): string { return this.props.associadoId; }
}
