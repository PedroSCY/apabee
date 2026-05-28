import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IPedidoLojaRepository, PedidoLoja } from '@apa/core'
import { PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ObterPedidoLojaUseCase {
  constructor(
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
  ) {}

  /**
   * @param id         UUID do pedido
   * @param clienteId  Sub do cliente autenticado — ignorado quando isAdmin = true
   * @param isAdmin    Se true, ignora a checagem de propriedade (rotas ADMIN)
   */
  async execute(id: string, clienteId: string, isAdmin = false): Promise<PedidoLoja> {
    const pedido = await this.pedidoRepo.findById(id)
    if (!pedido) throw new NotFoundException('Pedido não encontrado.')
    if (!isAdmin && pedido.clienteId !== clienteId) throw new ForbiddenException('Acesso negado.')
    return pedido
  }
}
