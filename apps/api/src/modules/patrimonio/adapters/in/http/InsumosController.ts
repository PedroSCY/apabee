import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IAtualizarInsumoUseCase,
  IBuscarInsumoUseCase,
  IColocarInsumoEmManutencaoUseCase,
  ICriarInsumoUseCase,
  IListarInsumosUseCase,
  Insumo,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtualizarInsumoDto, CriarInsumoDto } from './dto'
import {
  ATUALIZAR_INSUMO_USE_CASE,
  BUSCAR_INSUMO_USE_CASE,
  COLOCAR_INSUMO_MANUTENCAO_USE_CASE,
  CRIAR_INSUMO_USE_CASE,
  LISTAR_INSUMOS_USE_CASE,
} from '../../../patrimonio.tokens'

@ApiTags('Patrimônio — Insumos')
@ApiBearerAuth('JWT')
@Controller('patrimonio/insumos')
@Roles(RoleUsuario.ADMIN)
export class InsumosController {
  constructor(
    @Inject(CRIAR_INSUMO_USE_CASE)
    private readonly criarInsumo: ICriarInsumoUseCase,
    @Inject(LISTAR_INSUMOS_USE_CASE)
    private readonly listarInsumos: IListarInsumosUseCase,
    @Inject(BUSCAR_INSUMO_USE_CASE)
    private readonly buscarInsumo: IBuscarInsumoUseCase,
    @Inject(ATUALIZAR_INSUMO_USE_CASE)
    private readonly atualizarInsumo: IAtualizarInsumoUseCase,
    @Inject(COLOCAR_INSUMO_MANUTENCAO_USE_CASE)
    private readonly colocarEmManutencao: IColocarInsumoEmManutencaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar insumo' })
  @ApiResponse({ status: 201, description: 'Insumo criado.' })
  @Post()
  async criar(@Body() dto: CriarInsumoDto) {
    return this.toResponse(await this.criarInsumo.execute(dto))
  }

  @ApiOperation({ summary: 'Listar insumos' })
  @ApiResponse({ status: 200, description: 'Lista de insumos.' })
  @Get()
  async listar() {
    const lista = await this.listarInsumos.execute()
    return lista.map((i) => this.toResponse(i))
  }

  @ApiOperation({ summary: 'Buscar insumo por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Insumo encontrado.' })
  @ApiResponse({ status: 404, description: 'Insumo não encontrado.' })
  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.toResponse(await this.buscarInsumo.execute(id))
  }

  @ApiOperation({ summary: 'Atualizar dados do insumo' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Insumo atualizado.' })
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarInsumoDto) {
    return this.toResponse(await this.atualizarInsumo.execute(id, dto))
  }

  @ApiOperation({ summary: 'Colocar insumo em manutenção' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Status atualizado para MANUTENCAO.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/manutencao')
  async colocarManutencao(@Param('id') id: string): Promise<void> {
    await this.colocarEmManutencao.execute(id)
  }

  private toResponse(i: Insumo) {
    return {
      id: i.id,
      nome: i.nome,
      categoria: i.categoria,
      descricao: i.descricao,
      status: i.status,
      criadoEm: i.criadoEm,
    }
  }
}
