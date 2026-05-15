import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { AvisosController } from './adapters/in/http/AvisosController'
import { SolicitacoesContatoController } from './adapters/in/http/SolicitacoesContatoController'
import { PrismaAvisoRepository } from './adapters/out/persistence/PrismaAvisoRepository'
import { PrismaSolicitacaoContatoRepository } from './adapters/out/persistence/PrismaSolicitacaoContatoRepository'
import {
  CriarAvisoUseCase,
  DespublicarAvisoUseCase,
  ExcluirAvisoUseCase,
  ListarAvisosUseCase,
  PublicarAvisoUseCase,
  CriarSolicitacaoContatoUseCase,
  ListarSolicitacoesContatoUseCase,
  AtualizarStatusSolicitacaoContatoUseCase,
  ExcluirSolicitacaoContatoUseCase,
} from './application/use-cases'
import {
  AVISO_REPOSITORY,
  CRIAR_AVISO_USE_CASE,
  DESPUBLICAR_AVISO_USE_CASE,
  EXCLUIR_AVISO_USE_CASE,
  LISTAR_AVISOS_USE_CASE,
  PUBLICAR_AVISO_USE_CASE,
  SOLICITACAO_CONTATO_REPOSITORY,
  CRIAR_SOLICITACAO_CONTATO_USE_CASE,
  LISTAR_SOLICITACOES_CONTATO_USE_CASE,
  ATUALIZAR_STATUS_SOLICITACAO_CONTATO_USE_CASE,
  EXCLUIR_SOLICITACAO_CONTATO_USE_CASE,
} from './comunicacao.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [AvisosController, SolicitacoesContatoController],
  providers: [
    { provide: AVISO_REPOSITORY, useClass: PrismaAvisoRepository },
    { provide: CRIAR_AVISO_USE_CASE, useClass: CriarAvisoUseCase },
    { provide: LISTAR_AVISOS_USE_CASE, useClass: ListarAvisosUseCase },
    { provide: PUBLICAR_AVISO_USE_CASE, useClass: PublicarAvisoUseCase },
    { provide: DESPUBLICAR_AVISO_USE_CASE, useClass: DespublicarAvisoUseCase },
    { provide: EXCLUIR_AVISO_USE_CASE, useClass: ExcluirAvisoUseCase },
    { provide: SOLICITACAO_CONTATO_REPOSITORY, useClass: PrismaSolicitacaoContatoRepository },
    { provide: CRIAR_SOLICITACAO_CONTATO_USE_CASE, useClass: CriarSolicitacaoContatoUseCase },
    { provide: LISTAR_SOLICITACOES_CONTATO_USE_CASE, useClass: ListarSolicitacoesContatoUseCase },
    { provide: ATUALIZAR_STATUS_SOLICITACAO_CONTATO_USE_CASE, useClass: AtualizarStatusSolicitacaoContatoUseCase },
    { provide: EXCLUIR_SOLICITACAO_CONTATO_USE_CASE, useClass: ExcluirSolicitacaoContatoUseCase },
  ],
})
/** Módulo NestJS de comunicação — avisos e solicitações de contato. */
export class ComunicacaoModule {}
