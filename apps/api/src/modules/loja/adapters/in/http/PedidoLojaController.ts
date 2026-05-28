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
  Query,
  Request,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario, StatusPedidoLoja, OpcaoEntrega } from '@apa/shared'
import { PedidoLoja } from '@apa/core'
import {
  AprovarCancelamentoPedidoLojaUseCase,
  AtualizarStatusPedidoLojaUseCase,
  CheckoutPedidoLojaUseCase,
  ListarPedidosClienteUseCase,
  ListarTodosPedidosLojaUseCase,
  ObterPedidoLojaUseCase,
  RejeitarCancelamentoPedidoLojaUseCase,
  RenovarPixPedidoLojaUseCase,
  SolicitarCancelamentoPedidoLojaUseCase,
} from '../../../application/use-cases'
import {
  APROVAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
  ATUALIZAR_STATUS_PEDIDO_LOJA_USE_CASE,
  CHECKOUT_PEDIDO_LOJA_USE_CASE,
  LISTAR_PEDIDOS_CLIENTE_USE_CASE,
  LISTAR_TODOS_PEDIDOS_LOJA_USE_CASE,
  OBTER_PEDIDO_LOJA_USE_CASE,
  REJEITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
  RENOVAR_PIX_PEDIDO_LOJA_USE_CASE,
  SOLICITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE,
} from '../../../loja.tokens'
import {
  CheckoutResponse,
  EnderecoEntregaSnapshotResponse,
  ItemPedidoLojaResponse,
  ListarPedidosResponse,
  PedidoLojaResponse,
} from './dto/response.types'

function mapPedido(p: PedidoLoja): PedidoLojaResponse {
  const enderecoEntrega: EnderecoEntregaSnapshotResponse | undefined = p.enderecoEntregaSnapshot
    ? {
        apelido: p.enderecoEntregaSnapshot.apelido,
        logradouro: p.enderecoEntregaSnapshot.logradouro,
        numero: p.enderecoEntregaSnapshot.numero,
        complemento: p.enderecoEntregaSnapshot.complemento,
        bairro: p.enderecoEntregaSnapshot.bairro,
        cidade: p.enderecoEntregaSnapshot.cidade,
        estado: p.enderecoEntregaSnapshot.estado,
        cep: p.enderecoEntregaSnapshot.cep,
      }
    : undefined

  return {
    id: p.id,
    clienteId: p.clienteId,
    status: p.status,
    opcaoEntrega: p.opcaoEntrega,
    enderecoEntregaId: p.enderecoEntregaId,
    enderecoEntrega,
    valorTotal: p.valorTotal,
    observacoes: p.observacoes,
    metodoPagamento: p.metodoPagamento,
    itens: p.itens.map(
      (item): ItemPedidoLojaResponse => ({
        id: item.id,
        pedidoLojaId: item.pedidoLojaId,
        produtoId: item.produtoId,
        nomeProduto: item.nomeProduto,
        precoUnitario: item.precoUnitario,
        quantidade: item.quantidade,
        campanhaCodigo: item.campanhaCodigo,
      }),
    ),
    cobrancaGatewayId: p.cobrancaGatewayId,
    pixCopiaECola: p.cobrancaPixCopiaECola,
    pixQrCodeBase64: p.cobrancaPixQrCodeBase64,
    cobrancaExpiracaoEm: p.cobrancaExpiracaoEm,
    cobrancaValorCobrado: p.cobrancaValorCobrado,
    cardInstallments: p.cardInstallments,
    cardPaymentMethodId: p.cardPaymentMethodId,
    criadoEm: p.criadoEm,
  }
}

@ApiTags('Loja — Pedidos')
@Controller()
export class PedidoLojaController {
  constructor(
    @Inject(CHECKOUT_PEDIDO_LOJA_USE_CASE)
    private readonly checkout: CheckoutPedidoLojaUseCase,
    @Inject(LISTAR_PEDIDOS_CLIENTE_USE_CASE)
    private readonly listarPedidosCliente: ListarPedidosClienteUseCase,
    @Inject(OBTER_PEDIDO_LOJA_USE_CASE)
    private readonly obterPedido: ObterPedidoLojaUseCase,
    @Inject(RENOVAR_PIX_PEDIDO_LOJA_USE_CASE)
    private readonly renovarPix: RenovarPixPedidoLojaUseCase,
    @Inject(SOLICITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE)
    private readonly solicitarCancelamento: SolicitarCancelamentoPedidoLojaUseCase,
    @Inject(LISTAR_TODOS_PEDIDOS_LOJA_USE_CASE)
    private readonly listarTodos: ListarTodosPedidosLojaUseCase,
    @Inject(ATUALIZAR_STATUS_PEDIDO_LOJA_USE_CASE)
    private readonly atualizarStatus: AtualizarStatusPedidoLojaUseCase,
    @Inject(APROVAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE)
    private readonly aprovarCancelamento: AprovarCancelamentoPedidoLojaUseCase,
    @Inject(REJEITAR_CANCELAMENTO_PEDIDO_LOJA_USE_CASE)
    private readonly rejeitarCancelamento: RejeitarCancelamentoPedidoLojaUseCase,
  ) {}

