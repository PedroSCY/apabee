import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IBuscarTipoMateriaPrimaUseCase,
  IConsultarEstoqueUseCase,
  ICriarTipoMateriaPrimaUseCase,
  IDeletarTipoMateriaPrimaUseCase,
  IDeletarItemPoolUseCase,
  IListarConsumiveisUseCase,
  IListarTiposMateriaPrimaUseCase,
  IMigrarInsumosConsumiveisUseCase,
  IRegistrarEntradaConsumivelUseCase,
  TipoMateriaPrima,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarTipoMateriaPrimaDto, MigrarInsumosDto, RegistrarEntradaConsumivelDto } from './dto'
import { ConsumivelComSaldoResponse, PoolMateriaPrimaResponse, TipoMateriaPrimaResponse } from './dto/response.types'
import {
  BUSCAR_TIPO_MATERIA_PRIMA_USE_CASE,
  CONSULTAR_ESTOQUE_USE_CASE,
  CRIAR_TIPO_MATERIA_PRIMA_USE_CASE,
  DELETAR_TIPO_MATERIA_PRIMA_USE_CASE,
  DELETAR_ITEM_POOL_USE_CASE,
  LISTAR_CONSUMIVEIS_USE_CASE,
  LISTAR_TIPOS_MATERIA_PRIMA_USE_CASE,
  MIGRAR_INSUMOS_USE_CASE,
  REGISTRAR_ENTRADA_CONSUMIVEL_USE_CASE,
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
    @Inject(DELETAR_TIPO_MATERIA_PRIMA_USE_CASE)
    private readonly deletar: IDeletarTipoMateriaPrimaUseCase,
    @Inject(LISTAR_CONSUMIVEIS_USE_CASE)
    private readonly listarConsumiveis: IListarConsumiveisUseCase,
    @Inject(REGISTRAR_ENTRADA_CONSUMIVEL_USE_CASE)
    private readonly registrarEntrada: IRegistrarEntradaConsumivelUseCase,
    @Inject(MIGRAR_INSUMOS_USE_CASE)
    private readonly migrarInsumos: IMigrarInsumosConsumiveisUseCase,
    @Inject(CONSULTAR_ESTOQUE_USE_CASE)
    private readonly consultarEstoque: IConsultarEstoqueUseCase,
    @Inject(DELETAR_ITEM_POOL_USE_CASE)
    private readonly deletarItemPool: IDeletarItemPoolUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar tipo de matéria-prima' })
  @ApiResponse({ status: 201, description: 'Tipo criado.' })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criarTipo(@Body() dto: CriarTipoMateriaPrimaDto): Promise<TipoMateriaPrimaResponse> {
    return this.toResponse(await this.criar.execute(dto))
  }

  @ApiOperation({ summary: 'Listar tipos de matéria-prima' })
  @ApiResponse({ status: 200, description: 'Lista de tipos.' })
  @Get()
  async listarTipos(): Promise<TipoMateriaPrimaResponse[]> {
    const lista = await this.listar.execute()
    return lista.map((t) => this.toResponse(t))
  }

  @ApiOperation({ summary: 'Buscar tipo de matéria-prima por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Não encontrado.' })
  @Get(':id')
  async buscarTipo(@Param('id') id: string): Promise<TipoMateriaPrimaResponse> {
    return this.toResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Deletar tipo de matéria-prima' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Deletado.' })
  @ApiResponse({ status: 404, description: 'Não encontrado.' })
  @ApiResponse({ status: 409, description: 'Possui dependências vinculadas.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletarTipo(@Param('id') id: string) {
    await this.deletar.execute(id)
  }

  // ─── Consumíveis (RN21 — tipos com unidade UNIDADE) ──────────────────────

  @ApiOperation({ summary: 'Listar consumíveis (unidade=UNIDADE) com saldo de estoque' })
  @Get('consumiveis')
  async listarConsumiveis_(): Promise<ConsumivelComSaldoResponse[]> {
    const lista = await this.listarConsumiveis.execute()
    return lista.map(({ tipo, estoque }) => ({
      tipo: this.toResponse(tipo),
      saldo: estoque?.quantidadeDisponivel ?? 0,
    }))
  }

  @ApiOperation({ summary: 'Registrar entrada de consumível no estoque (compra ou doação)' })
  @Roles(RoleUsuario.ADMIN)
  @Post('consumiveis/entrada')
  async registrarEntrada_(@Body() dto: RegistrarEntradaConsumivelDto) {
    return this.registrarEntrada.execute(dto)
  }

  @ApiOperation({ summary: 'Migrar insumos existentes para controle de estoque consumível (idempotente)' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('consumiveis/migrar')
  async migrarInsumos_(@Body() dto: MigrarInsumosDto) {
    return this.migrarInsumos.execute(dto)
  }

  // ─── Pool de Matéria-Prima (RN14/RN15) ───────────────────────────────────

  @ApiOperation({ summary: 'Remover item do pool (somente com saldo zero)' })
  @ApiParam({ name: 'tipoId', type: String })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 400, description: 'Saldo diferente de zero.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('pool/:tipoId')
  async deletarPool(@Param('tipoId') tipoId: string) {
    await this.deletarItemPool.execute(tipoId)
  }

  @ApiOperation({ summary: 'Consultar saldo do pool de matéria-prima (estoque compartilhado)' })
  @ApiResponse({ status: 200, description: 'Saldo por tipo de matéria-prima.' })
  @Get('pool')
  async consultarPool_(): Promise<PoolMateriaPrimaResponse[]> {
    const estoques = await this.consultarEstoque.execute()
    return estoques.map((e): PoolMateriaPrimaResponse => ({
      tipoMateriaPrimaId: e.tipoMateriaPrimaId,
      quantidadeDisponivel: Number(e.quantidadeDisponivel),
      unidade: e.unidade,
      atualizadoEm: e.atualizadoEm,
    }))
  }

  private toResponse(t: TipoMateriaPrima): TipoMateriaPrimaResponse {
    return {
      id: t.id,
      nome: t.nome,
      unidade: t.unidade,
      descricao: t.descricao,
    }
  }
}
