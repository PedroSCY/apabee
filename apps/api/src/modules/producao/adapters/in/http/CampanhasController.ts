import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  ApuracaoCampanha,
  Campanha,
  Contribuicao,
  Cota,
  CustoCampanha,
  IAtualizarContribuicaoUseCase,
  IBuscarCampanhaUseCase,
  ICancelarCampanhaUseCase,
  ICancelarCotaUseCase,
  IConcluirCampanhaUseCase,
  IAtualizarReceitaCampanhaUseCase,
  IDeletarOrdemProducaoUseCase,
  IConfirmarCotaUseCase,
  IConsultarApuracaoUseCase,
  ICriarCampanhaUseCase,
  ICriarOrdemProducaoUseCase,
  IDeletarCampanhaUseCase,
  IIniciarCampanhaUseCase,
  IListarCampanhasUseCase,
  IListarContribuicoesPorCampanhaUseCase,
  IListarCotasPorCampanhaUseCase,
  IListarCustosPorCampanhaUseCase,
  IListarOrdensPorCampanhaUseCase,
  ILiquidarCampanhaUseCase,
  IRegistrarContribuicaoUseCase,
  IRegistrarCotaUseCase,
  IRegistrarCustoUseCase,
  IRemoverContribuicaoUseCase,
  IRemoverCustoUseCase,
  ItemAquisicao,
  OrdemProducao,
  PedidoAquisicao,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { SseService } from '../../../../../shared/sse/sse.service'
import {
  AdicionarItemAquisicaoDto,
  AtualizarContribuicaoDto,
  AtualizarItemAquisicaoDto,
  AtualizarReceitaDto,
  CriarCampanhaDto,
  AlocarPoolParaCampanhaDto,
  ConfirmarOrdemProducaoDto,
  CriarMetaProducaoDto,
  CriarOrdemProducaoDto,
  RegistrarContribuicaoDto,
  RegistrarCotaDto,
  RegistrarCustoDto,
  RegistrarPedidoAquisicaoDto,
} from './dto'
import {
  ApuracaoCampanhaResponse,
  CampanhaResponse,
  ContribuicaoResponse,
  CotaResponse,
  CustoCampanhaResponse,
  EstoqueCampanhaResponse,
  ItemAquisicaoResponse,
  MetaProducaoResponse,
  OrdemProducaoResponse,
  PedidoAquisicaoResponse,
} from './dto/response.types'
import {
  ADICIONAR_ITEM_AQUISICAO_USE_CASE,
  ATUALIZAR_CONTRIBUICAO_USE_CASE,
  ATUALIZAR_ITEM_AQUISICAO_USE_CASE,
  BUSCAR_CAMPANHA_USE_CASE,
  CALCULAR_CONSUMO_USE_CASE,
  CALCULAR_DISTRIBUICAO_PREVIEW_USE_CASE,
  CANCELAR_CAMPANHA_USE_CASE,
  CANCELAR_COTA_USE_CASE,
  DELETAR_CAMPANHA_USE_CASE,
  ATUALIZAR_RECEITA_CAMPANHA_USE_CASE,
  CONCLUIR_CAMPANHA_USE_CASE,
  DELETAR_ORDEM_PRODUCAO_USE_CASE,
  CONFIRMAR_COTA_USE_CASE,
  CONSULTAR_APURACAO_USE_CASE,
  CRIAR_CAMPANHA_USE_CASE,
  CRIAR_ORDEM_PRODUCAO_USE_CASE,
  DISTRIBUIR_ITENS_USE_CASE,
  INICIAR_CAMPANHA_USE_CASE,
  LISTAR_CAMPANHAS_USE_CASE,
  LISTAR_CONTRIBUICOES_CAMPANHA_USE_CASE,
  LISTAR_COTAS_CAMPANHA_USE_CASE,
  LISTAR_CUSTOS_CAMPANHA_USE_CASE,
  LISTAR_ITENS_AQUISICAO_USE_CASE,
  LISTAR_ESTOQUE_CAMPANHA_USE_CASE,
  LISTAR_ORDENS_CAMPANHA_USE_CASE,
  LIQUIDAR_CAMPANHA_USE_CASE,
  PREVIEW_RATEIO_CAMPANHA_USE_CASE,
  RASTREAR_CAMPANHA_USE_CASE,
  REGISTRAR_CONTRIBUICAO_USE_CASE,
  REGISTRAR_COTA_USE_CASE,
  REGISTRAR_CUSTO_USE_CASE,
  REMOVER_CONTRIBUICAO_USE_CASE,
  REMOVER_CUSTO_USE_CASE,
  REMOVER_ITEM_AQUISICAO_USE_CASE,
  RESUMO_CAPTACAO_USE_CASE,
  REGISTRAR_PEDIDO_AQUISICAO_USE_CASE,
  LISTAR_PEDIDOS_AQUISICAO_USE_CASE,
  CONFIRMAR_PAGAMENTO_PEDIDO_USE_CASE,
  MARCAR_PEDIDO_ENTREGUE_USE_CASE,
  CRIAR_META_PRODUCAO_USE_CASE,
  LISTAR_METAS_PRODUCAO_USE_CASE,
  REMOVER_META_PRODUCAO_USE_CASE,
  CONFIRMAR_ORDEM_PRODUCAO_USE_CASE,
  ESTORNAR_ORDEM_PRODUCAO_USE_CASE,
  ALOCAR_POOL_PARA_CAMPANHA_USE_CASE,
} from '../../../producao.tokens'
import { RastrearCampanhaUseCase } from '../../../application/use-cases'
import {
  ConfirmarPagamentoPedidoUseCase,
  ListarPedidosAquisicaoUseCase,
  MarcarPedidoEntregueUseCase,
  RegistrarPedidoAquisicaoUseCase,
} from '../../../application/use-cases/index'
import {
  IAdicionarItemAquisicaoUseCase,
  IAtualizarItemAquisicaoUseCase,
  ICalcularConsumoUseCase,
  ICalcularDistribuicaoPreviewUseCase,
  IDistribuirItensUseCase,
  IListarEstoqueCampanhaUseCase,
  IListarItensAquisicaoUseCase,
  IPreviewRateioCampanhaUseCase,
  IRemoverItemAquisicaoUseCase,
  IResumoCaptacaoUseCase,
  ICriarMetaProducaoUseCase,
  IListarMetasProducaoUseCase,
  IRemoverMetaProducaoUseCase,
  IConfirmarOrdemProducaoUseCase,
  IEstornarOrdemProducaoUseCase,
  IAlocarPoolParaCampanhaUseCase,
  MetaProducaoDetalhe,
} from '@apa/core'

