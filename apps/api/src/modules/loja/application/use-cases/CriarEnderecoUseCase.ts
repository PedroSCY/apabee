import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { EnderecoEntrega, IClienteRepository } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'

export interface CriarEnderecoInput {
  clienteId: string
  apelido: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

@Injectable()
export class CriarEnderecoUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: CriarEnderecoInput): Promise<EnderecoEntrega> {
    const existentes = await this.clienteRepo.findEnderecosByClienteId(input.clienteId)
    const principal = existentes.length === 0

    const endereco = new EnderecoEntrega({
      id: randomUUID(),
      ...input,
      principal,
    })

    return this.clienteRepo.saveEndereco(endereco)
  }
}
