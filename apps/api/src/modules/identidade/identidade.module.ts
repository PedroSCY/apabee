import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { IdentidadeController } from './adapters/in/http/IdentidadeController'
import { SupabaseProvedorAuth } from './adapters/out/external'
import {
  PrismaAssociadoRepository,
  PrismaUsuarioRepository,
} from './adapters/out/persistence'
import {
  AtivarUsuarioUseCase,
  CriarAssociadoUseCase,
  CriarUsuarioUseCase,
  DesativarUsuarioUseCase,
  ListarAssociadosUseCase,
} from './application/use-cases'
import {
  ASSOCIADO_REPOSITORY,
  ATIVAR_USUARIO_USE_CASE,
  CRIAR_ASSOCIADO_USE_CASE,
  CRIAR_USUARIO_USE_CASE,
  DESATIVAR_USUARIO_USE_CASE,
  LISTAR_ASSOCIADOS_USE_CASE,
  PROVEDOR_AUTH,
  USUARIO_REPOSITORY,
} from './identidade.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [IdentidadeController],
  providers: [
    { provide: PROVEDOR_AUTH, useClass: SupabaseProvedorAuth },
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
    { provide: ASSOCIADO_REPOSITORY, useClass: PrismaAssociadoRepository },
    { provide: CRIAR_USUARIO_USE_CASE, useClass: CriarUsuarioUseCase },
    { provide: CRIAR_ASSOCIADO_USE_CASE, useClass: CriarAssociadoUseCase },
    { provide: LISTAR_ASSOCIADOS_USE_CASE, useClass: ListarAssociadosUseCase },
    { provide: ATIVAR_USUARIO_USE_CASE, useClass: AtivarUsuarioUseCase },
    { provide: DESATIVAR_USUARIO_USE_CASE, useClass: DesativarUsuarioUseCase },
  ],
})
export class IdentidadeModule {}