@ApiTags('Produção — Campanhas')
@ApiBearerAuth('JWT')
@Controller('producao/campanhas')
export class CampanhasController {
  constructor(
    @Inject(CRIAR_CAMPANHA_USE_CASE) private readonly criar: ICriarCampanhaUseCase,
    @Inject(LISTAR_CAMPANHAS_USE_CASE) private readonly listar: IListarCampanhasUseCase,
    @Inject(BUSCAR_CAMPANHA_USE_CASE) private readonly buscar: IBuscarCampanhaUseCase,
    @Inject(INICIAR_CAMPANHA_USE_CASE) private readonly iniciar: IIniciarCampanhaUseCase,
    @Inject(CONCLUIR_CAMPANHA_USE_CASE) private readonly concluir: IConcluirCampanhaUseCase,
    @Inject(CANCELAR_CAMPANHA_USE_CASE) private readonly cancelar: ICancelarCampanhaUseCase,
    @Inject(DELETAR_CAMPANHA_USE_CASE) private readonly deletar: IDeletarCampanhaUseCase,
    @Inject(ATUALIZAR_RECEITA_CAMPANHA_USE_CASE) private readonly atualizarReceita: IAtualizarReceitaCampanhaUseCase,
    @Inject(LIQUIDAR_CAMPANHA_USE_CASE) private readonly liquidar: ILiquidarCampanhaUseCase,
    @Inject(PREVIEW_RATEIO_CAMPANHA_USE_CASE) private readonly previewRateio: IPreviewRateioCampanhaUseCase,
    @Inject(REGISTRAR_CONTRIBUICAO_USE_CASE) private readonly registrarContribuicao: IRegistrarContribuicaoUseCase,
    @Inject(LISTAR_CONTRIBUICOES_CAMPANHA_USE_CASE) private readonly listarContribuicoes: IListarContribuicoesPorCampanhaUseCase,
    @Inject(ATUALIZAR_CONTRIBUICAO_USE_CASE) private readonly atualizarContribuicao: IAtualizarContribuicaoUseCase,
    @Inject(REMOVER_CONTRIBUICAO_USE_CASE) private readonly removerContribuicao: IRemoverContribuicaoUseCase,
    @Inject(REGISTRAR_COTA_USE_CASE) private readonly registrarCota: IRegistrarCotaUseCase,
    @Inject(LISTAR_COTAS_CAMPANHA_USE_CASE) private readonly listarCotas: IListarCotasPorCampanhaUseCase,
    @Inject(CONFIRMAR_COTA_USE_CASE) private readonly confirmarCota: IConfirmarCotaUseCase,
    @Inject(CANCELAR_COTA_USE_CASE) private readonly cancelarCota: ICancelarCotaUseCase,
    @Inject(RESUMO_CAPTACAO_USE_CASE) private readonly resumoCaptacao: IResumoCaptacaoUseCase,
    @Inject(REGISTRAR_CUSTO_USE_CASE) private readonly registrarCusto: IRegistrarCustoUseCase,
    @Inject(LISTAR_CUSTOS_CAMPANHA_USE_CASE) private readonly listarCustos: IListarCustosPorCampanhaUseCase,
    @Inject(REMOVER_CUSTO_USE_CASE) private readonly removerCusto: IRemoverCustoUseCase,
    @Inject(CRIAR_ORDEM_PRODUCAO_USE_CASE) private readonly criarOrdem: ICriarOrdemProducaoUseCase,
    @Inject(LISTAR_ORDENS_CAMPANHA_USE_CASE) private readonly listarOrdens: IListarOrdensPorCampanhaUseCase,
    @Inject(DELETAR_ORDEM_PRODUCAO_USE_CASE) private readonly deletarOrdem: IDeletarOrdemProducaoUseCase,
    @Inject(CALCULAR_CONSUMO_USE_CASE) private readonly calcularConsumo: ICalcularConsumoUseCase,
    @Inject(ADICIONAR_ITEM_AQUISICAO_USE_CASE) private readonly adicionarItem: IAdicionarItemAquisicaoUseCase,
    @Inject(LISTAR_ITENS_AQUISICAO_USE_CASE) private readonly listarItens: IListarItensAquisicaoUseCase,
    @Inject(REMOVER_ITEM_AQUISICAO_USE_CASE) private readonly removerItem: IRemoverItemAquisicaoUseCase,
    @Inject(ATUALIZAR_ITEM_AQUISICAO_USE_CASE) private readonly atualizarItem: IAtualizarItemAquisicaoUseCase,
    @Inject(DISTRIBUIR_ITENS_USE_CASE) private readonly distribuir: IDistribuirItensUseCase,
    @Inject(CALCULAR_DISTRIBUICAO_PREVIEW_USE_CASE) private readonly previewDistribuicao: ICalcularDistribuicaoPreviewUseCase,
    @Inject(CONSULTAR_APURACAO_USE_CASE) private readonly consultarApuracao: IConsultarApuracaoUseCase,
    @Inject(RASTREAR_CAMPANHA_USE_CASE) private readonly rastrear: RastrearCampanhaUseCase,
    @Inject(LISTAR_ESTOQUE_CAMPANHA_USE_CASE) private readonly listarEstoqueCampanha: IListarEstoqueCampanhaUseCase,
    @Inject(REGISTRAR_PEDIDO_AQUISICAO_USE_CASE) private readonly registrarPedido: RegistrarPedidoAquisicaoUseCase,
    @Inject(LISTAR_PEDIDOS_AQUISICAO_USE_CASE) private readonly listarPedidos: ListarPedidosAquisicaoUseCase,
    @Inject(CONFIRMAR_PAGAMENTO_PEDIDO_USE_CASE) private readonly confirmarPagamento: ConfirmarPagamentoPedidoUseCase,
    @Inject(MARCAR_PEDIDO_ENTREGUE_USE_CASE) private readonly marcarEntregue: MarcarPedidoEntregueUseCase,
    @Inject(CONFIRMAR_ORDEM_PRODUCAO_USE_CASE) private readonly confirmarOrdem: IConfirmarOrdemProducaoUseCase,
    @Inject(ESTORNAR_ORDEM_PRODUCAO_USE_CASE) private readonly estornarOrdemUC: IEstornarOrdemProducaoUseCase,
    @Inject(CRIAR_META_PRODUCAO_USE_CASE) private readonly criarMeta: ICriarMetaProducaoUseCase,
    @Inject(LISTAR_METAS_PRODUCAO_USE_CASE) private readonly listarMetas: IListarMetasProducaoUseCase,
    @Inject(REMOVER_META_PRODUCAO_USE_CASE) private readonly removerMeta: IRemoverMetaProducaoUseCase,
    @Inject(ALOCAR_POOL_PARA_CAMPANHA_USE_CASE) private readonly alocarPool: IAlocarPoolParaCampanhaUseCase,
    private readonly sse: SseService,
  ) {}