  @Roles(RoleUsuario.CLIENTE)
  @Post('loja/pedidos')
  async realizarCheckout(
    @Request() req: any,
    @Body() body: any,
  ): Promise<CheckoutResponse> {
    const result = await this.checkout.execute({ clienteId: req.user.sub, ...body })
    return {
      pedidoId: result.pedidoId,
      status: result.status,
      aprovado: result.aprovado,
      valorTotal: result.valorTotal,
      pixCopiaECola: result.pixCopiaECola,
      pixQrCodeBase64: result.pixQrCodeBase64,
      expiracaoEm: result.expiracaoEm,
      cardInstallments: result.cardInstallments,
      motivoRejeicao: result.motivoRejeicao,
    }
  }

  @Roles(RoleUsuario.CLIENTE)
  @Get('loja/pedidos/me')
  async listarMeus(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ListarPedidosResponse> {
    const result = await this.listarPedidosCliente.execute(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    )
    return {
      pedidos: result.pedidos.map(mapPedido),
      total: result.total,
      paginas: result.paginas,
    }
  }

  @Roles(RoleUsuario.CLIENTE)
  @Get('loja/pedidos/me/:id')
  async obterMeu(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<PedidoLojaResponse> {
    const pedido = await this.obterPedido.execute(id, req.user.sub)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Post('loja/pedidos/me/:id/renovar-pix')
  @HttpCode(HttpStatus.OK)
  async renovar(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<PedidoLojaResponse> {
    const pedido = await this.renovarPix.execute(id, req.user.sub)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Post('loja/pedidos/me/:id/cancelar')
  @HttpCode(HttpStatus.OK)
  async cancelar(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<PedidoLojaResponse> {
    const pedido = await this.solicitarCancelamento.execute(id, req.user.sub)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.ADMIN)
  @Get('loja/admin/pedidos')
  async listarAdmin(
    @Query('status') status?: string,
    @Query('opcaoEntrega') opcaoEntrega?: string,
    @Query('clienteEmail') clienteEmail?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ListarPedidosResponse> {
    const result = await this.listarTodos.execute({
      status: status as StatusPedidoLoja | undefined,
      opcaoEntrega: opcaoEntrega as OpcaoEntrega | undefined,
      clienteEmail,
      dataInicio: dataInicio ? new Date(dataInicio) : undefined,
      dataFim: dataFim ? new Date(dataFim) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    })
    return {
      pedidos: result.pedidos.map(mapPedido),
      total: result.total,
    }
  }

  @Roles(RoleUsuario.ADMIN)
  @Get('loja/admin/pedidos/:id')
  async obterAdmin(@Param('id') id: string): Promise<PedidoLojaResponse> {
    // isAdmin = true: ignora checagem de clienteId (admin pode ver qualquer pedido)
    const pedido = await this.obterPedido.execute(id, '', true)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.ADMIN)
  @Patch('loja/admin/pedidos/:id/status')
  async atualizarStatusAdmin(
    @Param('id') id: string,
    @Body() body: { status: string },
  ): Promise<PedidoLojaResponse> {
    const pedido = await this.atualizarStatus.execute(id, body.status as StatusPedidoLoja)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.ADMIN)
  @Post('loja/admin/pedidos/:id/aprovar-cancelamento')
  @HttpCode(HttpStatus.OK)
  async aprovarCancelamentoAdmin(@Param('id') id: string): Promise<PedidoLojaResponse> {
    const pedido = await this.aprovarCancelamento.execute(id)
    return mapPedido(pedido)
  }

  @Roles(RoleUsuario.ADMIN)
  @Post('loja/admin/pedidos/:id/rejeitar-cancelamento')
  @HttpCode(HttpStatus.OK)
  async rejeitarCancelamentoAdmin(
    @Param('id') id: string,
    @Body() body: { motivo?: string },
  ): Promise<PedidoLojaResponse> {
    const pedido = await this.rejeitarCancelamento.execute(id, body.motivo)
    return mapPedido(pedido)
  }
}
