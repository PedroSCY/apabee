import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import {
  IAssociadoRepository,
  IEmitirCobrancaMensalidadeUseCase,
  IListarMensalidadesPorAssociadoUseCase,
  IListarMovimentosUseCase,
  IMensalidadeRepository,
  Mensalidade,
  MovimentoFinanceiro,
} from '@apa/core'
import { ASSOCIADO_REPOSITORY } from '../../../../identidade/identidade.tokens'
import {
  EMITIR_COBRANCA_USE_CASE,
  LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE,
  LISTAR_MOVIMENTOS_USE_CASE,
  MENSALIDADE_REPOSITORY,
} from '../../../financeiro.tokens'
import { RelatorioFinanceiroService } from '../../../adapters/out/RelatorioFinanceiroService'

type JwtUser = { sub: string; role: string }

@ApiTags('Financeiro — Meu Financeiro')
@ApiBearerAuth('JWT')
@Controller('financeiro/me')
@Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
export class MeuFinanceiroController {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepo: IAssociadoRepository,
    @Inject(MENSALIDADE_REPOSITORY)
    private readonly mensalidadeRepo: IMensalidadeRepository,
    @Inject(LISTAR_MENSALIDADES_POR_ASSOCIADO_USE_CASE)
    private readonly listarMensalidades: IListarMensalidadesPorAssociadoUseCase,
    @Inject(LISTAR_MOVIMENTOS_USE_CASE)
    private readonly listarMovimentos: IListarMovimentosUseCase,
    @Inject(EMITIR_COBRANCA_USE_CASE)
    private readonly emitirCobranca: IEmitirCobrancaMensalidadeUseCase,
    private readonly relatorioService: RelatorioFinanceiroService,
  ) {}

  @ApiOperation({ summary: 'Minhas mensalidades', description: 'Lista todas as mensalidades do associado logado.' })
  @ApiResponse({ status: 200, description: 'Lista de mensalidades.' })
  @Get('mensalidades')
  async minhasMensalidades(@Req() req: { user: JwtUser }) {
    const associadoId = await this.resolverAssociadoId(req.user.sub)
    const mensalidades = await this.listarMensalidades.execute(associadoId)
    return mensalidades.map((m) => this.toMensalidadeResponse(m))
  }

  @ApiOperation({ summary: 'Solicitar PIX para minha mensalidade', description: 'Emite cobrança PIX para uma mensalidade do próprio associado. Apenas mensalidades PENDENTES sem cobrança ativa.' })
  @ApiParam({ name: 'id', description: 'UUID da mensalidade' })
  @ApiResponse({ status: 201, description: 'Cobrança emitida.' })
  @ApiResponse({ status: 400, description: 'Mensalidade não PENDENTE ou já tem cobrança.' })
  @ApiResponse({ status: 403, description: 'Mensalidade não pertence ao associado logado.' })
  @Post('mensalidades/:id/solicitar-pix')
  async solicitarPix(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    const associadoId = await this.resolverAssociadoId(req.user.sub)

    // Valida a propriedade antes de qualquer interação com o gateway
    const mensalidade = await this.mensalidadeRepo.findById(id)
    if (!mensalidade) throw new NotFoundException('Mensalidade não encontrada.')
    if (mensalidade.associadoId !== associadoId) {
      throw new UnauthorizedException('Esta mensalidade não pertence ao seu perfil.')
    }

    const resultado = await this.emitirCobranca.execute(id)
    return {
      mensalidade: this.toMensalidadeResponse(resultado.mensalidade),
      linkPagamento: resultado.linkPagamento,
      pixCopiaECola: resultado.pixCopiaECola,
      pixQrCodeBase64: resultado.pixQrCodeBase64,
    }
  }

  @ApiOperation({ summary: 'Meus movimentos financeiros', description: 'Extrato de movimentos do associado logado — mensalidades, antecipações, rateios.' })
  @ApiResponse({ status: 200, description: 'Lista de movimentos.' })
  @Get('movimentos')
  async meusMovimentos(@Req() req: { user: JwtUser }) {
    const associadoId = await this.resolverAssociadoId(req.user.sub)
    const movimentos = await this.listarMovimentos.execute({ associadoId })
    return movimentos.map((m) => this.toMovimentoResponse(m))
  }

  @ApiOperation({ summary: 'Meu extrato PDF', description: 'Gera extrato completo (mensalidades + movimentos) do associado logado em PDF.' })
  @ApiQuery({ name: 'ano', required: false, type: Number, description: 'Ano (padrão: atual)' })
  @ApiResponse({ status: 200, description: 'PDF do extrato.' })
  @Get('extrato')
  async meuExtrato(@Req() req: { user: JwtUser }, @Query('ano') ano?: string, @Res() res: FastifyReply) {
    const associadoId = await this.resolverAssociadoId(req.user.sub)
    const anoNum = ano ? Number(ano) : new Date().getFullYear()

    const [mensalidades, movimentos] = await Promise.all([
      this.listarMensalidades.execute(associadoId),
      this.listarMovimentos.execute({ associadoId }),
    ])

    const mensalidadesAno = mensalidades.filter(m => m.competenciaAno === anoNum)
    const movimentosAno = movimentos.filter(m => m.data.getFullYear() === anoNum)

    const buf = await this.relatorioService.gerarPdfExtratoAssociado(associadoId, mensalidadesAno, movimentosAno, anoNum)
    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="meu-extrato-${anoNum}.pdf"`)
    return res.send(buf)
  }

  private async resolverAssociadoId(usuarioId: string): Promise<string> {
    const associado = await this.associadoRepo.findByUsuarioId(usuarioId)
    if (!associado) throw new NotFoundException('Perfil de associado não encontrado.')
    return associado.id
  }

  private toMensalidadeResponse(m: Mensalidade) {
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

  private toMovimentoResponse(m: MovimentoFinanceiro) {
    return {
      id: m.id,
      associadoId: m.associadoId,
      campanhaId: m.campanhaId,
      valor: m.valor,
      tipo: m.tipo,
      descricao: m.descricao,
      data: m.data,
    }
  }
}
