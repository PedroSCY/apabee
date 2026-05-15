import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Associado,
  AtualizarAssociadoInput,
  IAssociadoRepository,
  IAtualizarAssociadoUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { StatusAssociado } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Atualiza dados do associado e sincroniza status com acesso do usuário */
export class AtualizarAssociadoUseCase implements IAtualizarAssociadoUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a atualização e sincroniza status com o provedor de auth */
  async execute(input: AtualizarAssociadoInput): Promise<Associado> {
    const associado = await this.associadoRepository.findById(input.associadoId)
    if (!associado) throw new NotFoundException('Associado não encontrado')

    const atualizado = associado.atualizarDados({
      status: input.status as StatusAssociado | undefined,
      dataIngresso: input.dataIngresso,
      observacoes: input.observacoes,
    })

    const salvo = await this.associadoRepository.update(atualizado)

    if (input.status && input.status !== associado.status) {
      const usuario = associado.usuario
      const usuarioId = usuario.id

      if (input.status === StatusAssociado.SUSPENSO || input.status === StatusAssociado.INATIVO) {
        await this.provedorAuth.revogarAcesso(usuarioId)
        await this.usuarioRepository.update(usuario.desativar())
      } else if (input.status === StatusAssociado.ATIVO) {
        await this.provedorAuth.ativarAcesso(usuarioId)
        await this.usuarioRepository.update(usuario.ativar())
      }
    }

    return salvo
  }
}
