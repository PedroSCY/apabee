import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Cliente, IClienteRepository } from '@apa/core'
import { IUsuarioRepository } from '@apa/core'
import { IProvedorAuth } from '@apa/core'
import { CLIENTE_REPOSITORY } from '../../loja.tokens'
import { USUARIO_REPOSITORY, PROVEDOR_AUTH } from '../../../identidade/identidade.tokens'

export interface SincronizarClienteInput {
  userId: string
  nome: string
  email: string
  fotoUrl?: string
}

@Injectable()
export class CriarOuSincronizarClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
    @Inject(USUARIO_REPOSITORY) private readonly usuarioRepo: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH) private readonly provedorAuth: IProvedorAuth,
  ) {}

  async execute(input: SincronizarClienteInput): Promise<{ cliente: Cliente; isNew: boolean }> {
    // [A5] Fast return: verificar se o cliente já existe ANTES de qualquer chamada externa.
    // Evita a query em `usuarios` e a chamada ao Supabase Admin API em re-logins.
    const existente = await this.clienteRepo.findById(input.userId)
    if (existente) {
      return { cliente: existente, isNew: false }
    }

    // Barreira de conflito: e-mail não pode pertencer a um associado ou admin
    const usuarioExistente = await this.usuarioRepo.findByEmail(input.email)
    if (usuarioExistente) {
      throw new ConflictException(
        'Este e-mail pertence a uma conta de associado. Acesse pelo login da área de associados.',
      )
    }

    // Garantir o role ANTES de persistir o cliente — chamada idempotente.
    // Falha de rede / key inválida no Supabase Admin API é NÃO-BLOQUEANTE:
    // o JwtStrategy sincroniza o role na próxima requisição autenticada via DB fallback.
    try {
      await this.provedorAuth.definirRoleCliente(input.userId)
    } catch (err) {
      console.error('[CriarOuSincronizarCliente] Falha ao definir role CLIENTE (não-bloqueante):', err)
    }

    const agora = new Date()
    const cliente = new Cliente({
      id: input.userId,
      nome: input.nome,
      email: input.email,
      fotoUrl: input.fotoUrl,
      criadoEm: agora,
      atualizadoEm: agora,
    })

    const saved = await this.clienteRepo.save(cliente)
    return { cliente: saved, isNew: true }
  }
}
