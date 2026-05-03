import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { EquipamentosController } from './adapters/in/http/EquipamentosController'
import { PrismaEquipamentoRepository } from './adapters/out/persistence'
import {
  AtualizarEquipamentoUseCase,
  BuscarEquipamentoUseCase,
  ColocarEquipamentoEmManutencaoUseCase,
  CriarEquipamentoUseCase,
  ListarEquipamentosUseCase,
} from './application/use-cases'
import {
  ATUALIZAR_EQUIPAMENTO_USE_CASE,
  BUSCAR_EQUIPAMENTO_USE_CASE,
  COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
  CRIAR_EQUIPAMENTO_USE_CASE,
  EQUIPAMENTO_REPOSITORY,
  LISTAR_EQUIPAMENTOS_USE_CASE,
} from './patrimonio.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [EquipamentosController],
  providers: [
    { provide: EQUIPAMENTO_REPOSITORY, useClass: PrismaEquipamentoRepository },
    { provide: CRIAR_EQUIPAMENTO_USE_CASE, useClass: CriarEquipamentoUseCase },
    { provide: LISTAR_EQUIPAMENTOS_USE_CASE, useClass: ListarEquipamentosUseCase },
    { provide: BUSCAR_EQUIPAMENTO_USE_CASE, useClass: BuscarEquipamentoUseCase },
    { provide: ATUALIZAR_EQUIPAMENTO_USE_CASE, useClass: AtualizarEquipamentoUseCase },
    {
      provide: COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
      useClass: ColocarEquipamentoEmManutencaoUseCase,
    },
  ],
})
export class PatrimonioModule {}
