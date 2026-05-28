import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario, StatusMensalidade } from '@apa/shared'
import {
  ICancelarCobrancaUseCase,
  IEmitirCobrancaMensalidadeUseCase,
  IEstornarMensalidadeUseCase,
  IExcluirMensalidadeUseCase,
  IGerarMensalidadesUseCase,
  IListarMensalidadesPorAssociadoUseCase,
  IListarMensalidadesUseCase,
  IMarcarIsentoMensalidadeUseCase,
  IMovimentoFinanceiroRepository,
  IQuitarMensalidadeUseCase,
  IReativarMensalidadeUseCase,
  Mensalidade,
} from '@apa/core'
import {
  CANCELAR_COBRANCA_USE_CASE,
  EMITIR_COBRANCA_USE_CASE,
  ESTORNAR_MENSALIDADE_USE_CASE,
  EXCLUIR_MENSALIDADE_USE_CASE,
  GERAR_MENSALIDADES_USE_CASE,
  LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE,
  LISTAR_MENSALIDADES_USE_CASE,
  MARCAR_ISENTO_MENSALIDADE_USE_CASE,
  MOVIMENTO_FINANCEIRO_REPOSITORY,
  QUITAR_MENSALIDADE_USE_CASE,
  REATIVAR_MENSALIDADE_USE_CASE,
} from '../../../financeiro.tokens'
import { GerarMensalidadesDto } from './dto/GerarMensalidadesDto'
import { QuitarMensalidadeDto } from './dto/QuitarMensalidadeDto'
import { MarcarIsentoDto } from './dto/MarcarIsentoDto'
import { ExportarMensalidadesDto } from './dto/ExportarMensalidadesDto'
import { SseService } from '../../../../../shared/sse/sse.service'
import { RelatorioFinanceiroService } from '../../../adapters/out/RelatorioFinanceiroService'
import { EmitirCobrancaResponse, MensalidadeResponse } from './dto/response.types'

@ApiTags('Financeiro — Mensalidades')
@ApiBearerAuth('JWT')
@Controller('financeiro/mensalidades')
@Roles(RoleUsuario.ADMIN)
export class MensalidadesController {
  constructor(
    @Inject(GERAR_MENSALIDADES_USE_CASE) private readonly gerar: IGerarMensalidadesUseCase,
    @Inject(QUITAR_MENSALIDADE_USE_CASE) private readonly quitar: IQuitarMensalidadeUseCase,
    @Inject(MARCAR_ISENTO_MENSALIDADE_USE_CASE) private readonly marcarIsento: IMarcarIsentoMensalidadeUseCase,
    @Inject(REATIVAR_MENSALIDADE_USE_CASE) private readonly reativar: IReativarMensalidadeUseCase,
    @Inject(LISTAR_MENSALIDADES_USE_CASE) private readonly listar: IListarMensalidadesUseCase,
    @Inject(LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE) private readonly listarPorAssociado: IListarMensalidadesPorAssociadoUseCase,
    @Inject(EMITIR_COBRANCA_USE_CASE) private readonly emitirCobranca: IEmitirCobrancaMensalidadeUseCase,
    @Inject(CANCELAR_COBRANCA_USE_CASE) private readonly cancelarCobranca: ICancelarCobrancaUseCase,
    @Inject(ESTORNAR_MENSALIDADE_USE_CASE) private readonly estornar: IEstornarMensalidadeUseCase,
    @Inject(EXCLUIR_MENSALIDADE_USE_CASE) private readonly excluir: IExcluirMensalidadeUseCase,
    @Inject(MOVIMENTO_FINANCEIRO_REPOSITORY) private readonly movimentoRepo: IMovimentoFinanceiroRepository,
    private readonly sse: SseService,
    private readonly relatorioService: RelatorioFinanceiroService,
  ) {}

  @ApiOperation({ summary: 'Gerar mensalidades em lote (ADMIN)', description: 'Cria mensalidades para todos os associados ativos da competência informada. Ignora isentos estruturais (isentoMensalidade=true). Idempotente — não duplica se já existirem.' })
  @ApiResponse({ status: 201, description: 'Mensalidades geradas.' })
  @ApiResponse({ status: 400, description: 'Competência inválida ou valor ausente.' })
  @Post('gerar')
  async gerar_(@Body() dto: GerarMensalidadesDto): Promise<MensalidadeResponse[]> {
    const mensalidades = await this.gerar.execute(dto)
    this.sse.emit('financeiro:mensalidade-gerada')
    return mensalidades.map((m) => this.toMensalidadeResponse(m))
  }

