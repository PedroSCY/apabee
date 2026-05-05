import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import { IListarVendasUseCase, IRegistrarVendaUseCase, Venda } from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { RegistrarVendaDto } from './dto'
import { LISTAR_VENDAS_USE_CASE, REGISTRAR_VENDA_USE_CASE } from '../../../comercial.tokens'

@ApiTags('Comercial - Vendas')
@ApiBearerAuth('JWT')
@Controller('comercial/vendas')
export class VendasController {
  constructor(
    @Inject(REGISTRAR_VENDA_USE_CASE) private readonly registrar: IRegistrarVendaUseCase,
    @Inject(LISTAR_VENDAS_USE_CASE) private readonly listar: IListarVendasUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar venda de lote (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Venda registrada.' })
  @Post()
  @Roles(RoleUsuario.ADMIN)
  async registrarHandler(@Body() dto: RegistrarVendaDto) {
    const venda = await this.registrar.execute({
      ...dto,
      data: new Date(dto.data),
    })
    return this.toResponse(venda)
  }

  @ApiOperation({ summary: 'Listar vendas por lote ou associado (ADMIN)' })
  @ApiQuery({ name: 'loteId', required: false })
  @ApiQuery({ name: 'associadoId', required: false })
  @Get()
  @Roles(RoleUsuario.ADMIN)
  async listarHandler(
    @Query('loteId') loteId?: string,
    @Query('associadoId') associadoId?: string,
  ) {
    const lista = await this.listar.execute({ loteId, associadoId })
    return lista.map((v) => this.toResponse(v))
  }

  private toResponse(v: Venda) {
    return {
      id: v.id,
      loteProducaoId: v.loteProducaoId,
      associadoId: v.associadoId,
      tipo: v.tipo,
      volume: v.volume,
      valor: v.valor,
      data: v.data,
    }
  }
}
