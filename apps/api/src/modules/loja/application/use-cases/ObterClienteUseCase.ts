import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cliente, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ObterClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(clienteId: string): Promise<Cliente> {
    const cliente = await this.clienteRepo.findById(clienteId)
    if (!cliente) throw new NotFoundException('Cliente não encontrado.')
    return cliente
  }
}
