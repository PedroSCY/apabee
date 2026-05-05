import { Module } from '@nestjs/common'
import { PrismaModule } from '../../shared/database/prisma.module'
import { TiposMateriaPrimaController } from './adapters/in/http/TiposMateriaPrimaController'
import { ColheitasController } from './adapters/in/http/ColheitasController'
import { LotesController } from './adapters/in/http/LotesController'
import {
  PrismaColheitaRepository,
  PrismaEstoqueMateriaPrimaRepository,
  PrismaLoteProducaoRepository,
  PrismaParticipacaoLoteRepository,
  PrismaTipoMateriaPrimaRepository,
} from './adapters/out/persistence'
import {
  AtualizarParticipacaoUseCase,
  BuscarLoteUseCase,
  BuscarTipoMateriaPrimaUseCase,
  ConsultarEstoqueUseCase,
  CriarColheitaUseCase,
  CriarLoteUseCase,
  CriarTipoMateriaPrimaUseCase,
  EncerrarLoteUseCase,
  ListarColheitasPorAssociadoUseCase,
  ListarColheitasPorLoteUseCase,
  ListarLotesUseCase,
  ListarParticipacoesPorLoteUseCase,
  ListarTiposMateriaPrimaUseCase,
  RegistrarParticipacaoUseCase,
} from './application/use-cases'
import {
  ATUALIZAR_PARTICIPACAO_USE_CASE,
  BUSCAR_LOTE_USE_CASE,
  BUSCAR_TIPO_MATERIA_PRIMA_USE_CASE,
  COLHEITA_REPOSITORY,
  CONSULTAR_ESTOQUE_USE_CASE,
  CRIAR_COLHEITA_USE_CASE,
  CRIAR_LOTE_USE_CASE,
  CRIAR_TIPO_MATERIA_PRIMA_USE_CASE,
  ENCERRAR_LOTE_USE_CASE,
  ESTOQUE_MATERIA_PRIMA_REPOSITORY,
  LISTAR_COLHEITAS_ASSOCIADO_USE_CASE,
  LISTAR_COLHEITAS_LOTE_USE_CASE,
  LISTAR_LOTES_USE_CASE,
  LISTAR_PARTICIPACOES_LOTE_USE_CASE,
  LISTAR_TIPOS_MATERIA_PRIMA_USE_CASE,
  LOTE_PRODUCAO_REPOSITORY,
  PARTICIPACAO_LOTE_REPOSITORY,
  REGISTRAR_PARTICIPACAO_USE_CASE,
  TIPO_MATERIA_PRIMA_REPOSITORY,
} from './producao.tokens'

@Module({
  imports: [PrismaModule],
  controllers: [TiposMateriaPrimaController, ColheitasController, LotesController],
  providers: [
    { provide: TIPO_MATERIA_PRIMA_REPOSITORY, useClass: PrismaTipoMateriaPrimaRepository },
    { provide: COLHEITA_REPOSITORY, useClass: PrismaColheitaRepository },
    { provide: LOTE_PRODUCAO_REPOSITORY, useClass: PrismaLoteProducaoRepository },
    { provide: PARTICIPACAO_LOTE_REPOSITORY, useClass: PrismaParticipacaoLoteRepository },
    { provide: ESTOQUE_MATERIA_PRIMA_REPOSITORY, useClass: PrismaEstoqueMateriaPrimaRepository },
    { provide: CRIAR_TIPO_MATERIA_PRIMA_USE_CASE, useClass: CriarTipoMateriaPrimaUseCase },
    { provide: LISTAR_TIPOS_MATERIA_PRIMA_USE_CASE, useClass: ListarTiposMateriaPrimaUseCase },
    { provide: BUSCAR_TIPO_MATERIA_PRIMA_USE_CASE, useClass: BuscarTipoMateriaPrimaUseCase },
    { provide: CRIAR_COLHEITA_USE_CASE, useClass: CriarColheitaUseCase },
    { provide: LISTAR_COLHEITAS_ASSOCIADO_USE_CASE, useClass: ListarColheitasPorAssociadoUseCase },
    { provide: LISTAR_COLHEITAS_LOTE_USE_CASE, useClass: ListarColheitasPorLoteUseCase },
    { provide: CRIAR_LOTE_USE_CASE, useClass: CriarLoteUseCase },
    { provide: LISTAR_LOTES_USE_CASE, useClass: ListarLotesUseCase },
    { provide: BUSCAR_LOTE_USE_CASE, useClass: BuscarLoteUseCase },
    { provide: ENCERRAR_LOTE_USE_CASE, useClass: EncerrarLoteUseCase },
    { provide: REGISTRAR_PARTICIPACAO_USE_CASE, useClass: RegistrarParticipacaoUseCase },
    { provide: LISTAR_PARTICIPACOES_LOTE_USE_CASE, useClass: ListarParticipacoesPorLoteUseCase },
    { provide: ATUALIZAR_PARTICIPACAO_USE_CASE, useClass: AtualizarParticipacaoUseCase },
    { provide: CONSULTAR_ESTOQUE_USE_CASE, useClass: ConsultarEstoqueUseCase },
  ],
  exports: [LOTE_PRODUCAO_REPOSITORY, ESTOQUE_MATERIA_PRIMA_REPOSITORY],
})
export class ProducaoModule {}
