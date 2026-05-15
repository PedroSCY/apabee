import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import {
  CriarPedidoInput,
  ICampanhaRepository,
  ICriarPedidoUseCase,
  IEstoqueProdutoRepository,
  IItemPedidoRepository,
  IPedidoRepository,
  IProdutoRepository,
  ItemPedido,
  Pedido,
} from '@apa/core'
import { StatusPedido } from '@apa/shared'
import { ITEM_PEDIDO_REPOSITORY, PEDIDO_REPOSITORY } from '../../comercial.tokens'
import { ESTOQUE_PRODUTO_REPOSITORY, PRODUTO_REPOSITORY } from '../../../catalogo/catalogo.tokens'

// Token local para evitar importação circular com o módulo producao (RN24)
const CAMPANHA_REPOSITORY = 'CAMPANHA_REPOSITORY'

@Injectable()
export class CriarPedidoUseCase implements ICriarPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY) private readonly pedidoRepo: IPedidoRepository,
    @Inject(ITEM_PEDIDO_REPOSITORY) private readonly itemRepo: IItemPedidoRepository,
    @Inject(PRODUTO_REPOSITORY) private readonly produtoRepo: IProdutoRepository,
    @Inject(ESTOQUE_PRODUTO_REPOSITORY) private readonly estoqueRepo: IEstoqueProdutoRepository,
    @Inject(CAMPANHA_REPOSITORY) private readonly campanhaRepo: ICampanhaRepository,
  ) {}

  async execute(input: CriarPedidoInput): Promise<Pedido> {
    if (!input.itens.length) throw new BadRequestException('Pedido deve ter ao menos um item.')

    const pedidoId = randomUUID()
    const itens: ItemPedido[] = []

    for (const itemIn of input.itens) {
      const produto = await this.produtoRepo.findById(itemIn.produtoId)
      if (!produto) throw new NotFoundException(`Produto ${itemIn.produtoId} não encontrado.`)
      if (!produto.estaDisponivel()) throw new BadRequestException(`Produto "${produto.nome}" não está disponível.`)

      const estoque = await this.estoqueRepo.findByProduto(itemIn.produtoId)
      if (!estoque || !estoque.temSaldo(itemIn.quantidade)) {
        throw new BadRequestException(`Saldo insuficiente para "${produto.nome}".`)
      }

      // RN24: registra campanhaCodigo no item para rastreabilidade ANVISA
      let campanhaCodigo: string | undefined
      if (produto.campanhaId) {
        const campanha = await this.campanhaRepo.findById(produto.campanhaId)
        campanhaCodigo = campanha?.codigo
      }

      itens.push(new ItemPedido({
        id: randomUUID(),
        pedidoId,
        produtoId: itemIn.produtoId,
        quantidade: itemIn.quantidade,
        precoUnitario: produto.preco,
        campanhaCodigo,
      }))
    }

    const pedido = new Pedido({
      id: pedidoId,
      clienteNome: input.clienteNome.trim(),
      clienteEmail: input.clienteEmail.trim(),
      clienteTelefone: input.clienteTelefone?.trim(),
      status: StatusPedido.PENDENTE,
      itens,
      criadoEm: new Date(),
    })

    const saved = await this.pedidoRepo.save(pedido)
    await this.itemRepo.saveMany(itens)
    return saved
  }
}
