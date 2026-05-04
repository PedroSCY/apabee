import {
  Body, Controller, Get, HttpCode, HttpStatus,
  Inject, Param, Patch, Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IBuscarLoteUseCase,
  ICriarLoteUseCase,
  IEncerrarLoteUseCase,
  IListarLotesUseCase,
  IListarParticipacoesPorLoteUseCase,
  IRegistrarParticipacaoUseCase,
  IAtualizarParticipacaoUseCase,
  LoteProducao,
  ParticipacaoLote,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarLoteDto, RegistrarParticipacaoDto } from './dto'
import {
  ATUALIZAR_PARTICIPACAO_USE_CASE,
  BUSCAR_LOTE_USE_CASE,
  CRIAR_LOTE_USE_CASE,
  ENCERRAR_LOTE_USE_CASE,
  LISTAR_LOTES_USE_CASE,
  LISTAR_PARTICIPACOES_LOTE_USE_CASE,
  REGISTRAR_PARTICIPACAO_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Lotes')
@ApiBearerAuth('JWT')
@Controller('producao/lotes')
export class LotesController {
  constructor(
    @Inject(CRIAR_LOTE_USE_CASE) private readonly criar: ICriarLoteUseCase,
    @Inject(LISTAR_LOTES_USE_CASE) private readonly listar: IListarLotesUseCase,
    @Inject(BUSCAR_LOTE_USE_CASE) private readonly buscar: IBuscarLoteUseCase,
    @Inject(ENCERRAR_LOTE_USE_CASE) private readonly encerrar: IEncerrarLoteUseCase,
    @Inject(REGISTRAR_PARTICIPACAO_USE_CASE) private readonly registrarParticipacao: IRegistrarParticipacaoUseCase,
    @Inject(LISTAR_PARTICIPACOES_LOTE_USE_CASE) private readonly listarParticipacoes: IListarParticipacoesPorLoteUseCase,
    @Inject(ATUALIZAR_PARTICIPACAO_USE_CASE) private readonly atualizarParticipacao: IAtualizarParticipacaoUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar lote de produção' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  criarLote(@Body() dto: CriarLoteDto): Promise<LoteProducao> {
    return this.criar.execute({ ...dto, dataInicio: new Date(dto.dataInicio) })
  }

  @ApiOperation({ summary: 'Listar lotes' })
  @Get()
  listarLotes(): Promise<LoteProducao[]> {
    return this.listar.execute()
  }

  @ApiOperation({ summary: 'Buscar lote por ID' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  buscarLote(@Param('id') id: string): Promise<LoteProducao> {
    return this.buscar.execute(id)
  }

  @ApiOperation({ summary: 'Encerrar lote' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse({ description: 'Lote encerrado.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/encerrar')
  encerrarLote(@Param('id') id: string): Promise<LoteProducao> {
    return this.encerrar.execute(id)
  }

  @ApiOperation({ summary: 'Listar participações do lote' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/participacoes')
  listarParticipacoesDo(@Param('id') id: string): Promise<ParticipacaoLote[]> {
    return this.listarParticipacoes.execute(id)
  }

  @ApiOperation({ summary: 'Registrar participação de associado no lote' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/participacoes')
  registrar(@Param('id') loteId: string, @Body() dto: RegistrarParticipacaoDto): Promise<ParticipacaoLote> {
    return this.registrarParticipacao.execute({ ...dto, loteProducaoId: loteId })
  }

  @ApiOperation({ summary: 'Atualizar participação de associado no lote' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'associadoId', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Patch(':id/participacoes/:associadoId')
  atualizar(
    @Param('id') loteId: string,
    @Param('associadoId') associadoId: string,
    @Body() dto: RegistrarParticipacaoDto,
  ): Promise<ParticipacaoLote> {
    return this.atualizarParticipacao.execute(loteId, associadoId, dto)
  }
}
