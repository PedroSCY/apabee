import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { IProvedorAuth, IUsuarioRepository } from '@apa/core'
import { PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

/** Dados para redefinição de senha de um usuário */
export interface AtualizarSenhaInput {
  usuarioId: string
  senha: string
}

@Injectable()
/** Redefine a senha de um usuário no Supabase Auth */
export class AtualizarSenhaUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a redefinição da senha no provedor de auth */
  async execute(input: AtualizarSenhaInput): Promise<void> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')
    await this.provedorAuth.definirSenha(usuario.id, input.senha)
  }
}
