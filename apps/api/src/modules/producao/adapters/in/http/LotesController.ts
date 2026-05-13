import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Inject, Param, Patch, Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IAtualizarParticipacaoUseCase,
  IBuscarLoteUseCase,
  ICalcularRateioUseCase,
  ICriarLoteUseCase,
  IEncerrarLoteUseCase,
  IListarLotesUseCase,
  IListarParticipacoesPorLoteUseCase,
  IRegistrarParticipacaoUseCase,
  LoteProducao,
  ParticipacaoLote,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtualizarParticipacaoDto, CriarLoteDto, RegistrarParticipacaoDto } from './dto'
import {
  ATUALIZAR_PARTICIPACAO_USE_CASE,
  BUSCAR_LOTE_USE_CASE,
  CALCULAR_RATEIO_USE_CASE,
  CRIAR_LOTE_USE_CASE,
  ENCERRAR_LOTE_USE_CASE,
  LISTAR_LOTES_USE_CASE,
  LISTAR_PARTICIPACOES_LOTE_USE_CASE,
  REGISTRAR_PARTICIPACAO_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Lotes')
@ApiBearerAuth('JWT')
@Controller('producao/lotes')
export class LotesController {
  constructor(
    @Inject(CRIAR_LOTE_USE_CASE) private readonly criar: ICriarLoteUseCase,
    @Inject(LISTAR_LOTES_USE_CASE) private readonly listar: IListarLotesUseCase,
    @Inject(BUSCAR_LOTE_USE_CASE) private readonly buscar: IBuscarLoteUseCase,
    @Inject(ENCERRAR_LOTE_USE_CASE) private readonly encerrar: IEncerrarLoteUseCase,
    @Inject(REGISTRAR_PARTICIPACAO_USE_CASE) private readonly registrarParticipacao: IRegistrarParticipacaoUseCase,
    @Inject(LISTAR_PARTICIPACOES_LOTE_USE_CASE) private readonly listarParticipacoes: IListarParticipacoesPorLoteUseCase,
    @Inject(ATUALIZAR_PARTICIPACAO_USE_CASE) private readonly atualizarParticipacao: IAtualizarParticipacaoUseCase,
    @Inject(CALCULAR_RATEIO_USE_CASE) private readonly calcularRateio: ICalcularRateioUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar lote de produção' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criarLote(@Body() dto: CriarLoteDto) {
    return this.toLoteResponse(
      await this.criar.execute({
        ...dto,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      }),
    )
  }

  @ApiOperation({ summary: 'Listar lotes' })
  @Get()
  async listarLotes() {
    const lista = await this.listar.execute()
    return lista.map((l) => this.toLoteResponse(l))
  }

  @ApiOperation({ summary: 'Buscar lote por ID' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async buscarLote(@Param('id') id: string) {
    return this.toLoteResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Encerrar lote' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/encerrar')
  async encerrarLote(@Param('id') id: string) {
    return this.toLoteResponse(await this.encerrar.execute(id))
  }

  @ApiOperation({ summary: 'Listar participações do lote' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/participacoes')
  async listarParticipacoesDo(@Param('id') id: string) {
    const lista = await this.listarParticipacoes.execute(id)
    return lista.map((p) => this.toParticipacaoResponse(p))
  }

  @ApiOperation({ summary: 'Registrar participação de associado no lote' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/participacoes')
  async registrar(@Param('id') loteId: string, @Body() dto: RegistrarParticipacaoDto) {
    return this.toParticipacaoResponse(
      await this.registrarParticipacao.execute({ ...dto, loteProducaoId: loteId }),
    )
  }

  @ApiOperation({ summary: 'Atualizar participação (volume/valorInvestido/percentual manual)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'associadoId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Patch(':id/participacoes/:associadoId')
  async atualizar(
    @Param('id') loteId: string,
    @Param('associadoId') associadoId: string,
    @Body() dto: AtualizarParticipacaoDto,
  ) {
    return this.toParticipacaoResponse(
      await this.atualizarParticipacao.execute(loteId, associadoId, dto),
    )
  }

  @ApiOperation({ summary: 'Recalcular rateio automático do lote (respeita percentuais manuais)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/rateio')
  async recalcularRateio(@Param('id') loteId: string) {
    const lista = await this.calcularRateio.execute(loteId)
    return lista.map((p) => this.toParticipacaoResponse(p))
  }

  private toLoteResponse(l: LoteProducao) {
    return {
      id: l.id,
      tipo: l.tipo,
      periodo: l.periodo,
      dataInicio: l.dataInicio,
      dataFim: l.dataFim,
      status: l.status,
      custoTotal: l.custoTotal,
    }
  }

  private toParticipacaoResponse(p: ParticipacaoLote) {
    return {
      id: p.id,
      loteProducaoId: p.loteProducaoId,
      associadoId: p.associadoId,
      percentual: p.percentual,
      percentualManual: p.percentualManual,
      volume: p.volume,
      valorInvestido: p.valorInvestido,
    }
  }
}
