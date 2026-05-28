import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Cliente, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

export interface AtualizarClienteInput {
  clienteId: string
  nome?: string
  telefone?: string
}

@Injectable()
export class AtualizarClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: AtualizarClienteInput): Promise<Cliente> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundException('Cliente não encontrado.')

    const atualizado = cliente.atualizarDados(
      input.nome ?? cliente.nome,
      input.telefone ?? cliente.telefone,
    )
    return this.clienteRepo.update(atualizado)
  }
}
