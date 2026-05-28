import { Inject, Injectable } from '@nestjs/common'
import { Cliente, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class ListarClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepo.findAll()
  }
}
