import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import {
  IListarMovimentosUseCase,
  IObterDashboardFinanceiroUseCase,
  IRegistrarMovimentoUseCase,
  MovimentoFinanceiro,
} from '@apa/core'
import {
  LISTAR_MOVIMENTOS_USE_CASE,
  OBTER_DASHBOARD_FINANCEIRO_USE_CASE,
  REGISTRAR_MOVIMENTO_USE_CASE,
} from '../../../financeiro.tokens'
import { RelatorioFinanceiroService } from '../../../adapters/out/RelatorioFinanceiroService'
import { RegistrarMovimentoDto } from './dto/RegistrarMovimentoDto'
import { ExportarMovimentosDto } from './dto/ExportarMovimentosDto'

@ApiTags('Financeiro — Movimentos')
@ApiBearerAuth('JWT')
@Controller('financeiro/movimentos')
@Roles(RoleUsuario.ADMIN)
export class MovimentosController {
  constructor(
    @Inject(LISTAR_MOVIMENTOS_USE_CASE)
    private readonly listar: IListarMovimentosUseCase,
    @Inject(OBTER_DASHBOARD_FINANCEIRO_USE_CASE)
    private readonly dashboard: IObterDashboardFinanceiroUseCase,
    @Inject(REGISTRAR_MOVIMENTO_USE_CASE)
    private readonly registrar: IRegistrarMovimentoUseCase,
    private readonly relatorioService: RelatorioFinanceiroService,
  ) {}

  @ApiOperation({ summary: 'Dashboard financeiro (ADMIN)', description: 'KPIs do ano: receita, despesas, saldo e inadimplentes. Também retorna série mensal para o gráfico.' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano (padrão: ano atual)' })
  @ApiResponse({ status: 200 })
  @Get('dashboard')
  dashboard_(@Query('ano') ano?: string) {
    return this.dashboard.execute(ano ? Number(ano) : new Date().getFullYear())
  }

  @ApiOperation({ summary: 'Listar movimentos financeiros (ADMIN)', description: 'Extrato geral de movimentos — mensalidades, antecipações, rateios, custos. Filtrável por associado ou campanha.' })
  @ApiQuery({ name: 'associadoId', required: false, type: String })
  @ApiQuery({ name: 'campanhaId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros (padrão: 200)' })
  @ApiResponse({ status: 200 })
  @Get()
  async listar_(
    @Query('associadoId') associadoId?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('limit') limit?: string,
  ) {
    const movimentos = await this.listar.execute({ associadoId, campanhaId, limit: limit ? Number(limit) : 200 })
    return movimentos.map((m) => this.toResponse(m))
  }

  @ApiOperation({ summary: 'Registrar lançamento manual (ADMIN)', description: 'Cria um movimento ANTECIPACAO ou CUSTO avulso. CUSTO é salvo como valor negativo.' })
  @ApiResponse({ status: 201, description: 'Movimento registrado.' })
  @ApiResponse({ status: 400, description: 'Tipo inválido ou valor ≤ 0.' })
  @Post()
  @HttpCode(201)
  async registrar_(@Body() dto: RegistrarMovimentoDto) {
    const movimento = await this.registrar.execute({
      ...dto,
      data: dto.data ? new Date(dto.data) : undefined,
    })
    return this.toResponse(movimento)
  }

  @ApiOperation({ summary: 'Exportar movimentos (ADMIN)', description: 'Gera CSV ou PDF dos movimentos financeiros com os filtros aplicados.' })
  @ApiQuery({ name: 'formato', required: true, enum: ['pdf', 'csv'] })
  @ApiQuery({ name: 'associadoId', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'dataInicio', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'dataFim', required: false, description: 'YYYY-MM-DD' })
  @Get('exportar')
  async exportar(@Query() q: ExportarMovimentosDto, @Res() res: FastifyReply) {
    const movimentos = await this.listar.execute({
      associadoId: q.associadoId,
      campanhaId: undefined,
      dataInicio: q.dataInicio ? new Date(q.dataInicio) : undefined,
      dataFim: q.dataFim ? new Date(q.dataFim) : undefined,
    } as any)

    const filtrados = q.tipo ? movimentos.filter(m => m.tipo === q.tipo) : movimentos
    const titulo = q.associadoId ? undefined : undefined

    const filename = `movimentos${q.dataInicio ? '-' + q.dataInicio.slice(0, 7) : ''}`

    if (q.formato === 'csv') {
      const buf = await this.relatorioService.gerarCsvMovimentos(filtrados, { titulo })
      res.header('Content-Type', 'text/csv; charset=utf-8')
      res.header('Content-Disposition', `attachment; filename="${filename}.csv"`)
      return res.send(buf)
    }

    const buf = await this.relatorioService.gerarPdfMovimentos(filtrados, { titulo })
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="${filename}.pdf"`)
    return res.send(buf)
  }

  @ApiOperation({ summary: 'Relatório completo de campanha (ADMIN)', description: 'Gera PDF ou CSV com contribuições, custos, produção, vendas e rateio da campanha.' })
  @ApiQuery({ name: 'formato', required: true, enum: ['pdf', 'csv'] })
  @Get('campanha/:campanhaId/relatorio')
  async relatorioCampanha(
    @Param('campanhaId') campanhaId: string,
    @Query('formato') formato: 'pdf' | 'csv',
    @Res() res: FastifyReply,
  ) {
    const slug = campanhaId.slice(0, 8)
    if (formato === 'csv') {
      const buf = await this.relatorioService.gerarCsvRelatorioCampanha(campanhaId)
      res.header('Content-Type', 'text/csv; charset=utf-8')
      res.header('Content-Disposition', `attachment; filename="campanha-${slug}.csv"`)
      return res.send(buf)
    }
    const buf = await this.relatorioService.gerarPdfRelatorioCampanha(campanhaId)
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="campanha-${slug}.pdf"`)
    return res.send(buf)
  }

  private toResponse(m: MovimentoFinanceiro) {
    return { id: m.id, associadoId: m.associadoId, campanhaId: m.campanhaId, valor: m.valor, tipo: m.tipo, descricao: m.descricao, data: m.data }
  }
}
