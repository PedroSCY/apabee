import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { SharedModule } from '../../shared/shared.module'
import { IdentidadeController } from './adapters/in/http/IdentidadeController'
import { SupabaseProvedorAuth } from './adapters/out/external'
import {
  PrismaAssociadoRepository,
  PrismaUsuarioRepository,
} from './adapters/out/persistence'
import {
  AprovarAssociadoPendenteUseCase,
  MarcarIsentoAssociadoUseCase,
  RemoverIsencaoAssociadoUseCase,
  AtivarUsuarioUseCase,
  AtualizarAssociadoUseCase,
  AtualizarSenhaUseCase,
  AtualizarUsuarioUseCase,
  BuscarAssociadoUseCase,
  BuscarAssociadoPorUsuarioUseCase,
  CriarAssociadoUseCase,
  CriarAssociadoPendenteUseCase,
  CriarUsuarioUseCase,
  DesativarUsuarioUseCase,
  ExcluirAssociadoUseCase,
  ListarAssociadosUseCase,
} from './application/use-cases'
import {
  APROVAR_ASSOCIADO_PENDENTE_USE_CASE,
  MARCAR_ISENTO_ASSOCIADO_USE_CASE,
  REMOVER_ISENCAO_ASSOCIADO_USE_CASE,
  ASSOCIADO_REPOSITORY,
  ATIVAR_USUARIO_USE_CASE,
  ATUALIZAR_ASSOCIADO_USE_CASE,
  ATUALIZAR_SENHA_USE_CASE,
  ATUALIZAR_USUARIO_USE_CASE,
  BUSCAR_ASSOCIADO_USE_CASE,
  BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE,
  CRIAR_ASSOCIADO_USE_CASE,
  CRIAR_ASSOCIADO_PENDENTE_USE_CASE,
  CRIAR_USUARIO_USE_CASE,
  DESATIVAR_USUARIO_USE_CASE,
  EXCLUIR_ASSOCIADO_USE_CASE,
  LISTAR_ASSOCIADOS_USE_CASE,
  PROVEDOR_AUTH,
  USUARIO_REPOSITORY,
} from './identidade.tokens'

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [IdentidadeController],
  providers: [
    { provide: PROVEDOR_AUTH, useClass: SupabaseProvedorAuth },
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
    { provide: ASSOCIADO_REPOSITORY, useClass: PrismaAssociadoRepository },
    { provide: CRIAR_USUARIO_USE_CASE, useClass: CriarUsuarioUseCase },
    { provide: CRIAR_ASSOCIADO_USE_CASE, useClass: CriarAssociadoUseCase },
    { provide: LISTAR_ASSOCIADOS_USE_CASE, useClass: ListarAssociadosUseCase },
    { provide: BUSCAR_ASSOCIADO_USE_CASE, useClass: BuscarAssociadoUseCase },
    { provide: BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE, useClass: BuscarAssociadoPorUsuarioUseCase },
    { provide: ATIVAR_USUARIO_USE_CASE, useClass: AtivarUsuarioUseCase },
    { provide: DESATIVAR_USUARIO_USE_CASE, useClass: DesativarUsuarioUseCase },
    { provide: ATUALIZAR_ASSOCIADO_USE_CASE, useClass: AtualizarAssociadoUseCase },
    { provide: ATUALIZAR_USUARIO_USE_CASE, useClass: AtualizarUsuarioUseCase },
    { provide: ATUALIZAR_SENHA_USE_CASE, useClass: AtualizarSenhaUseCase },
    { provide: EXCLUIR_ASSOCIADO_USE_CASE, useClass: ExcluirAssociadoUseCase },
    { provide: CRIAR_ASSOCIADO_PENDENTE_USE_CASE, useClass: CriarAssociadoPendenteUseCase },
    { provide: APROVAR_ASSOCIADO_PENDENTE_USE_CASE, useClass: AprovarAssociadoPendenteUseCase },
    { provide: MARCAR_ISENTO_ASSOCIADO_USE_CASE, useClass: MarcarIsentoAssociadoUseCase },
    { provide: REMOVER_ISENCAO_ASSOCIADO_USE_CASE, useClass: RemoverIsencaoAssociadoUseCase },
  ],
  exports: [BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE, ASSOCIADO_REPOSITORY, BUSCAR_ASSOCIADO_USE_CASE, USUARIO_REPOSITORY, PROVEDOR_AUTH],
})
/** Módulo NestJS de identidade: usuários, associados e autenticação */
export class IdentidadeModule {}
