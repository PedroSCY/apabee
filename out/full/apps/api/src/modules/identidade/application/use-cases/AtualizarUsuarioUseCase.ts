import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  AtualizarUsuarioInput,
  IAtualizarUsuarioUseCase,
  IUsuarioRepository,
  Usuario,
} from '@apa/core'
import { USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Atualiza dados cadastrais de um usuário (nome, email, role) */
export class AtualizarUsuarioUseCase implements IAtualizarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  /** Executa a atualização dos dados do usuário */
  async execute(input: AtualizarUsuarioInput): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findById(input.usuarioId)
    if (!usuario) throw new NotFoundException('Usuário não encontrado')

    const atualizado = usuario.atualizarDados({
      nome: input.nome,
      email: input.email,
      role: input.role,
    })

    return this.usuarioRepository.update(atualizado)
  }
}
