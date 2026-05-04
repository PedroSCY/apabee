import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  Colheita,
  ICriarColheitaUseCase,
  IListarColheitasPorAssociadoUseCase,
  IListarColheitasPorLoteUseCase,
} from '@apa/core'
import { CriarColheitaDto } from './dto'
import {
  CRIAR_COLHEITA_USE_CASE,
  LISTAR_COLHEITAS_ASSOCIADO_USE_CASE,
  LISTAR_COLHEITAS_LOTE_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Colheitas')
@ApiBearerAuth('JWT')
@Controller('producao/colheitas')
export class ColheitasController {
  constructor(
    @Inject(CRIAR_COLHEITA_USE_CASE)
    private readonly criarColheita: ICriarColheitaUseCase,
    @Inject(LISTAR_COLHEITAS_ASSOCIADO_USE_CASE)
    private readonly listarPorAssociado: IListarColheitasPorAssociadoUseCase,
    @Inject(LISTAR_COLHEITAS_LOTE_USE_CASE)
    private readonly listarPorLote: IListarColheitasPorLoteUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar colheita' })
  @ApiResponse({ status: 201, description: 'Colheita registrada.' })
  @Post()
  async criar(@Body() dto: CriarColheitaDto): Promise<Colheita> {
    return this.criarColheita.execute({
      ...dto,
      dataColheita: new Date(dto.dataColheita),
    })
  }

  @ApiOperation({ summary: 'Listar colheitas por associado' })
  @ApiParam({ name: 'associadoId', type: String })
  @ApiResponse({ status: 200 })
  @Get('associado/:associadoId')
  async listarAssociado(@Param('associadoId') associadoId: string): Promise<Colheita[]> {
    return this.listarPorAssociado.execute(associadoId)
  }

  @ApiOperation({ summary: 'Listar colheitas por lote' })
  @ApiParam({ name: 'loteId', type: String })
  @ApiResponse({ status: 200 })
  @Get('lote/:loteId')
  async listarLote(@Param('loteId') loteId: string): Promise<Colheita[]> {
    return this.listarPorLote.execute(loteId)
  }
}
