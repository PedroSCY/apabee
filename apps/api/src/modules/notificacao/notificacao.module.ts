import { Global, Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { PrismaNotificacaoRepository } from './adapters/out/persistence/PrismaNotificacaoRepository'
import { ListarNotificacoesUseCase } from './application/use-cases/ListarNotificacoesUseCase'
import { ContarNaoLidasUseCase } from './application/use-cases/ContarNaoLidasUseCase'
import { MarcarLidaUseCase } from './application/use-cases/MarcarLidaUseCase'
import { MarcarTodasLidasUseCase } from './application/use-cases/MarcarTodasLidasUseCase'
import { NotificacaoService } from './NotificacaoService'
import { EmailService } from './adapters/out/external/EmailService'
import { NotificacoesController } from './adapters/in/http/NotificacoesController'
import {
  NOTIFICACAO_REPOSITORY,
  LISTAR_NOTIFICACOES_USE_CASE,
  CONTAR_NAO_LIDAS_USE_CASE,
  MARCAR_LIDA_USE_CASE,
  MARCAR_TODAS_LIDAS_USE_CASE,
} from './notificacao.tokens'

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [NotificacoesController],
  providers: [
    { provide: NOTIFICACAO_REPOSITORY, useClass: PrismaNotificacaoRepository },
    { provide: LISTAR_NOTIFICACOES_USE_CASE, useClass: ListarNotificacoesUseCase },
    { provide: CONTAR_NAO_LIDAS_USE_CASE, useClass: ContarNaoLidasUseCase },
    { provide: MARCAR_LIDA_USE_CASE, useClass: MarcarLidaUseCase },
    { provide: MARCAR_TODAS_LIDAS_USE_CASE, useClass: MarcarTodasLidasUseCase },
    EmailService,
    NotificacaoService,
  ],
  exports: [NotificacaoService],
})
/** Módulo de notificações in-app — cria, persiste e envia via SSE + e-mail transacional (Resend). @Global() para que NotificacaoService seja injetável em qualquer módulo. */
export class NotificacaoModule {}