  // ─── Campanha ─────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Criar campanha de produção ou aquisição' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criarCampanha(@Body() dto: CriarCampanhaDto): Promise<CampanhaResponse> {
    const campanha = await this.criar.execute({
      ...dto,
      dataInicio: new Date(dto.dataInicio),
      dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      prazoContribuicao: dto.prazoContribuicao ? new Date(dto.prazoContribuicao) : undefined,
    })
    this.sse.emit('producao:campanha-criada', campanha.id)
    return this.toCampanhaResponse(campanha)
  }

  @ApiOperation({ summary: 'Listar campanhas' })
  @Get()
  async listarCampanhas(): Promise<CampanhaResponse[]> {
    const lista = await this.listar.execute()
    return lista.map(c => this.toCampanhaResponse(c))
  }

  @ApiOperation({ summary: 'Buscar campanha por ID' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async buscarCampanha(@Param('id') id: string): Promise<CampanhaResponse> {
    return this.toCampanhaResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Iniciar campanha (PLANEJADA → ATIVA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/iniciar')
  async iniciarCampanha(@Param('id') id: string) {
    const campanha = await this.iniciar.execute(id)
    this.sse.emit('producao:campanha-iniciada', id)
    return this.toCampanhaResponse(campanha)
  }

  @ApiOperation({ summary: 'Concluir campanha (ATIVA → CONCLUIDA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/concluir')
  async concluirCampanha(@Param('id') id: string) {
    const campanha = await this.concluir.execute(id)
    this.sse.emit('producao:campanha-concluida', id)
    return this.toCampanhaResponse(campanha)
  }

  @ApiOperation({ summary: 'Cancelar campanha (guard: sem contribuições, não LIQUIDADA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/cancelar')
  async cancelarCampanha(@Param('id') id: string) {
    const campanha = await this.cancelar.execute(id)
    this.sse.emit('producao:campanha-cancelada', id)
    return this.toCampanhaResponse(campanha)
  }

  @ApiOperation({ summary: 'Excluir campanha permanentemente (apenas PLANEJADA ou CANCELADA)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Campanha excluída.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletarCampanha(@Param('id') id: string) {
    await this.deletar.execute(id)
  }

  @ApiOperation({ summary: 'Informar receita total da campanha antes da liquidação (campanha CONCLUIDA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/receita')
  async atualizarReceita_(@Param('id') id: string, @Body() dto: AtualizarReceitaDto) {
    return this.toCampanhaResponse(await this.atualizarReceita.execute(id, dto.receitaTotal))
  }

  @ApiOperation({ summary: 'Liquidar campanha — calcula rateio e gera movimentos financeiros (RN26, irreversível)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/liquidar')
  async liquidarCampanha(@Param('id') id: string) {
    const campanha = await this.liquidar.execute(id)
    this.sse.emit('producao:campanha-liquidada', id)
    return this.toCampanhaResponse(campanha)
  }

  @ApiOperation({ summary: 'Preview do rateio antes da liquidação — campanha CONCLUIDA com receitaTotal informada (RN13/RN18, read-only)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Get(':id/rateio-preview')
  async previewRateio_(@Param('id') id: string) {
    return this.previewRateio.execute(id)
  }

  @ApiOperation({ summary: 'Consultar apuração financeira da campanha (disponível após liquidação — RN26)' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/apuracao')
  async consultarApuracao_(@Param('id') campanhaId: string) {
    return this.toApuracaoResponse(await this.consultarApuracao.execute(campanhaId))
  }

  // ─── Contribuições ────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Registrar contribuição em campanha' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/contribuicoes')
  async registrarContribuicao_(@Param('id') campanhaId: string, @Body() dto: RegistrarContribuicaoDto) {
    const contribuicao = await this.registrarContribuicao.execute({ ...dto, campanhaId })
    this.sse.emit('producao:contribuicao-registrada', campanhaId)
    return this.toContribuicaoResponse(contribuicao)
  }

  @ApiOperation({ summary: 'Listar contribuições da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/contribuicoes')
  async listarContribuicoes_(@Param('id') campanhaId: string) {
    const lista = await this.listarContribuicoes.execute(campanhaId)
    return lista.map(c => this.toContribuicaoResponse(c))
  }

  @ApiOperation({ summary: 'Atualizar contribuição (apenas campanha ATIVA)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'contribuicaoId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/contribuicoes/:contribuicaoId')
  async atualizarContribuicao_(
    @Param('id') campanhaId: string,
    @Param('contribuicaoId') contribuicaoId: string,
    @Body() dto: AtualizarContribuicaoDto,
  ) {
    return this.toContribuicaoResponse(
      await this.atualizarContribuicao.execute(contribuicaoId, { ...dto }),
    )
  }

  @ApiOperation({ summary: 'Remover contribuição' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'contribuicaoId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/contribuicoes/:contribuicaoId')
  async removerContribuicao_(@Param('contribuicaoId') contribuicaoId: string) {
    await this.removerContribuicao.execute(contribuicaoId)
  }

  // ─── Cotas (AQUISICAO) ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Registrar cota em campanha de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/cotas')
  async registrarCota_(@Param('id') campanhaId: string, @Body() dto: RegistrarCotaDto) {
    const cota = await this.registrarCota.execute({ ...dto, campanhaId })
    this.sse.emit('producao:cota-registrada', campanhaId)
    return this.toCotaResponse(cota)
  }

  @ApiOperation({ summary: 'Listar cotas da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/cotas')
  async listarCotas_(@Param('id') campanhaId: string) {
    const lista = await this.listarCotas.execute(campanhaId)
    return lista.map(c => this.toCotaResponse(c))
  }

  @ApiOperation({ summary: 'Confirmar pagamento de cota' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cotaId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/cotas/:cotaId/confirmar')
  async confirmarCota_(@Param('cotaId') cotaId: string) {
    const cota = await this.confirmarCota.execute(cotaId)
    this.sse.emit('producao:cota-confirmada', cotaId)
    return this.toCotaResponse(cota)
  }

  @ApiOperation({ summary: 'Cancelar cota não paga' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'cotaId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/cotas/:cotaId')
  async cancelarCota_(@Param('cotaId') cotaId: string) {
    await this.cancelarCota.execute(cotaId)
  }

  @ApiOperation({ summary: 'Resumo de captação da campanha de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Get(':id/cotas/resumo')
  async resumoCaptacao_(@Param('id') campanhaId: string) {
    return this.resumoCaptacao.execute(campanhaId)
  }

  // ─── Itens de Aquisição ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Adicionar item ao plano de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/itens')
  async adicionarItem_(@Param('id') campanhaId: string, @Body() dto: AdicionarItemAquisicaoDto) {
    return this.toItemAquisicaoResponse(await this.adicionarItem.execute({ ...dto, campanhaId }))
  }

  @ApiOperation({ summary: 'Listar itens de aquisição da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/itens')
  async listarItens_(@Param('id') campanhaId: string) {
    const lista = await this.listarItens.execute(campanhaId)
    return lista.map(i => this.toItemAquisicaoResponse(i))
  }

  @ApiOperation({ summary: 'Atualizar item de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'itemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/itens/:itemId')
  async atualizarItem_(
    @Param('id') campanhaId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AtualizarItemAquisicaoDto,
  ) {
    return this.toItemAquisicaoResponse(await this.atualizarItem.execute(itemId, { ...dto }))
  }

  @ApiOperation({ summary: 'Remover item de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'itemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/itens/:itemId')
  async removerItem_(@Param('itemId') itemId: string) {
    await this.removerItem.execute(itemId)
  }

  @ApiOperation({ summary: 'Preview da distribuição dos itens entre cotistas' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Get(':id/preview-distribuicao')
  async previewDistribuicao_(@Param('id') campanhaId: string) {
    return this.previewDistribuicao.execute(campanhaId)
  }

  @ApiOperation({ summary: 'Distribuir itens entre cotistas e liquidar campanha de aquisição' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post(':id/distribuir')
  async distribuir_(@Param('id') campanhaId: string) {
    return this.toApuracaoResponse(await this.distribuir.execute(campanhaId))
  }

  // ─── Pedidos de Aquisição ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Registrar pedido em campanha de aquisição individual', description: 'Campanha deve estar ATIVA e ser do destinatário INDIVIDUAL. AssociadoId obrigatório quando origem=ASSOCIADO.' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da campanha' })
  @ApiResponse({ status: 201, description: 'Pedido registrado.' })
  @ApiResponse({ status: 400, description: 'Campanha inativa, não é individual, ou associadoId ausente.' })
  @ApiResponse({ status: 404, description: 'Campanha ou item não encontrado.' })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/pedidos-aquisicao')
  async registrarPedido_(@Param('id') campanhaId: string, @Body() dto: RegistrarPedidoAquisicaoDto) {
    return this.toPedidoAquisicaoResponse(await this.registrarPedido.execute({ ...dto, campanhaId }))
  }

  @ApiOperation({ summary: 'Listar pedidos de uma campanha de aquisição individual' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/pedidos-aquisicao')
  async listarPedidos_(@Param('id') campanhaId: string, @Query('associadoId') associadoId?: string) {
    const lista = await this.listarPedidos.execute(campanhaId, associadoId)
    return lista.map(p => this.toPedidoAquisicaoResponse(p))
  }

  @ApiOperation({ summary: 'Confirmar pagamento de um pedido de aquisição' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('pedidos-aquisicao/:pedidoId/pagar')
  async confirmarPagamento_(@Param('pedidoId') pedidoId: string) {
    return this.toPedidoAquisicaoResponse(await this.confirmarPagamento.execute(pedidoId))
  }

  @ApiOperation({ summary: 'Marcar pedido de aquisição como entregue' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch('pedidos-aquisicao/:pedidoId/entregar')
  async marcarEntregue_(@Param('pedidoId') pedidoId: string) {
    return this.toPedidoAquisicaoResponse(await this.marcarEntregue.execute(pedidoId))
  }

  // ─── Rastreabilidade ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Rastrear pedidos por código de campanha (RN24 — recall)' })
  @ApiParam({ name: 'codigo', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Get('rastrear/:codigo')
  async rastrear_(@Param('codigo') codigo: string) {
    return this.rastrear.execute(codigo)
  }

  // ─── Custos ───────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Registrar custo da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/custos')
  async registrarCusto_(@Param('id') campanhaId: string, @Body() dto: RegistrarCustoDto) {
    return this.toCustoResponse(await this.registrarCusto.execute({ ...dto, campanhaId }))
  }

  @ApiOperation({ summary: 'Listar custos da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/custos')
  async listarCustos_(@Param('id') campanhaId: string) {
    const lista = await this.listarCustos.execute(campanhaId)
    return lista.map(c => this.toCustoResponse(c))
  }

  @ApiOperation({ summary: 'Remover custo' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'custoId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/custos/:custoId')
  async removerCusto_(@Param('custoId') custoId: string) {
    await this.removerCusto.execute(custoId)
  }

  // ─── Ordens de Produção ───────────────────────────────────────────────────

  @ApiOperation({ summary: 'Criar ordem de produção para campanha PRODUCAO' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/ordens')
  async criarOrdem_(@Param('id') campanhaId: string, @Body() dto: CriarOrdemProducaoDto) {
    return this.toOrdemResponse(await this.criarOrdem.execute({ ...dto, campanhaId }))
  }

  @ApiOperation({ summary: 'Listar ordens de produção da campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/ordens')
  async listarOrdens_(@Param('id') campanhaId: string) {
    const lista = await this.listarOrdens.execute(campanhaId)
    return lista.map(o => this.toOrdemResponse(o))
  }

  @ApiOperation({ summary: 'Confirmar ordem de produção RASCUNHO — consome estoque, credita produto, devolve sobras ao pool (RN15/RN24)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ordemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/ordens/:ordemId/confirmar')
  async confirmarOrdem_(
    @Param('ordemId') ordemId: string,
    @Body() dto: ConfirmarOrdemProducaoDto,
  ) {
    const ordem = await this.confirmarOrdem.execute({ ordemId, ...dto })
    this.sse.emit('producao:ordem-confirmada', ordemId)
    return this.toOrdemResponse(ordem)
  }

  @ApiOperation({ summary: 'Estornar ordem de produção CONCLUIDA para RASCUNHO' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ordemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/ordens/:ordemId/estornar')
  async estornarOrdem_(
    @Param('id') id: string,
    @Param('ordemId') ordemId: string,
  ) {
    const ordem = await this.estornarOrdemUC.execute(id, ordemId)
    return this.toOrdemResponse(ordem)
  }

  @ApiOperation({ summary: 'Remover ordem de produção RASCUNHO' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ordemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/ordens/:ordemId')
  async deletarOrdem_(@Param('ordemId') ordemId: string) {
    await this.deletarOrdem.execute(ordemId)
  }

  @ApiOperation({ summary: 'Calcular consumo previsto da ordem (preview — não executa)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'ordemId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Get(':id/ordens/:ordemId/consumo')
  async calcularConsumo_(@Param('ordemId') ordemId: string) {
    const materiais = await this.calcularConsumo.execute(ordemId)
    return { materiais }
  }

  // ─── Metas de Produção ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Adicionar meta de produção à campanha PLANEJADA (apenas PRODUCAO)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/metas')
  async criarMeta_(@Param('id') campanhaId: string, @Body() dto: CriarMetaProducaoDto): Promise<MetaProducaoResponse> {
    const meta = await this.criarMeta.execute({ ...dto, campanhaId })
    return {
      id: meta.id,
      campanhaId: meta.campanhaId,
      produtoId: meta.produtoId,
      quantidadePlanejada: meta.quantidadePlanejada,
      perdaPercentualEstimada: meta.perdaPercentualEstimada,
      criadoEm: meta.criadoEm,
    }
  }

  @ApiOperation({ summary: 'Listar metas de produção da campanha com viabilidade de estoque' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/metas')
  async listarMetas_(@Param('id') campanhaId: string) {
    const lista = await this.listarMetas.execute(campanhaId)
    return lista.map(d => this.toMetaDetalheResponse(d))
  }

  @ApiOperation({ summary: 'Remover meta de produção (apenas campanha PLANEJADA)' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'metaId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/metas/:metaId')
  async removerMeta_(@Param('metaId') metaId: string) {
    await this.removerMeta.execute(metaId)
  }

  // ─── Estoque da Campanha ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Listar saldo de matéria-prima disponível na campanha' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/estoque-campanha')
  async listarEstoque_(@Param('id') campanhaId: string): Promise<EstoqueCampanhaResponse[]> {
    const lista = await this.listarEstoqueCampanha.execute(campanhaId)
    return lista.map((e): EstoqueCampanhaResponse => ({
      id: e.id,
      tipoMateriaPrimaId: e.tipoMateriaPrimaId,
      quantidadeDisponivel: e.quantidadeDisponivel,
      unidade: e.unidade,
    }))
  }

  @ApiOperation({ summary: 'Alocar matéria-prima do pool para o estoque da campanha' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204 })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/alocar-pool')
  async alocarPoolParaCampanha(@Param('id') campanhaId: string, @Body() dto: AlocarPoolParaCampanhaDto) {
    await this.alocarPool.execute({ campanhaId, ...dto })
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private toCampanhaResponse(c: Campanha): CampanhaResponse {
    return {
      id: c.id, codigo: c.codigo, nome: c.nome, tipo: c.tipo, safraId: c.safraId,
      dataInicio: c.dataInicio, dataFim: c.dataFim, status: c.status,
      destinatario: c.destinatario,
      valorMeta: c.valorMeta, prazoContribuicao: c.prazoContribuicao,
      valorMinimo: c.valorMinimo, valorMaximo: c.valorMaximo,
      receitaTotal: c.receitaTotal, custoTotal: c.custoTotal, criadoEm: c.criadoEm,
    }
  }

  private toContribuicaoResponse(c: Contribuicao): ContribuicaoResponse {
    return {
      id: c.id, campanhaId: c.campanhaId, associadoId: c.associadoId, tipo: c.tipo,
      valorMonetario: c.valorMonetario, colheitaId: c.colheitaId, volume: c.volume,
      tipoMateriaPrimaId: c.tipoMateriaPrimaId,
      descricao: c.descricao, liquidado: c.liquidado, criadoEm: c.criadoEm,
    }
  }

  private toCotaResponse(c: Cota): CotaResponse {
    return {
      id: c.id, campanhaId: c.campanhaId,
      associadoId: c.associadoId ?? null,
      origem: c.origem,
      valor: c.valor, pago: c.pago,
      dataRegistro: c.data,
      dataConfirmacao: c.confirmadoEm ?? null,
    }
  }

  private toCustoResponse(c: CustoCampanha): CustoCampanhaResponse {
    return {
      id: c.id, campanhaId: c.campanhaId, descricao: c.descricao,
      valor: c.valor, categoria: c.categoria, pagoPorId: c.pagoPorId,
      comprovanteUrl: c.comprovanteUrl, criadoEm: c.criadoEm,
    }
  }

  private toOrdemResponse(o: OrdemProducao): OrdemProducaoResponse {
    return {
      id: o.id, campanhaId: o.campanhaId, produtoId: o.produtoId,
      quantidade: o.quantidade, status: o.status, perdaPercentual: o.perdaPercentual,
      produtosGerados: o.produtosGerados,
      quantidadeReal: o.quantidadeReal ?? null,
      sobrasRecuperadas: o.sobrasRecuperadas ?? null,
      observacao: o.observacao ?? null,
      materiaisConsumidos: o.materiaisConsumidos,
      criadoEm: o.criadoEm, confirmadoEm: o.confirmadoEm ?? null,
    }
  }

  private toApuracaoResponse(a: ApuracaoCampanha): ApuracaoCampanhaResponse {
    return {
      id: a.id, campanhaId: a.campanhaId,
      faturamentoTotal: a.faturamentoTotal, custoTotal: a.custoTotal, lucroLiquido: a.lucroLiquido,
      liquidadoEm: a.liquidadoEm, participantes: a.rateios,
    }
  }

  private toItemAquisicaoResponse(i: ItemAquisicao): ItemAquisicaoResponse {
    return {
      id: i.id, campanhaId: i.campanhaId, nome: i.nome,
      precoUnitario: i.precoUnitario, quantidadeMeta: i.quantidadeMeta,
      quantidadeTotalPedida: i.quantidadeTotalPedida, unidade: i.unidade,
      tipoDestinoId: i.tipoDestinoId, metaAtingida: i.metaAtingida,
      valorTotalPedido: i.valorTotalPedido(), criadoEm: i.criadoEm,
    }
  }

  private toMetaDetalheResponse(d: MetaProducaoDetalhe): MetaProducaoResponse {
    return {
      id: d.meta.id, campanhaId: d.meta.campanhaId, produtoId: d.meta.produtoId,
      nomeProduto: d.nomeProduto, precoProduto: d.precoProduto,
      quantidadePlanejada: d.meta.quantidadePlanejada,
      perdaPercentualEstimada: d.meta.perdaPercentualEstimada,
      receitaEsperada: d.receitaEsperada,
      materiaisNecessarios: d.materiaisNecessarios,
      viavelComEstoqueCampanha: d.viavelComEstoqueCampanha,
      criadoEm: d.meta.criadoEm,
    }
  }

  private toPedidoAquisicaoResponse(p: PedidoAquisicao): PedidoAquisicaoResponse {
    return {
      id: p.id, campanhaId: p.campanhaId, itemAquisicaoId: p.itemAquisicaoId,
      associadoId: p.associadoId, origem: p.origem,
      quantidade: p.quantidade, valorTotal: p.valorTotal,
      pago: p.pago, pagoEm: p.pagoEm,
      entregue: p.entregue, entregueEm: p.entregueEm,
      criadoEm: p.criadoEm,
    }
  }
}
