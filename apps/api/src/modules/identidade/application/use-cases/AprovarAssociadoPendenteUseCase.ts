import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Associado,
  AprovarAssociadoPendenteInput,
  IAssociadoRepository,
  IAprovarAssociadoPendenteUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { StatusAssociado } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'

@Injectable()
/** Aprova um associado pendente: define senha, libera acesso e ativa o registro */
export class AprovarAssociadoPendenteUseCase implements IAprovarAssociadoPendenteUseCase {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
  ) {}

  /** Executa a aprovação: define senha, ativa no Supabase e atualiza o banco */
  async execute(input: AprovarAssociadoPendenteInput): Promise<Associado> {
    const associado = await this.associadoRepository.findById(input.associadoId)
    if (!associado) throw new NotFoundException('Associado não encontrado')
    if (associado.status !== StatusAssociado.PENDENTE) {
      throw new BadRequestException('Apenas associados com status PENDENTE podem ser aprovados')
    }

    const usuarioId = associado.usuario.id

    // Define senha e libera acesso no Supabase
    await this.provedorAuth.definirSenha(usuarioId, input.senha)
    await this.provedorAuth.ativarAcesso(usuarioId)

    // Atualiza metadata com associadoId para o JWT
    await this.provedorAuth.atualizarMetadata(usuarioId, { associadoId: associado.id })

    // Ativa o Usuario no banco
    const usuarioAtivo = associado.usuario.ativar()
    await this.usuarioRepository.update(usuarioAtivo)

    // Ativa o Associado
    const atualizado = associado.atualizarDados({
      status: StatusAssociado.ATIVO,
      dataIngresso: input.dataIngresso ?? associado.dataIngresso,
    })

    return this.associadoRepository.update(atualizado)
  }
}
