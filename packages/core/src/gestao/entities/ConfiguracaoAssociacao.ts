/** Propriedades da entidade ConfiguracaoAssociacao. */
interface ConfiguracaoAssociacaoProps {
  id: string;
  nomeExibido: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  // Tema — CSS variables (HSL ou hex)
  corFundo?: string;
  corTexto?: string;
  corPrimaria?: string;
  corPrimariaForeground?: string;
  corSidebar?: string;
  corAccent?: string;
  atualizadoEm: Date;
}

/** Configurações singleton da associação (dados e tema visual). */
export class ConfiguracaoAssociacao {
  private readonly props: ConfiguracaoAssociacaoProps;

  constructor(props: ConfiguracaoAssociacaoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get nomeExibido(): string { return this.props.nomeExibido; }
  get cnpj(): string | undefined { return this.props.cnpj; }
  get email(): string | undefined { return this.props.email; }
  get telefone(): string | undefined { return this.props.telefone; }
  get endereco(): string | undefined { return this.props.endereco; }
  get corFundo(): string | undefined { return this.props.corFundo; }
  get corTexto(): string | undefined { return this.props.corTexto; }
  get corPrimaria(): string | undefined { return this.props.corPrimaria; }
  get corPrimariaForeground(): string | undefined { return this.props.corPrimariaForeground; }
  get corSidebar(): string | undefined { return this.props.corSidebar; }
  get corAccent(): string | undefined { return this.props.corAccent; }
  get atualizadoEm(): Date { return this.props.atualizadoEm; }

  /** Atualiza campos da configuração e retorna nova instância. */
  atualizar(dados: Partial<Omit<ConfiguracaoAssociacaoProps, 'id' | 'atualizadoEm'>>): ConfiguracaoAssociacao {
    return new ConfiguracaoAssociacao({ ...this.props, ...dados, atualizadoEm: new Date() });
  }

  toJSON() { return { ...this.props }; }
}
