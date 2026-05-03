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
  Equipamento,
  IAtualizarEquipamentoUseCase,
  IBuscarEquipamentoUseCase,
  IColocarEquipamentoEmManutencaoUseCase,
  ICriarEquipamentoUseCase,
  IListarEquipamentosUseCase,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarEquipamentoDto, AtualizarEquipamentoDto } from './dto'
import {
  ATUALIZAR_EQUIPAMENTO_USE_CASE,
  BUSCAR_EQUIPAMENTO_USE_CASE,
  COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
  CRIAR_EQUIPAMENTO_USE_CASE,
  LISTAR_EQUIPAMENTOS_USE_CASE,
} from '../../../patrimonio.tokens'

@ApiTags('Patrimônio — Equipamentos')
@ApiBearerAuth('JWT')
@Controller('patrimonio/equipamentos')
@Roles(RoleUsuario.ADMIN)
export class EquipamentosController {
  constructor(
    @Inject(CRIAR_EQUIPAMENTO_USE_CASE)
    private readonly criarEquipamento: ICriarEquipamentoUseCase,
    @Inject(LISTAR_EQUIPAMENTOS_USE_CASE)
    private readonly listarEquipamentos: IListarEquipamentosUseCase,
    @Inject(BUSCAR_EQUIPAMENTO_USE_CASE)
    private readonly buscarEquipamento: IBuscarEquipamentoUseCase,
    @Inject(ATUALIZAR_EQUIPAMENTO_USE_CASE)
    private readonly atualizarEquipamento: IAtualizarEquipamentoUseCase,
    @Inject(COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE)
    private readonly colocarEmManutencao: IColocarEquipamentoEmManutencaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar equipamento' })
  @ApiResponse({ status: 201, description: 'Equipamento criado.' })
  @Post()
  async criar(@Body() dto: CriarEquipamentoDto): Promise<Equipamento> {
    return this.criarEquipamento.execute(dto)
  }

  @ApiOperation({ summary: 'Listar equipamentos' })
  @ApiResponse({ status: 200, description: 'Lista de equipamentos.' })
  @Get()
  async listar(): Promise<Equipamento[]> {
    return this.listarEquipamentos.execute()
  }

  @ApiOperation({ summary: 'Buscar equipamento por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Equipamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado.' })
  @Get(':id')
  async buscar(@Param('id') id: string): Promise<Equipamento> {
    return this.buscarEquipamento.execute(id)
  }

  @ApiOperation({ summary: 'Atualizar dados do equipamento' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Equipamento atualizado.' })
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarEquipamentoDto,
  ): Promise<Equipamento> {
    return this.atualizarEquipamento.execute(id, dto)
  }

  @ApiOperation({ summary: 'Colocar equipamento em manutenção' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Status atualizado para MANUTENCAO.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/manutencao')
  async colocarManutencao(@Param('id') id: string): Promise<void> {
    await this.colocarEmManutencao.execute(id)
  }
}
