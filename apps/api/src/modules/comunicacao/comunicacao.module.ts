import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { AvisosController } from './adapters/in/http/AvisosController'
import { PrismaAvisoRepository } from './adapters/out/persistence/PrismaAvisoRepository'
import {
  CriarAvisoUseCase,
  DespublicarAvisoUseCase,
  ExcluirAvisoUseCase,
  ListarAvisosUseCase,
  PublicarAvisoUseCase,
} from './application/use-cases'
import {
  AVISO_REPOSITORY,
  CRIAR_AVISO_USE_CASE,
  DESPUBLICAR_AVISO_USE_CASE,
  EXCLUIR_AVISO_USE_CASE,
  LISTAR_AVISOS_USE_CASE,
  PUBLICAR_AVISO_USE_CASE,
} from './comunicacao.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [AvisosController],
  providers: [
    { provide: AVISO_REPOSITORY, useClass: PrismaAvisoRepository },
    { provide: CRIAR_AVISO_USE_CASE, useClass: CriarAvisoUseCase },
    { provide: LISTAR_AVISOS_USE_CASE, useClass: ListarAvisosUseCase },
    { provide: PUBLICAR_AVISO_USE_CASE, useClass: PublicarAvisoUseCase },
    { provide: DESPUBLICAR_AVISO_USE_CASE, useClass: DespublicarAvisoUseCase },
    { provide: EXCLUIR_AVISO_USE_CASE, useClass: ExcluirAvisoUseCase },
  ],
})
export class ComunicacaoModule {}
