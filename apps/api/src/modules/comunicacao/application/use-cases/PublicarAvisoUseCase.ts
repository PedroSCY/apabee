import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Aviso, IAvisoRepository, IPublicarAvisoUseCase } from '@apa/core'
import { DestinatariosAviso, TipoNotificacao } from '@apa/shared'
import { AVISO_REPOSITORY } from '../../comunicacao.tokens'
import { NotificacaoService } from '../../../notificacao/NotificacaoService'

@Injectable()
export class PublicarAvisoUseCase implements IPublicarAvisoUseCase {
  constructor(
    @Inject(AVISO_REPOSITORY) private readonly avisoRepo: IAvisoRepository,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async execute(id: string): Promise<Aviso> {
    const aviso = await this.avisoRepo.findById(id)
    if (!aviso) throw new NotFoundException(`Aviso ${id} não encontrado.`)

    const deveEnviarEmail = aviso.enviarEmail && !aviso.emailEnviado
    const publicado = deveEnviarEmail ? aviso.publicar().marcarEmailEnviado() : aviso.publicar()
    const resultado = await this.avisoRepo.update(publicado)

    const resumo = resultado.conteudo.slice(0, 120) + (resultado.conteudo.length > 120 ? '…' : '')
    const extras = { avisoId: resultado.id }

    if (resultado.destinatarios === DestinatariosAviso.SELECIONADOS) {
      void this.notificacaoService.enviarParaAssociadosSelecionados(
        resultado.selectedMemberIds,
        TipoNotificacao.NOVO_AVISO,
        resultado.titulo,
        resumo,
        extras,
      )
    } else {
      void this.notificacaoService.enviarParaTodosAssociados(
        TipoNotificacao.NOVO_AVISO,
        resultado.titulo,
        resumo,
        extras,
      )
    }

    if (deveEnviarEmail) {
      void this.notificacaoService.enviarEmailAvisoParaAssociados(
        resultado.titulo,
        resultado.conteudo,
        resultado.destinatarios,
        resultado.selectedMemberIds,
      )
    }

    return resultado
  }
}
