import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  Colheita,
  ICriarColheitaUseCase,
  IListarColheitasUseCase,
  IListarColheitasPorAssociadoUseCase,
  IListarColheitasPorCampanhaUseCase,
} from '@apa/core'
import { CriarColheitaDto } from './dto'
import {
  CRIAR_COLHEITA_USE_CASE,
  LISTAR_COLHEITAS_USE_CASE,
  LISTAR_COLHEITAS_ASSOCIADO_USE_CASE,
  LISTAR_COLHEITAS_CAMPANHA_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Colheitas')
@ApiBearerAuth('JWT')
@Controller('producao/colheitas')
export class ColheitasController {
  constructor(
    @Inject(CRIAR_COLHEITA_USE_CASE)
    private readonly criarColheita: ICriarColheitaUseCase,
    @Inject(LISTAR_COLHEITAS_USE_CASE)
    private readonly listarColheitas: IListarColheitasUseCase,
    @Inject(LISTAR_COLHEITAS_ASSOCIADO_USE_CASE)
    private readonly listarPorAssociado: IListarColheitasPorAssociadoUseCase,
    @Inject(LISTAR_COLHEITAS_CAMPANHA_USE_CASE)
    private readonly listarPorCampanha: IListarColheitasPorCampanhaUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todas as colheitas (admin)' })
  @ApiResponse({ status: 200 })
  @Get()
  async listar() {
    const lista = await this.listarColheitas.execute()
    return lista.map((c) => this.toResponse(c))
  }

  @ApiOperation({ summary: 'Registrar colheita' })
  @ApiResponse({ status: 201, description: 'Colheita registrada.' })
  @Post()
  async criar(@Body() dto: CriarColheitaDto) {
    return this.toResponse(
      await this.criarColheita.execute({ ...dto, dataColheita: new Date(dto.dataColheita) }),
    )
  }

  @ApiOperation({ summary: 'Listar colheitas por associado' })
  @ApiParam({ name: 'associadoId', type: String })
  @ApiResponse({ status: 200 })
  @Get('associado/:associadoId')
  async listarAssociado(@Param('associadoId') associadoId: string) {
    const lista = await this.listarPorAssociado.execute(associadoId)
    return lista.map((c) => this.toResponse(c))
  }

  @ApiOperation({ summary: 'Listar colheitas por campanha' })
  @ApiParam({ name: 'campanhaId', type: String })
  @ApiResponse({ status: 200 })
  @Get('campanha/:campanhaId')
  async listarCampanha(@Param('campanhaId') campanhaId: string) {
    const lista = await this.listarPorCampanha.execute(campanhaId)
    return lista.map((c) => this.toResponse(c))
  }

  private toResponse(c: Colheita) {
    return {
      id: c.id,
      associadoId: c.associadoId,
      tipoMateriaPrimaId: c.tipoMateriaPrimaId,
      equipamentoId: c.equipamentoId,
      campanhaId: c.campanhaId,
      safraId: c.safraId,
      volume: c.volume,
      unidade: c.unidade,
      dataColheita: c.dataColheita,
      observacao: c.observacao,
      criadoEm: c.criadoEm,
    }
  }
}
