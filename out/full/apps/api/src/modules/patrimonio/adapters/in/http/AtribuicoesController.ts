import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
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
  AtribuicaoPatrimonio,
  IAtribuirPatrimonioUseCase,
  IDevolverPatrimonioUseCase,
  IListarAtribuicoesPorAssociadoUseCase,
  IListarTodasAtribuicoesUseCase,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtribuirPatrimonioDto } from './dto'
import {
  ATRIBUIR_PATRIMONIO_USE_CASE,
  DEVOLVER_PATRIMONIO_USE_CASE,
  LISTAR_ATRIBUICOES_ASSOCIADO_USE_CASE,
  LISTAR_TODAS_ATRIBUICOES_USE_CASE,
} from '../../../patrimonio.tokens'

@ApiTags('Patrimônio — Atribuições')
@ApiBearerAuth('JWT')
@Controller('patrimonio/atribuicoes')
@Roles(RoleUsuario.ADMIN)
export class AtribuicoesController {
  constructor(
    @Inject(ATRIBUIR_PATRIMONIO_USE_CASE)
    private readonly atribuirPatrimonio: IAtribuirPatrimonioUseCase,
    @Inject(DEVOLVER_PATRIMONIO_USE_CASE)
    private readonly devolverPatrimonio: IDevolverPatrimonioUseCase,
    @Inject(LISTAR_ATRIBUICOES_ASSOCIADO_USE_CASE)
    private readonly listarAtribuicoes: IListarAtribuicoesPorAssociadoUseCase,
    @Inject(LISTAR_TODAS_ATRIBUICOES_USE_CASE)
    private readonly listarTodasAtribuicoes: IListarTodasAtribuicoesUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todas as atribuições (admin)' })
  @ApiResponse({ status: 200, description: 'Lista completa de atribuições.' })
  @Get()
  async listarTodas() {
    const lista = await this.listarTodasAtribuicoes.execute()
    return lista.map((a) => this.toResponse(a))
  }

  @ApiOperation({ summary: 'Atribuir equipamento ou insumo a um associado' })
  @ApiResponse({ status: 201, description: 'Atribuição criada.' })
  @ApiResponse({ status: 400, description: 'Patrimônio indisponível ou já atribuído (RN02).' })
  @Post()
  async atribuir(@Body() dto: AtribuirPatrimonioDto) {
    const atribuicao = await this.atribuirPatrimonio.execute({
      ...dto,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
    })
    return this.toResponse(atribuicao)
  }

  @ApiOperation({ summary: 'Devolver patrimônio (encerrar atribuição)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Devolução registrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':id/devolver')
  async devolver(@Param('id') id: string): Promise<void> {
    await this.devolverPatrimonio.execute(id)
  }

  @ApiOperation({ summary: 'Listar atribuições de um associado' })
  @ApiParam({ name: 'associadoId', type: String })
  @ApiResponse({ status: 200, description: 'Lista de atribuições.' })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get('associado/:associadoId')
  async listarPorAssociado(@Param('associadoId') associadoId: string) {
    const lista = await this.listarAtribuicoes.execute(associadoId)
    return lista.map((a) => this.toResponse(a))
  }

  private toResponse(a: AtribuicaoPatrimonio) {
    return {
      id: a.id,
      patrimonioId: a.patrimonioId,
      tipoPatrimonio: a.tipoPatrimonio,
      associadoId: a.associadoId,
      dataInicio: a.dataInicio,
      dataFim: a.dataFim,
      status: a.status,
      observacao: a.observacao,
    }
  }
}