  @ApiOperation({ summary: 'Listar mensalidades (ADMIN)', description: 'Requer ao menos um filtro: `status` OU `ano`+`mes`. Sem filtros retorna lista vazia.' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano de competência (ex: 2025)' })
  @ApiQuery({ name: 'mes', required: false, type: Number, description: 'Mês de competência (1–12)' })
  @ApiQuery({ name: 'status', required: false, enum: StatusMensalidade, enumName: 'StatusMensalidade' })
  @ApiResponse({ status: 200, description: 'Lista de mensalidades.' })
  @Get()
  async listar_(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('status') status?: StatusMensalidade,
  ): Promise<MensalidadeResponse[]> {
    const mensalidades = await this.listar.execute({
      competenciaAno: ano ? Number(ano) : undefined,
      competenciaMes: mes ? Number(mes) : undefined,
      status,
    })
    return mensalidades.map((m) => this.toMensalidadeResponse(m))
  }

  @ApiOperation({ summary: 'Listar mensalidades de um associado (ADMIN)' })
  @ApiParam({ name: 'associadoId', description: 'UUID do associado' })
  @ApiResponse({ status: 200, description: 'Mensalidades do associado.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado.' })
  @Get('associado/:associadoId')
  async listarPorAssociado_(@Param('associadoId') associadoId: string): Promise<MensalidadeResponse[]> {
    const mensalidades = await this.listarPorAssociado.execute(associadoId)
    return mensalidades.map((m) => this.toMensalidadeResponse(m))
  }

  @ApiOperation({ summary: 'Quitar mensalidade manualmente (ADMIN)', description: 'Registra quitação presencial ou por transferência. Para quitação via PIX, use o webhook.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 200, description: 'Mensalidade quitada.' })
  @ApiResponse({ status: 400, description: 'Mensalidade já quitada ou isenta.' })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada.' })
  @Patch(':id/quitar')
  async quitar_(@Param('id') id: string, @Body() dto: QuitarMensalidadeDto): Promise<MensalidadeResponse> {
    const mensalidade = await this.quitar.execute({ mensalidadeId: id, metodoPagamento: dto.metodoPagamento })
    this.sse.emit('financeiro:mensalidade-quitada', id)
    return this.toMensalidadeResponse(mensalidade)
  }

  @ApiOperation({ summary: 'Isentar mensalidade pontualmente (ADMIN)', description: 'Marca a mensalidade desta competência como isenta. Reversível via /reativar. Diferente da isenção estrutural (Associado.isentoMensalidade).' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 200, description: 'Mensalidade isenta.' })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada.' })
  @Patch(':id/isentar')
  async isentar(@Param('id') id: string, @Body() dto: MarcarIsentoDto): Promise<MensalidadeResponse> {
    const mensalidade = await this.marcarIsento.execute({ mensalidadeId: id, motivo: dto.motivo })
    this.sse.emit('financeiro:mensalidade-isenta', id)
    return this.toMensalidadeResponse(mensalidade)
  }

  @ApiOperation({ summary: 'Reativar mensalidade isenta (ADMIN)', description: 'Reverte a isenção pontual, voltando ao status PENDENTE.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 200, description: 'Mensalidade reativada para PENDENTE.' })
  @ApiResponse({ status: 400, description: 'Mensalidade não está com status ISENTO.' })
  @Patch(':id/reativar')
  async reativar_(@Param('id') id: string): Promise<MensalidadeResponse> {
    const mensalidade = await this.reativar.execute(id)
    this.sse.emit('financeiro:mensalidade-reativada', id)
    return this.toMensalidadeResponse(mensalidade)
  }

  @ApiOperation({
    summary: 'Emitir cobrança online (ADMIN)',
    description: `Cria a cobrança PIX no gateway de pagamento configurado. Sem corpo — dados do associado são obtidos automaticamente.

**Pré-requisitos:** mensalidade com status PENDENTE e sem cobrança ativa.

**Asaas:** exige CPF cadastrado no associado (\`PATCH /identidade/associados/:id\`). Retorna também o \`pixCopiaECola\`.

**InfinityPay:** não exige CPF. O pagador acessa o link para realizar o PIX (sem copia-e-cola inline).`,
  })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 201, description: 'Cobrança emitida. Retorna linkPagamento e pixCopiaECola (quando disponível).' })
  @ApiResponse({ status: 400, description: 'Associado sem CPF (Asaas) / mensalidade não PENDENTE / já tem cobrança ativa.' })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada.' })
  @Post(':id/emitir-cobranca')
  async emitirCobranca_(@Param('id') id: string): Promise<EmitirCobrancaResponse> {
    const resultado = await this.emitirCobranca.execute(id)
    this.sse.emit('financeiro:cobranca-emitida', id)
    return {
      mensalidade: this.toMensalidadeResponse(resultado.mensalidade),
      linkPagamento: resultado.linkPagamento,
      pixCopiaECola: resultado.pixCopiaECola,
      pixQrCodeBase64: resultado.pixQrCodeBase64,
    }
  }

  @ApiOperation({ summary: 'Cancelar cobrança no gateway (ADMIN)', description: 'Cancela a cobrança pendente no gateway de pagamento. Não cancela a mensalidade em si.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 200, description: 'Cobrança cancelada.' })
  @ApiResponse({ status: 404, description: 'Mensalidade sem cobrança ativa.' })
  @Delete(':id/cobranca')
  async cancelarCobranca_(@Param('id') id: string): Promise<MensalidadeResponse> {
    const mensalidade = await this.cancelarCobranca.execute(id)
    this.sse.emit('financeiro:cobranca-cancelada', id)
    return this.toMensalidadeResponse(mensalidade)
  }

  @ApiOperation({ summary: 'Estornar mensalidade quitada (ADMIN)', description: 'Reverte a quitação — volta ao status PENDENTE e cancela a cobrança no gateway se houver.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 200, description: 'Mensalidade estornada.' })
  @ApiResponse({ status: 400, description: 'Mensalidade não está quitada.' })
  @Post(':id/estornar')
  async estornar_(@Param('id') id: string): Promise<MensalidadeResponse> {
    const mensalidade = await this.estornar.execute(id)
    this.sse.emit('financeiro:mensalidade-estornada', id)
    return this.toMensalidadeResponse(mensalidade)
  }

  @ApiOperation({ summary: 'Excluir mensalidade PENDENTE (ADMIN)', description: 'Remove definitivamente uma mensalidade PENDENTE sem cobrança ativa. Após a exclusão, o botão "Gerar" pode recriar a mensalidade para aquele associado/mês.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 204, description: 'Mensalidade excluída.' })
  @ApiResponse({ status: 400, description: 'Mensalidade não é PENDENTE ou tem cobrança ativa.' })
  @ApiResponse({ status: 404, description: 'Mensalidade não encontrada.' })
  @Delete(':id')
  @HttpCode(204)
  async excluir_(@Param('id') id: string) {
    await this.excluir.execute(id)
    this.sse.emit('financeiro:mensalidade-excluida', id)
  }

  @ApiOperation({ summary: 'Exportar mensalidades (ADMIN)', description: 'Gera CSV ou PDF das mensalidades com os filtros aplicados.' })
  @ApiQuery({ name: 'formato', required: true, enum: ['pdf', 'csv'] })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'mes', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: StatusMensalidade })
  @Get('exportar')
  async exportar(@Query() q: ExportarMensalidadesDto, @Res() res: FastifyReply) {
    const mensalidades = await this.listar.execute({
      competenciaAno: q.ano,
      competenciaMes: q.mes,
      status: q.status,
    })
    const ano = q.ano ?? new Date().getFullYear()
    const filename = `mensalidades-${ano}${q.mes ? '-' + String(q.mes).padStart(2, '0') : ''}`

    if (q.formato === 'csv') {
      const buf = await this.relatorioService.gerarCsvMensalidades(mensalidades, { ano, mes: q.mes })
      res.header('Content-Type', 'text/csv; charset=utf-8')
      res.header('Content-Disposition', `attachment; filename="${filename}.csv"`)
      return res.send(buf)
    }

    const buf = await this.relatorioService.gerarPdfMensalidades(mensalidades, { ano, mes: q.mes })
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="${filename}.pdf"`)
    return res.send(buf)
  }

  @ApiOperation({ summary: 'Extrato PDF do associado (ADMIN)', description: 'Gera extrato completo do associado (mensalidades + movimentos) em PDF.' })
  @ApiParam({ name: 'associadoId', description: 'UUID do associado' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @Get('associado/:associadoId/extrato')
  async extrato(@Param('associadoId') associadoId: string, @Query('ano') ano: string | undefined, @Res() res: FastifyReply) {
    const anoNum = ano ? Number(ano) : new Date().getFullYear()
    const [mensalidades, movimentos] = await Promise.all([
      this.listarPorAssociado.execute(associadoId),
      this.movimentoRepo.findByAssociado(associadoId),
    ])

    const mensalidadesAno = mensalidades.filter(m => m.competenciaAno === anoNum)
    const movimentosAno = movimentos.filter(m => m.data.getFullYear() === anoNum)

    const buf = await this.relatorioService.gerarPdfExtratoAssociado(associadoId, mensalidadesAno, movimentosAno, anoNum)
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="extrato-${associadoId.slice(0, 8)}-${anoNum}.pdf"`)
    return res.send(buf)
  }

  private toMensalidadeResponse(m: Mensalidade): MensalidadeResponse {
    return {
      id: m.id,
      associadoId: m.associadoId,
      competenciaAno: m.competenciaAno,
      competenciaMes: m.competenciaMes,
      valor: m.valor,
      status: m.status,
      metodoPagamento: m.metodoPagamento,
      dataPagamento: m.dataPagamento,
      motivoIsencao: m.motivoIsencao,
      criadoEm: m.criadoEm,
      cobrancaGatewayId: m.cobrancaGatewayId,
      cobrancaLink: m.cobrancaLink,
      cobrancaStatus: m.cobrancaStatus,
      cobrancaPixCopiaECola: m.cobrancaPixCopiaECola,
      cobrancaValorCobrado: m.cobrancaValorCobrado,
    }
  }
}
