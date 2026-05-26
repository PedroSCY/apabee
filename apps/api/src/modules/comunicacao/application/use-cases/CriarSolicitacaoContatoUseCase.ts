import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { StatusSolicitacaoContato, TipoNotificacao } from '@apa/shared'
import {
  CriarSolicitacaoContatoInput,
  ICriarSolicitacaoContatoUseCase,
  ISolicitacaoContatoRepository,
  SolicitacaoContato,
} from '@apa/core'
import { SOLICITACAO_CONTATO_REPOSITORY } from '../../comunicacao.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

@Injectable()
export class CriarSolicitacaoContatoUseCase implements ICriarSolicitacaoContatoUseCase {
  constructor(
    @Inject(SOLICITACAO_CONTATO_REPOSITORY) private readonly repo: ISolicitacaoContatoRepository,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async execute(input: CriarSolicitacaoContatoInput): Promise<SolicitacaoContato> {
    const s = new SolicitacaoContato({
      id: randomUUID(),
      tipo: input.tipo,
      status: StatusSolicitacaoContato.PENDENTE,
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      telefone: input.telefone?.trim() || undefined,
      mensagem: input.mensagem.trim(),
      localizacao: input.localizacao?.trim() || undefined,
      municipio: input.municipio?.trim() || undefined,
      criadoEm: new Date(),
    })
    const resultado = await this.repo.save(s)

    void this.notificacaoService.enviarParaAdmins(
      TipoNotificacao.NOVA_SOLICITACAO_CONTATO,
      'Nova solicitação de contato',
      `${input.nome} enviou uma solicitação de ${input.tipo.toLowerCase()}.`,
      { solicitacaoId: resultado.id },
    )

    return resultado
  }
}
