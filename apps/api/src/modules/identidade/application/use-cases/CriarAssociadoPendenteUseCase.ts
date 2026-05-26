import { ConflictException, Inject, Injectable } from '@nestjs/common'
import {
  Associado,
  CriarAssociadoPendenteInput,
  IAssociadoRepository,
  ICriarAssociadoPendenteUseCase,
  IProvedorAuth,
  IUsuarioRepository,
  Usuario,
} from '@apa/core'
import { RoleUsuario, StatusAssociado, TipoNotificacao } from '@apa/shared'
import { ASSOCIADO_REPOSITORY, PROVEDOR_AUTH, USUARIO_REPOSITORY } from '../../identidade.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

@Injectable()
/** Cria auto-cadastro de associado com status PENDENTE (sem acesso liberado) */
export class CriarAssociadoPendenteUseCase implements ICriarAssociadoPendenteUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: IAssociadoRepository,
    @Inject(PROVEDOR_AUTH)
    private readonly provedorAuth: IProvedorAuth,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  /** Executa o cadastro pendente: cria credencial sem senha e bloqueia acesso */
  async execute(input: CriarAssociadoPendenteInput): Promise<Associado> {
    const email = input.email.toLowerCase().trim()

    const existing = await this.usuarioRepository.findByEmail(email)
    if (existing) throw new ConflictException('E-mail já cadastrado')

    // Cria conta no Supabase sem senha e sem enviar e-mail — acesso só é liberado na aprovação
    const { id } = await this.provedorAuth.criarCredencial({
      email,
      role: RoleUsuario.ASSOCIADO,
      nome: input.nome,
      telefone: input.telefone,
      enviarEmail: false,
    })

    // Bloqueia acesso imediatamente — será liberado na aprovação
    await this.provedorAuth.revogarAcesso(id)

    const usuario = new Usuario({
      id,
      nome: input.nome,
      email,
      telefone: input.telefone,
      role: RoleUsuario.ASSOCIADO,
      ativo: false,
      criadoEm: new Date(),
    })
    await this.usuarioRepository.save(usuario)

    const associado = new Associado({
      id: crypto.randomUUID(),
      usuario,
      cpf: input.cpf,
      dataIngresso: new Date(),
      observacoes: input.observacoes,
      status: StatusAssociado.PENDENTE,
    })

    const resultado = await this.associadoRepository.save(associado)

    void this.notificacaoService.enviarParaAdmins(
      TipoNotificacao.NOVO_ASSOCIADO_PENDENTE,
      'Novo cadastro aguardando aprovação',
      `${input.nome} solicitou associação e aguarda aprovação.`,
      { associadoId: resultado.id },
    )

    return resultado
  }
}
