/** Propriedades da entidade Ata. */
interface AtaProps {
  id: string;
  titulo: string;
  conteudo: string;
  autorId: string;
  dataReuniao: Date;
  publicada: boolean;
  criadoEm: Date;
}

/** Ata de reunião da associação. */
export class Ata {
  private readonly props: AtaProps;

  constructor(props: AtaProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get titulo(): string { return this.props.titulo; }
  get conteudo(): string { return this.props.conteudo; }
  get autorId(): string { return this.props.autorId; }
  get dataReuniao(): Date { return this.props.dataReuniao; }
  get publicada(): boolean { return this.props.publicada; }
  get criadoEm(): Date { return this.props.criadoEm; }

  /** Marca a ata como publicada. */
  publicar(): Ata {
    return new Ata({ ...this.props, publicada: true });
  }

  /** Marca a ata como não publicada. */
  despublicar(): Ata {
    return new Ata({ ...this.props, publicada: false });
  }

  toJSON() { return { ...this.props } }
}
