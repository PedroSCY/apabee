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
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtribuirPatrimonioDto } from './dto'
import {
  ATRIBUIR_PATRIMONIO_USE_CASE,
  DEVOLVER_PATRIMONIO_USE_CASE,
  LISTAR_ATRIBUICOES_ASSOCIADO_USE_CASE,
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
  ) {}

  @ApiOperation({ summary: 'Atribuir equipamento ou insumo a um associado' })
  @ApiResponse({ status: 201, description: 'Atribuição criada.' })
  @ApiResponse({ status: 400, description: 'Patrimônio indisponível ou já atribuído (RN02).' })
  @Post()
  async atribuir(@Body() dto: AtribuirPatrimonioDto): Promise<AtribuicaoPatrimonio> {
    return this.atribuirPatrimonio.execute({
      ...dto,
      dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
    })
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
  @Get('associado/:associadoId')
  async listarPorAssociado(
    @Param('associadoId') associadoId: string,
  ): Promise<AtribuicaoPatrimonio[]> {
    return this.listarAtribuicoes.execute(associadoId)
  }
}
