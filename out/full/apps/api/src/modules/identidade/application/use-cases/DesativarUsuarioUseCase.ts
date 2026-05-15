import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AlterarStatusUsuarioInput,
  IDesativarUsuarioUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Desativa o acesso de um usuário (ban no Supabase, inativo no banco) */
export class DesativarUsuarioUseCase implements IDesativarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a desativação (impede desativar ADMIN) */
  async execute(input: AlterarStatusUsuarioInput): Promise<void> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')
    if (usuario.isAdmin()) throw new BadRequestException('Não é possível desativar um administrador')
    await this.usuarioRepository.update(usuario.desativar())
    await this.provedorAuth.revogarAcesso(usuario.id)
  }
}
