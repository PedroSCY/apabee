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
  IBuscarPedidoUseCase,
  ICancelarPedidoUseCase,
  IConfirmarPedidoUseCase,
  ICriarPedidoUseCase,
  IListarPedidosUseCase,
  IMarcarEnviadoUseCase,
  ItemPedido,
  Pedido,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarPedidoDto } from './dto'
import {
  BUSCAR_PEDIDO_USE_CASE,
  CANCELAR_PEDIDO_USE_CASE,
  CONFIRMAR_PEDIDO_USE_CASE,
  CRIAR_PEDIDO_USE_CASE,
  LISTAR_PEDIDOS_USE_CASE,
  MARCAR_ENVIADO_USE_CASE,
} from '../../../comercial.tokens'

@ApiTags('Comercial - Pedidos')
@ApiBearerAuth('JWT')
@Controller('comercial/pedidos')
export class PedidosController {
  constructor(
    @Inject(CRIAR_PEDIDO_USE_CASE) private readonly criar: ICriarPedidoUseCase,
    @Inject(LISTAR_PEDIDOS_USE_CASE) private readonly listar: IListarPedidosUseCase,
    @Inject(BUSCAR_PEDIDO_USE_CASE) private readonly buscar: IBuscarPedidoUseCase,
    @Inject(CONFIRMAR_PEDIDO_USE_CASE) private readonly confirmar: IConfirmarPedidoUseCase,
    @Inject(CANCELAR_PEDIDO_USE_CASE) private readonly cancelar: ICancelarPedidoUseCase,
    @Inject(MARCAR_ENVIADO_USE_CASE) private readonly marcarEnviado: IMarcarEnviadoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar pedido (público — loja)' })
  @ApiResponse({ status: 201, description: 'Pedido criado.' })
  @Post()
  async criarHandler(@Body() dto: CriarPedidoDto) {
    const pedido = await this.criar.execute(dto)
    return this.toResponse(pedido)
  }

  @ApiOperation({ summary: 'Listar pedidos (ADMIN)' })
  @Get()
  @Roles(RoleUsuario.ADMIN)
  async listarHandler() {
    const lista = await this.listar.execute()
    return lista.map((p) => this.toResponse(p))
  }

  @ApiOperation({ summary: 'Buscar pedido por ID (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @Get(':id')
  @Roles(RoleUsuario.ADMIN)
  async buscarHandler(@Param('id') id: string) {
    const pedido = await this.buscar.execute(id)
    return this.toResponse(pedido)
  }

  @ApiOperation({ summary: 'Confirmar pedido — RN04 (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @Patch(':id/confirmar')
  @Roles(RoleUsuario.ADMIN)
  async confirmarHandler(@Param('id') id: string) {
    const pedido = await this.confirmar.execute(id)
    return this.toResponse(pedido)
  }

  @ApiOperation({ summary: 'Cancelar pedido (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @ApiNoContentResponse()
  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleUsuario.ADMIN)
  async cancelarHandler(@Param('id') id: string) {
    await this.cancelar.execute(id)
  }

  @ApiOperation({ summary: 'Marcar pedido como enviado (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @Patch(':id/marcar-enviado')
  @Roles(RoleUsuario.ADMIN)
  async marcarEnviadoHandler(@Param('id') id: string) {
    const pedido = await this.marcarEnviado.execute(id)
    return this.toResponse(pedido)
  }

  private toResponse(p: Pedido) {
    return {
      id: p.id,
      clienteNome: p.clienteNome,
      clienteEmail: p.clienteEmail,
      clienteTelefone: p.clienteTelefone,
      status: p.status,
      total: p.calcularTotal(),
      criadoEm: p.criadoEm,
      itens: p.itens.map((i: ItemPedido) => ({
        id: i.id,
        produtoId: i.produtoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        subtotal: i.subtotal(),
      })),
    }
  }
}
