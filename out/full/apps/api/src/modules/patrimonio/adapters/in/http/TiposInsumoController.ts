import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IAdicionarUnidadesInsumoUseCase,
  IAtualizarTipoInsumoUseCase,
  IBuscarTipoInsumoUseCase,
  ICriarTipoInsumoUseCase,
  IExcluirTipoInsumoUseCase,
  IListarInsumosUseCase,
  IListarTiposInsumoUseCase,
  Insumo,
  TipoInsumo,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AdicionarUnidadesDto, AtualizarTipoInsumoDto, CriarTipoInsumoDto } from './dto'
import {
  ADICIONAR_UNIDADES_INSUMO_USE_CASE,
  ATUALIZAR_TIPO_INSUMO_USE_CASE,
  BUSCAR_TIPO_INSUMO_USE_CASE,
  CRIAR_TIPO_INSUMO_USE_CASE,
  EXCLUIR_TIPO_INSUMO_USE_CASE,
  LISTAR_INSUMOS_USE_CASE,
  LISTAR_TIPOS_INSUMO_USE_CASE,
} from '../../../patrimonio.tokens'

@ApiTags('Patrimônio — Tipos de Insumo')
@ApiBearerAuth('JWT')
@Controller('patrimonio/tipos-insumo')
@Roles(RoleUsuario.ADMIN)
export class TiposInsumoController {
  constructor(
    @Inject(CRIAR_TIPO_INSUMO_USE_CASE) private readonly criar: ICriarTipoInsumoUseCase,
    @Inject(LISTAR_TIPOS_INSUMO_USE_CASE) private readonly listar: IListarTiposInsumoUseCase,
    @Inject(BUSCAR_TIPO_INSUMO_USE_CASE) private readonly buscar: IBuscarTipoInsumoUseCase,
    @Inject(ATUALIZAR_TIPO_INSUMO_USE_CASE) private readonly atualizar: IAtualizarTipoInsumoUseCase,
    @Inject(EXCLUIR_TIPO_INSUMO_USE_CASE) private readonly excluir: IExcluirTipoInsumoUseCase,
    @Inject(ADICIONAR_UNIDADES_INSUMO_USE_CASE) private readonly adicionarUnidades: IAdicionarUnidadesInsumoUseCase,
    @Inject(LISTAR_INSUMOS_USE_CASE) private readonly listarUnidades: IListarInsumosUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar tipo de insumo' })
  @Post()
  async criarHandler(@Body() dto: CriarTipoInsumoDto) {
    return this.tipoToResponse(await this.criar.execute(dto))
  }

  @ApiOperation({ summary: 'Listar tipos de insumo' })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get()
  async listarHandler() {
    const tipos = await this.listar.execute()
    return tipos.map((t) => this.tipoToResponse(t))
  }

  @ApiOperation({ summary: 'Buscar tipo de insumo por ID' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get(':id')
  async buscarHandler(@Param('id') id: string) {
    return this.tipoToResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Atualizar tipo de insumo' })
  @ApiParam({ name: 'id', type: String })
  @Patch(':id')
  async atualizarHandler(@Param('id') id: string, @Body() dto: AtualizarTipoInsumoDto) {
    return this.tipoToResponse(await this.atualizar.execute(id, dto))
  }

  @ApiOperation({ summary: 'Excluir tipo de insumo (sem unidades vinculadas)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async excluirHandler(@Param('id') id: string): Promise<void> {
    await this.excluir.execute(id)
  }

  @ApiOperation({ summary: 'Adicionar unidades individuais a um tipo de insumo' })
  @ApiParam({ name: 'id', type: String })
  @Post(':id/unidades')
  async adicionarUnidadesHandler(@Param('id') id: string, @Body() dto: AdicionarUnidadesDto) {
    const unidades = await this.adicionarUnidades.execute({
      tipoInsumoId: id,
      quantidade: dto.quantidade,
      descricao: dto.descricao,
    })
    return unidades.map((u) => this.unidadeToResponse(u))
  }

  @ApiOperation({ summary: 'Listar unidades de um tipo de insumo' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'tipoId', required: false, type: String })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get(':id/unidades')
  async listarUnidadesHandler(@Param('id') id: string) {
    const unidades = await this.listarUnidades.execute(id)
    return unidades.map((u) => this.unidadeToResponse(u))
  }

  private tipoToResponse(t: TipoInsumo) {
    return {
      id: t.id,
      nome: t.nome,
      categoria: t.categoria,
      sigla: t.sigla,
      descricao: t.descricao,
      criadoEm: t.criadoEm,
    }
  }

  private unidadeToResponse(u: Insumo) {
    return {
      id: u.id,
      identificador: u.identificador,
      tipoInsumoId: u.tipoInsumoId,
      tipoInsumo: {
        id: u.tipoInsumo.id,
        nome: u.tipoInsumo.nome,
        categoria: u.tipoInsumo.categoria,
        sigla: u.tipoInsumo.sigla,
      },
      descricao: u.descricao,
      status: u.status,
      criadoEm: u.criadoEm,
    }
  }
}
