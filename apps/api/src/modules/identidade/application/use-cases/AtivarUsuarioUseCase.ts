import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AlterarStatusUsuarioInput,
  IAtivarUsuarioUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Ativa o acesso de um usuário no banco e no Supabase Auth */
export class AtivarUsuarioUseCase implements IAtivarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Reativa o usuário e libera o acesso no Supabase */
  async execute(input: AlterarStatusUsuarioInput): Promise<void> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')
    await this.usuarioRepository.update(usuario.ativar())
    await this.provedorAuth.ativarAcesso(usuario.id)
  }
}
