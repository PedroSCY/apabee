interface ItemPedidoProps {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  campanhaCodigo?: string;
}

export class ItemPedido {
  private readonly props: ItemPedidoProps;

  constructor(props: ItemPedidoProps) {
    this.props = props;
  }

  get id(): string { return this.props.id; }
  get pedidoId(): string { return this.props.pedidoId; }
  get produtoId(): string { return this.props.produtoId; }
  get quantidade(): number { return this.props.quantidade; }
  get precoUnitario(): number { return this.props.precoUnitario; }
  get campanhaCodigo(): string | undefined { return this.props.campanhaCodigo; }

  subtotal(): number {
    return this.props.quantidade * this.props.precoUnitario;
  }
}
