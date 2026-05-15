import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IBuscarInsumoUseCase,
  IColocarInsumoEmManutencaoUseCase,
  IExcluirInsumoUseCase,
  ILiberarInsumoManutencaoUseCase,
  IListarInsumosUseCase,
  Insumo,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import {
  BUSCAR_INSUMO_USE_CASE,
  COLOCAR_INSUMO_MANUTENCAO_USE_CASE,
  EXCLUIR_INSUMO_USE_CASE,
  LIBERAR_INSUMO_MANUTENCAO_USE_CASE,
  LISTAR_INSUMOS_USE_CASE,
} from '../../../patrimonio.tokens'

@ApiTags('Patrimônio — Insumos (unidades)')
@ApiBearerAuth('JWT')
@Controller('patrimonio/insumos')
@Roles(RoleUsuario.ADMIN)
export class InsumosController {
  constructor(
    @Inject(LISTAR_INSUMOS_USE_CASE) private readonly listarInsumos: IListarInsumosUseCase,
    @Inject(BUSCAR_INSUMO_USE_CASE) private readonly buscarInsumo: IBuscarInsumoUseCase,
    @Inject(COLOCAR_INSUMO_MANUTENCAO_USE_CASE) private readonly colocarEmManutencao: IColocarInsumoEmManutencaoUseCase,
    @Inject(EXCLUIR_INSUMO_USE_CASE) private readonly excluirInsumo: IExcluirInsumoUseCase,
    @Inject(LIBERAR_INSUMO_MANUTENCAO_USE_CASE) private readonly liberarManutencao: ILiberarInsumoManutencaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar unidades de insumo' })
  @ApiQuery({ name: 'tipoId', required: false, type: String, description: 'Filtrar por tipo de insumo' })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get()
  async listar(@Query('tipoId') tipoId?: string) {
    const lista = await this.listarInsumos.execute(tipoId)
    return lista.map((i) => this.toResponse(i))
  }

  @ApiOperation({ summary: 'Buscar unidade de insumo por ID' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.toResponse(await this.buscarInsumo.execute(id))
  }

  @ApiOperation({ summary: 'Colocar unidade em manutenção' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/manutencao')
  async colocarManutencao(@Param('id') id: string): Promise<void> {
    await this.colocarEmManutencao.execute(id)
  }

  @ApiOperation({ summary: 'Liberar unidade da manutenção' })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id/liberar-manutencao')
  async liberarManutencaoHandler(@Param('id') id: string) {
    return this.toResponse(await this.liberarManutencao.execute(id))
  }

  @ApiOperation({ summary: 'Excluir unidade de insumo' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async excluir(@Param('id') id: string): Promise<void> {
    await this.excluirInsumo.execute(id)
  }

  private toResponse(i: Insumo) {
    return {
      id: i.id,
      identificador: i.identificador,
      tipoInsumoId: i.tipoInsumoId,
      tipoInsumo: {
        id: i.tipoInsumo.id,
        nome: i.tipoInsumo.nome,
        categoria: i.tipoInsumo.categoria,
        sigla: i.tipoInsumo.sigla,
      },
      descricao: i.descricao,
      status: i.status,
      criadoEm: i.criadoEm,
    }
  }
}
