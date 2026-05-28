import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IClienteRepository, IPedidoLojaRepository } from '@apa/core'
import { StatusPedidoLoja } from '@apa/shared'
import { CLIENTE_REPOSITORY, PEDIDO_LOJA_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class RemoverEnderecoUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(PEDIDO_LOJA_REPOSITORY) private readonly pedidoRepo: IPedidoLojaRepository,
  ) {}

  async execute(id: string, clienteId: string): Promise<void> {
    const endereco = await this.clienteRepo.findEnderecoById(id)
    if (!endereco) throw new NotFoundException('Endereço não encontrado.')
    if (endereco.clienteId !== clienteId) throw new ForbiddenException('Acesso negado.')

    const { pedidos } = await this.pedidoRepo.findByClienteId(clienteId)
    const emAberto = pedidos.some(
      p => p.enderecoEntregaId === id && p.status === StatusPedidoLoja.AGUARDANDO_PAGAMENTO,
    )
    if (emAberto) {
      throw new BadRequestException('Este endereço está vinculado a um pedido em aberto.')
    }

    await this.clienteRepo.deleteEndereco(id)
  }
}
