import { Injectable, Inject } from '@nestjs/common'
import { DestinatariosAviso, TipoNotificacao } from '@apa/shared'
import { INotificacaoRepository, CriarNotificacaoInput } from '@apa/core'
import { NOTIFICACAO_REPOSITORY } from './notificacao.tokens'
import { SseService } from '../../shared/sse/sse.service'
import { PrismaService } from '../../shared/database/prisma.service'
import { EmailService } from './adapters/out/external/EmailService'

/** Tipos de notificação que também disparam e-mail. */
const TIPOS_COM_EMAIL = new Set<TipoNotificacao>([
  TipoNotificacao.MENSALIDADE_GERADA,
  TipoNotificacao.RATEIO_DISPONIVEL,
  TipoNotificacao.APROVACAO_CADASTRO,
  TipoNotificacao.COBRANCA_PIX_EMITIDA,
])

export interface EnviarNotificacaoInput {
  userId: string
  tipo: TipoNotificacao
  titulo: string
  corpo?: string
  dadosExtras?: Record<string, unknown>
}

@Injectable()
export class NotificacaoService {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repo: INotificacaoRepository,
    private readonly sse: SseService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  async enviar(input: EnviarNotificacaoInput): Promise<void> {
    const notificacao = await this.repo.criar(input)
    this.sse.emit('notificacao:nova', notificacao.userId, {
      id: notificacao.id,
      tipo: notificacao.tipo,
      titulo: notificacao.titulo,
      corpo: notificacao.corpo,
    })
    if (TIPOS_COM_EMAIL.has(input.tipo)) {
      void this.dispararEmail(input.userId, input.titulo, input.corpo ?? '')
    }
  }

  private async dispararEmail(userId: string, titulo: string, corpo: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { email: true, nome: true },
    })
    if (!usuario?.email) return
    await this.email.send(usuario.email, titulo, titulo, corpo)
  }

  /** Envia notificação para o usuário vinculado a um associado. */
  async enviarParaAssociado(
    associadoId: string,
    tipo: TipoNotificacao,
    titulo: string,
    corpo?: string,
    dadosExtras?: Record<string, unknown>,
  ): Promise<void> {
    const associado = await this.prisma.associado.findUnique({
      where: { id: associadoId },
      select: { usuarioId: true },
    })
    if (!associado) return
    await this.enviar({ userId: associado.usuarioId, tipo, titulo, corpo, dadosExtras })
  }

  /** Envia notificação para todos os usuários com role ADMIN. */
  async enviarParaAdmins(
    tipo: TipoNotificacao,
    titulo: string,
    corpo?: string,
    dadosExtras?: Record<string, unknown>,
  ): Promise<void> {
    const admins = await this.prisma.usuario.findMany({
      where: { role: 'ADMIN', ativo: true },
      select: { id: true },
    })
    const inputs: CriarNotificacaoInput[] = admins.map(a => ({
      userId: a.id, tipo, titulo, corpo, dadosExtras,
    }))
    await this.enviarParaVarios(inputs)
  }

  /** Envia notificação para todos os associados ativos. */
  async enviarParaTodosAssociados(
    tipo: TipoNotificacao,
    titulo: string,
    corpo?: string,
    dadosExtras?: Record<string, unknown>,
  ): Promise<void> {
    const associados = await this.prisma.associado.findMany({
      where: { status: 'ATIVO', deletadoEm: null },
      select: { usuarioId: true },
    })
    const inputs: CriarNotificacaoInput[] = associados.map(a => ({
      userId: a.usuarioId, tipo, titulo, corpo, dadosExtras,
    }))
    await this.enviarParaVarios(inputs)
  }

  async enviarParaVarios(inputs: CriarNotificacaoInput[]): Promise<void> {
    if (inputs.length === 0) return
    await this.repo.criarEmLote(inputs)
    for (const input of inputs) {
      this.sse.emit('notificacao:nova', input.userId, { tipo: input.tipo, titulo: input.titulo, corpo: input.corpo })
    }
    const comEmail = inputs.filter(i => TIPOS_COM_EMAIL.has(i.tipo as TipoNotificacao))
    if (comEmail.length > 0) {
      void this.dispararEmailsEmLote(comEmail)
    }
  }

  private async dispararEmailsEmLote(inputs: CriarNotificacaoInput[]): Promise<void> {
    const ids = [...new Set(inputs.map(i => i.userId))]
    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true },
    })
    const emailMap = new Map(usuarios.map(u => [u.id, u.email]))
    await Promise.allSettled(
      inputs.map(i => {
        const emailTo = emailMap.get(i.userId)
        if (!emailTo) return Promise.resolve()
        return this.email.send(emailTo, i.titulo, i.titulo, i.corpo ?? '')
      }),
    )
  }

  /** Envia notificação in-app para um conjunto específico de associados (por ID de associado). */
  async enviarParaAssociadosSelecionados(
    associadoIds: string[],
    tipo: TipoNotificacao,
    titulo: string,
    corpo?: string,
    dadosExtras?: Record<string, unknown>,
  ): Promise<void> {
    if (associadoIds.length === 0) return
    const associados = await this.prisma.associado.findMany({
      where: { id: { in: associadoIds }, deletadoEm: null },
      select: { usuarioId: true },
    })
    const inputs: CriarNotificacaoInput[] = associados.map(a => ({
      userId: a.usuarioId, tipo, titulo, corpo, dadosExtras,
    }))
    await this.enviarParaVarios(inputs)
  }

  /** Envia e-mail diretamente para associados sem criar notificação in-app. Usado pelo disparo de avisos. */
  async enviarEmailAvisoParaAssociados(
    titulo: string,
    corpo: string,
    destinatarios: DestinatariosAviso,
    selectedMemberIds?: string[],
  ): Promise<void> {
    let userIds: string[]

    if (destinatarios === DestinatariosAviso.SELECIONADOS) {
      if (!selectedMemberIds || selectedMemberIds.length === 0) return
      const associados = await this.prisma.associado.findMany({
        where: { id: { in: selectedMemberIds }, deletadoEm: null },
        select: { usuarioId: true },
      })
      userIds = associados.map(a => a.usuarioId)
    } else {
      const where: Record<string, unknown> = { deletadoEm: null }
      if (destinatarios === DestinatariosAviso.APENAS_ATIVOS) where['status'] = 'ATIVO'
      const associados = await this.prisma.associado.findMany({ where, select: { usuarioId: true } })
      userIds = associados.map(a => a.usuarioId)
    }

    if (userIds.length === 0) return
    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: userIds }, ativo: true },
      select: { email: true },
    })
    await Promise.allSettled(
      usuarios.map(u => this.email.send(u.email, titulo, titulo, corpo)),
    )
  }
}
