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
  IExcluirEquipamentoUseCase,
  ILiberarEquipamentoManutencaoUseCase,
  IListarEquipamentosUseCase,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarEquipamentoDto, AtualizarEquipamentoDto } from './dto'
import {
  ATUALIZAR_EQUIPAMENTO_USE_CASE,
  BUSCAR_EQUIPAMENTO_USE_CASE,
  COLOCAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
  CRIAR_EQUIPAMENTO_USE_CASE,
  EXCLUIR_EQUIPAMENTO_USE_CASE,
  LIBERAR_EQUIPAMENTO_MANUTENCAO_USE_CASE,
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
    @Inject(EXCLUIR_EQUIPAMENTO_USE_CASE)
    private readonly excluirEquipamento: IExcluirEquipamentoUseCase,
    @Inject(LIBERAR_EQUIPAMENTO_MANUTENCAO_USE_CASE)
    private readonly liberarManutencao: ILiberarEquipamentoManutencaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar equipamento' })
  @ApiResponse({ status: 201, description: 'Equipamento criado.' })
  @Post()
  async criar(@Body() dto: CriarEquipamentoDto) {
    return this.toResponse(await this.criarEquipamento.execute(dto))
  }

  @ApiOperation({ summary: 'Listar equipamentos' })
  @ApiResponse({ status: 200, description: 'Lista de equipamentos.' })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get()
  async listar() {
    const lista = await this.listarEquipamentos.execute()
    return lista.map((e) => this.toResponse(e))
  }

  @ApiOperation({ summary: 'Buscar equipamento por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Equipamento encontrado.' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado.' })
  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.toResponse(await this.buscarEquipamento.execute(id))
  }

  @ApiOperation({ summary: 'Atualizar dados do equipamento' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Equipamento atualizado.' })
  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarEquipamentoDto) {
    return this.toResponse(await this.atualizarEquipamento.execute(id, dto))
  }

  @ApiOperation({ summary: 'Colocar equipamento em manutenção' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Status atualizado para MANUTENCAO.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(':id/manutencao')
  async colocarManutencao(@Param('id') id: string): Promise<void> {
    await this.colocarEmManutencao.execute(id)
  }

  @ApiOperation({ summary: 'Liberar equipamento da manutenção' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Equipamento liberado para DISPONIVEL.' })
  @Patch(':id/liberar-manutencao')
  async liberarManutencaoHandler(@Param('id') id: string) {
    return this.toResponse(await this.liberarManutencao.execute(id))
  }

  @ApiOperation({ summary: 'Excluir equipamento' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Equipamento excluído.' })
  @ApiResponse({ status: 400, description: 'Equipamento em uso — devolva antes de excluir.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async excluir(@Param('id') id: string): Promise<void> {
    await this.excluirEquipamento.execute(id)
  }

  private toResponse(e: Equipamento) {
    return {
      id: e.id,
      nome: e.nome,
      numeroSerie: e.numeroSerie,
      descricao: e.descricao,
      status: e.status,
      criadoEm: e.criadoEm,
    }
  }
}
