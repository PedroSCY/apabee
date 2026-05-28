import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  Colheita,
  ICriarColheitaUseCase,
  IDeletarColheitaUseCase,
  IListarColheitasUseCase,
  IListarColheitasPorAssociadoUseCase,
  IListarColheitasPorCampanhaUseCase,
} from '@apa/core'
import { RoleUsuario } from '@apa/shared'
import { Roles } from '../../../../../shared/guards/roles.decorator'
import { CriarColheitaDto } from './dto'
import { ColheitaResponse } from './dto/response.types'
import {
  CRIAR_COLHEITA_USE_CASE,
  DELETAR_COLHEITA_USE_CASE,
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
    @Inject(DELETAR_COLHEITA_USE_CASE)
    private readonly deletarColheita: IDeletarColheitaUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todas as colheitas (admin)' })
  @ApiResponse({ status: 200 })
  @Roles(RoleUsuario.ADMIN)
  @Get()
  async listar(): Promise<ColheitaResponse[]> {
    const lista = await this.listarColheitas.execute()
    return lista.map((c) => this.toResponse(c))
  }

  @ApiOperation({ summary: 'Registrar colheita (admin)' })
  @ApiResponse({ status: 201, description: 'Colheita registrada.' })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criar(@Body() dto: CriarColheitaDto): Promise<ColheitaResponse> {
    return this.toResponse(
      await this.criarColheita.execute({ ...dto, dataColheita: new Date(dto.dataColheita) }),
    )
  }

  @ApiOperation({ summary: 'Listar colheitas por associado' })
  @ApiParam({ name: 'associadoId', type: String })
  @ApiResponse({ status: 200 })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get('associado/:associadoId')
  async listarAssociado(@Param('associadoId') associadoId: string): Promise<ColheitaResponse[]> {
    const lista = await this.listarPorAssociado.execute(associadoId)
    return lista.map((c) => this.toResponse(c))
  }

  @ApiOperation({ summary: 'Listar colheitas por campanha' })
  @ApiParam({ name: 'campanhaId', type: String })
  @ApiResponse({ status: 200 })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get('campanha/:campanhaId')
  async listarCampanha(@Param('campanhaId') campanhaId: string): Promise<ColheitaResponse[]> {
    const lista = await this.listarPorCampanha.execute(campanhaId)
    return lista.map((c) => this.toResponse(c))
  }

  @ApiOperation({ summary: 'Excluir colheita (somente se estoque não foi consumido)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 409, description: 'Matéria-prima já consumida em produção.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletar(@Param('id') id: string) {
    await this.deletarColheita.execute(id)
  }

  private toResponse(c: Colheita): ColheitaResponse {
    return {
      id: c.id,
      associadoId: c.associadoId,
      tipoMateriaPrimaId: c.tipoMateriaPrimaId,
      equipamentoId: c.equipamentoId,
      campanhaId: c.campanhaId,
      safraId: c.safraId,
      volume: c.volume,
      dataColheita: c.dataColheita,
      observacao: c.observacao,
      criadoEm: c.criadoEm,
    }
  }
}
