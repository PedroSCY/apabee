import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EnderecoEntrega, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

@Injectable()
export class DefinirEnderecoPrincipalUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(id: string, clienteId: string): Promise<EnderecoEntrega> {
    const endereco = await this.clienteRepo.findEnderecoById(id)
    if (!endereco) throw new NotFoundException('Endereço não encontrado.')
    if (endereco.clienteId !== clienteId) throw new ForbiddenException('Acesso negado.')

    await this.clienteRepo.desmarcarTodosPrincipais(clienteId)
    const principal = endereco.marcarPrincipal()
    return this.clienteRepo.updateEndereco(principal)
  }
}
