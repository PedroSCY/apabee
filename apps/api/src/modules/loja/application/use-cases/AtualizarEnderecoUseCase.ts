import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EnderecoEntrega, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

export interface AtualizarEnderecoInput {
  id: string
  clienteId: string
  apelido?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

@Injectable()
export class AtualizarEnderecoUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: AtualizarEnderecoInput): Promise<EnderecoEntrega> {
    const endereco = await this.clienteRepo.findEnderecoById(input.id)
    if (!endereco) throw new NotFoundException('Endereço não encontrado.')
    if (endereco.clienteId !== input.clienteId) throw new ForbiddenException('Acesso negado.')

    const atualizado = new EnderecoEntrega({
      id: endereco.id,
      clienteId: endereco.clienteId,
      apelido: input.apelido ?? endereco.apelido,
      logradouro: input.logradouro ?? endereco.logradouro,
      numero: input.numero ?? endereco.numero,
      complemento: input.complemento ?? endereco.complemento,
      bairro: input.bairro ?? endereco.bairro,
      cidade: input.cidade ?? endereco.cidade,
      estado: input.estado ?? endereco.estado,
      cep: input.cep ?? endereco.cep,
      principal: endereco.principal,
    })

    return this.clienteRepo.updateEndereco(atualizado)
  }
}
