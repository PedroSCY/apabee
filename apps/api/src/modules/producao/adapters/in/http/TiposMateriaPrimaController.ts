import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IBuscarTipoMateriaPrimaUseCase,
  ICriarTipoMateriaPrimaUseCase,
  IListarTiposMateriaPrimaUseCase,
  TipoMateriaPrima,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarTipoMateriaPrimaDto } from './dto'
import {
  BUSCAR_TIPO_MATERIA_PRIMA_USE_CASE,
  CRIAR_TIPO_MATERIA_PRIMA_USE_CASE,
  LISTAR_TIPOS_MATERIA_PRIMA_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Tipos de Matéria-Prima')
@ApiBearerAuth('JWT')
@Controller('producao/tipos-materia-prima')
export class TiposMateriaPrimaController {
  constructor(
    @Inject(CRIAR_TIPO_MATERIA_PRIMA_USE_CASE)
    private readonly criar: ICriarTipoMateriaPrimaUseCase,
    @Inject(LISTAR_TIPOS_MATERIA_PRIMA_USE_CASE)
    private readonly listar: IListarTiposMateriaPrimaUseCase,
    @Inject(BUSCAR_TIPO_MATERIA_PRIMA_USE_CASE)
    private readonly buscar: IBuscarTipoMateriaPrimaUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar tipo de matéria-prima' })
  @ApiResponse({ status: 201, description: 'Tipo criado.' })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criarTipo(@Body() dto: CriarTipoMateriaPrimaDto): Promise<TipoMateriaPrima> {
    return this.criar.execute(dto)
  }

  @ApiOperation({ summary: 'Listar tipos de matéria-prima' })
  @ApiResponse({ status: 200, description: 'Lista de tipos.' })
  @Get()
  async listarTipos(): Promise<TipoMateriaPrima[]> {
    return this.listar.execute()
  }

  @ApiOperation({ summary: 'Buscar tipo de matéria-prima por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Não encontrado.' })
  @Get(':id')
  async buscarTipo(@Param('id') id: string): Promise<TipoMateriaPrima> {
    return this.buscar.execute(id)
  }
}
