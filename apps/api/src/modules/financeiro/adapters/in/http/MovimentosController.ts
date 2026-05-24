import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import { IListarMovimentosUseCase, MovimentoFinanceiro } from '@apa/core'
import { LISTAR_MOVIMENTOS_USE_CASE } from '../../../financeiro.tokens'

@ApiTags('Financeiro — Movimentos')
@ApiBearerAuth('JWT')
@Controller('financeiro/movimentos')
@Roles(RoleUsuario.ADMIN)
export class MovimentosController {
  constructor(
    @Inject(LISTAR_MOVIMENTOS_USE_CASE)
    private readonly listar: IListarMovimentosUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar movimentos financeiros (ADMIN)', description: 'Extrato geral de movimentos — mensalidades, antecipações, rateios. Filtrável por associado ou campanha.' })
  @ApiQuery({ name: 'associadoId', required: false, type: String })
  @ApiQuery({ name: 'campanhaId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de registros (padrão: 200)' })
  @ApiResponse({ status: 200, description: 'Lista de movimentos.' })
  @Get()
  async listar_(
    @Query('associadoId') associadoId?: string,
    @Query('campanhaId') campanhaId?: string,
    @Query('limit') limit?: string,
  ) {
    const movimentos = await this.listar.execute({
      associadoId,
      campanhaId,
      limit: limit ? Number(limit) : 200,
    })
    return movimentos.map((m) => this.toResponse(m))
  }

  private toResponse(m: MovimentoFinanceiro) {
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
