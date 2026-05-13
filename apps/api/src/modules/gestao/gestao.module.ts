import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { AtasController } from './adapters/in/http/AtasController'
import { DocumentosController } from './adapters/in/http/DocumentosController'
import { ConfiguracoesController } from './adapters/in/http/ConfiguracoesController'
import { PrismaAtaRepository } from './adapters/out/persistence/PrismaAtaRepository'
import { PrismaParticipanteAtaRepository } from './adapters/out/persistence/PrismaParticipanteAtaRepository'
import { PrismaDocumentoRepository } from './adapters/out/persistence/PrismaDocumentoRepository'
import { PrismaConfiguracaoAssociacaoRepository } from './adapters/out/persistence/PrismaConfiguracaoAssociacaoRepository'
import { SupabaseStorageAdapter } from './adapters/out/external/SupabaseStorageAdapter'
import { CriarAtaUseCase } from './application/use-cases/CriarAtaUseCase'
import { ListarAtasUseCase } from './application/use-cases/ListarAtasUseCase'
import { PublicarAtaUseCase } from './application/use-cases/PublicarAtaUseCase'
import { DespublicarAtaUseCase } from './application/use-cases/DespublicarAtaUseCase'
import { AdicionarParticipanteUseCase } from './application/use-cases/AdicionarParticipanteUseCase'
import { RemoverParticipanteUseCase } from './application/use-cases/RemoverParticipanteUseCase'
import { ListarParticipantesAtaUseCase } from './application/use-cases/ListarParticipantesAtaUseCase'
import { CriarDocumentoUseCase } from './application/use-cases/CriarDocumentoUseCase'
import { ListarDocumentosUseCase } from './application/use-cases/ListarDocumentosUseCase'
import { PublicarDocumentoUseCase } from './application/use-cases/PublicarDocumentoUseCase'
import { DespublicarDocumentoUseCase } from './application/use-cases/DespublicarDocumentoUseCase'
import { ExcluirDocumentoUseCase } from './application/use-cases/ExcluirDocumentoUseCase'
import { ObterConfiguracaoUseCase } from './application/use-cases/ObterConfiguracaoUseCase'
import { AtualizarConfiguracaoUseCase } from './application/use-cases/AtualizarConfiguracaoUseCase'
import {
  ATA_REPOSITORY,
  PARTICIPANTE_ATA_REPOSITORY,
  DOCUMENTO_REPOSITORY,
  STORAGE_PORT,
  CONFIGURACAO_REPOSITORY,
  CRIAR_ATA_USE_CASE,
  LISTAR_ATAS_USE_CASE,
  PUBLICAR_ATA_USE_CASE,
  DESPUBLICAR_ATA_USE_CASE,
  ADICIONAR_PARTICIPANTE_USE_CASE,
  REMOVER_PARTICIPANTE_USE_CASE,
  LISTAR_PARTICIPANTES_ATA_USE_CASE,
  CRIAR_DOCUMENTO_USE_CASE,
  LISTAR_DOCUMENTOS_USE_CASE,
  PUBLICAR_DOCUMENTO_USE_CASE,
  DESPUBLICAR_DOCUMENTO_USE_CASE,
  EXCLUIR_DOCUMENTO_USE_CASE,
  OBTER_CONFIGURACAO_USE_CASE,
  ATUALIZAR_CONFIGURACAO_USE_CASE,
} from './gestao.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [AtasController, DocumentosController, ConfiguracoesController],
  providers: [
    // Repositories
    { provide: ATA_REPOSITORY, useClass: PrismaAtaRepository },
    { provide: PARTICIPANTE_ATA_REPOSITORY, useClass: PrismaParticipanteAtaRepository },
    { provide: DOCUMENTO_REPOSITORY, useClass: PrismaDocumentoRepository },
    { provide: STORAGE_PORT, useClass: SupabaseStorageAdapter },
    { provide: CONFIGURACAO_REPOSITORY, useClass: PrismaConfiguracaoAssociacaoRepository },

    // Ata use cases
    { provide: CRIAR_ATA_USE_CASE, useClass: CriarAtaUseCase },
    { provide: LISTAR_ATAS_USE_CASE, useClass: ListarAtasUseCase },
    { provide: PUBLICAR_ATA_USE_CASE, useClass: PublicarAtaUseCase },
    { provide: DESPUBLICAR_ATA_USE_CASE, useClass: DespublicarAtaUseCase },
    { provide: ADICIONAR_PARTICIPANTE_USE_CASE, useClass: AdicionarParticipanteUseCase },
    { provide: REMOVER_PARTICIPANTE_USE_CASE, useClass: RemoverParticipanteUseCase },
    { provide: LISTAR_PARTICIPANTES_ATA_USE_CASE, useClass: ListarParticipantesAtaUseCase },

    // Documento use cases
    { provide: CRIAR_DOCUMENTO_USE_CASE, useClass: CriarDocumentoUseCase },
    { provide: LISTAR_DOCUMENTOS_USE_CASE, useClass: ListarDocumentosUseCase },
    { provide: PUBLICAR_DOCUMENTO_USE_CASE, useClass: PublicarDocumentoUseCase },
    { provide: DESPUBLICAR_DOCUMENTO_USE_CASE, useClass: DespublicarDocumentoUseCase },
    { provide: EXCLUIR_DOCUMENTO_USE_CASE, useClass: ExcluirDocumentoUseCase },

    // Configuração use cases
    { provide: OBTER_CONFIGURACAO_USE_CASE, useClass: ObterConfiguracaoUseCase },
    { provide: ATUALIZAR_CONFIGURACAO_USE_CASE, useClass: AtualizarConfiguracaoUseCase },
  ],
})
/** Módulo NestJS de gestão — atas, documentos e configurações da associação. */
export class GestaoModule {}
