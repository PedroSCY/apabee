import { CategoriaDocumento } from '@apa/shared';

/** Propriedades da entidade Documento. */
interface DocumentoProps {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  arquivoUrl: string;
  tamanhoBytes: number;
  publicado: boolean;
  autorId: string;
  criadoEm: Date;
}

/** Documento da associação (atas, regulamentos, etc.). */
export class Documento {
  private readonly props: DocumentoProps;

  constructor(props: DocumentoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get titulo(): string { return this.props.titulo; }
  get categoria(): CategoriaDocumento { return this.props.categoria; }
  get arquivoUrl(): string { return this.props.arquivoUrl; }
  get tamanhoBytes(): number { return this.props.tamanhoBytes; }
  get publicado(): boolean { return this.props.publicado; }
  get autorId(): string { return this.props.autorId; }
  get criadoEm(): Date { return this.props.criadoEm; }

  /** Marca o documento como publicado. */
  publicar(): Documento {
    return new Documento({ ...this.props, publicado: true });
  }

  /** Marca o documento como não publicado. */
  despublicar(): Documento {
    return new Documento({ ...this.props, publicado: false });
  }

  /** Retorna o tamanho do arquivo em MB com duas casas decimais. */
  tamanhoEmMB(): number {
    return Math.round((this.props.tamanhoBytes / 1_048_576) * 100) / 100;
  }
}
