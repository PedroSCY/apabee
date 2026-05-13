import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  IAssociadoRepository,
  IExcluirAssociadoUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import {
  ASSOCIADO_REPOSITORY,
  PROVEDOR_AUTH,
  USUARIO_REPOSITORY,
} from '../../identidade.tokens'

@Injectable()
/** Exclui um associado, seu usuário e a credencial no Supabase Auth */
export class ExcluirAssociadoUseCase implements IExcluirAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a exclusão com verificação de autoria em atas/documentos */
  async execute(id: string): Promise<void> {
    const associado = await this.associadoRepository.findById(id)
    if (!associado) throw new NotFoundException('Associado não encontrado')

    const temAutoria = await this.usuarioRepository.contemRegistrosDeAutoria(associado.usuario.id)
    if (temAutoria) {
      throw new ConflictException(
        'Este usuário é autor de atas ou documentos. Remova ou reatribua esses registros antes de excluir a conta.',
      )
    }

    // Deletar o usuário dispara onDelete: Cascade → Associado → todos os filhos
    await this.usuarioRepository.delete(associado.usuario.id)
    await this.provedorAuth.removerCredencial(associado.usuario.id)
  }
}
