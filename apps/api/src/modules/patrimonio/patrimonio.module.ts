import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { EquipamentosController } from './adapters/in/http/EquipamentosController'
import { InsumosController } from './adapters/in/http/InsumosController'
import { AtribuicoesController } from './adapters/in/http/AtribuicoesController'
import {
  PrismaAtribuicaoPatrimonioRepository,
  PrismaEquipamentoRepository,
  PrismaInsumoRepository,
} from './adapters/out/persistence'
import {
  AtribuirPatrimonioUseCase,
  AtualizarEquipamentoUseCase,
  AtualizarInsumoUseCase,
  BuscarEquipamentoUseCase,
  BuscarInsumoUseCase,
  ColocarEquipamentoEmManutencaoUseCase,
  ColocarInsumoEmManutencaoUseCase,
  CriarEquipamentoUseCase,
  CriarInsumoUseCase,
  DevolverPatrimonioUseCase,
  ListarAtribuicoesPorAssociadoUseCase,
  ListarEquipamentosUseCase,
  ListarInsumosUseCase,
} from './application/use-cases'
import {
  ATRIBUICAO_PATRIMONIO_REPOSITORY,
  ATRIBUIR_PATRIMONIO_USE_CASE,
  ATUALIZAR_EQUIPAMENTO_USE_CASE,
  ATUALIZAR_INSUMO_USE_CASE,
  BUSCAR_EQUIPAMENTO_USE_CASE,
  BUSCAR_INSUMO_USE_CASE,
  COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
  COLOCAR_INSUMO_MANUTENCAO_USE_CASE,
  CRIAR_EQUIPAMENTO_USE_CASE,
  CRIAR_INSUMO_USE_CASE,
  DEVOLVER_PATRIMONIO_USE_CASE,
  EQUIPAMENTO_REPOSITORY,
  INSUMO_REPOSITORY,
  LISTAR_ATRIBUICOES_ASSOCIADO_USE_CASE,
  LISTAR_EQUIPAMENTOS_USE_CASE,
  LISTAR_INSUMOS_USE_CASE,
} from './patrimonio.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [EquipamentosController, InsumosController, AtribuicoesController],
  providers: [
    { provide: EQUIPAMENTO_REPOSITORY, useClass: PrismaEquipamentoRepository },
    { provide: INSUMO_REPOSITORY, useClass: PrismaInsumoRepository },
    { provide: ATRIBUICAO_PATRIMONIO_REPOSITORY, useClass: PrismaAtribuicaoPatrimonioRepository },
    { provide: CRIAR_EQUIPAMENTO_USE_CASE, useClass: CriarEquipamentoUseCase },
    { provide: LISTAR_EQUIPAMENTOS_USE_CASE, useClass: ListarEquipamentosUseCase },
    { provide: BUSCAR_EQUIPAMENTO_USE_CASE, useClass: BuscarEquipamentoUseCase },
    { provide: ATUALIZAR_EQUIPAMENTO_USE_CASE, useClass: AtualizarEquipamentoUseCase },
    { provide: COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE, useClass: ColocarEquipamentoEmManutencaoUseCase },
    { provide: CRIAR_INSUMO_USE_CASE, useClass: CriarInsumoUseCase },
    { provide: LISTAR_INSUMOS_USE_CASE, useClass: ListarInsumosUseCase },
    { provide: BUSCAR_INSUMO_USE_CASE, useClass: BuscarInsumoUseCase },
    { provide: ATUALIZAR_INSUMO_USE_CASE, useClass: AtualizarInsumoUseCase },
    { provide: COLOCAR_INSUMO_MANUTENCAO_USE_CASE, useClass: ColocarInsumoEmManutencaoUseCase },
    { provide: ATRIBUIR_PATRIMONIO_USE_CASE, useClass: AtribuirPatrimonioUseCase },
    { provide: DEVOLVER_PATRIMONIO_USE_CASE, useClass: DevolverPatrimonioUseCase },
    { provide: LISTAR_ATRIBUICOES_ASSOCIADO_USE_CASE, useClass: ListarAtribuicoesPorAssociadoUseCase },
  ],
})
export class PatrimonioModule {}
