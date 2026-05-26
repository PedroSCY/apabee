import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Associado,
  AprovarAssociadoPendenteInput,
  IAssociadoRepository,
  IAprovarAssociadoPendenteUseCase,
  IProvedorAuth,
  IUsuarioRepository,
} from '@apa/core'
import { StatusAssociado, TipoNotificacao } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

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
    private readonly notificacaoService: NotificacaoService,
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
      cpf: input.cpf,
      status: StatusAssociado.ATIVO,
      dataIngresso: input.dataIngresso ?? associado.dataIngresso,
    })

    const resultado = await this.associadoRepository.update(atualizado)

    void this.notificacaoService.enviar({
      userId: usuarioId,
      tipo: TipoNotificacao.APROVACAO_CADASTRO,
      titulo: 'Cadastro aprovado!',
      corpo: 'Seu cadastro foi aprovado. Bem-vindo à APA!',
    })

    return resultado
  }
}
