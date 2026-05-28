import { Inject, Injectable } from '@nestjs/common'
import { EnderecoEntrega, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ListarEnderecosClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(clienteId: string): Promise<EnderecoEntrega[]> {
    return this.clienteRepo.findEnderecosByClienteId(clienteId)
  }
}
