import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IAtualizarSafraUseCase,
  IBuscarPrecoVigenteUseCase,
  IBuscarSafraUseCase,
  ICriarSafraUseCase,
  IDefinirPrecoSafraUseCase,
  IEncerrarSafraUseCase,
  IIniciarSafraUseCase,
  IListarPrecosSafraUseCase,
  IListarSafrasUseCase,
  PrecoSafra,
  Safra,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtualizarSafraDto, CriarSafraDto, DefinirPrecoSafraDto } from './dto'
import {
  ATUALIZAR_SAFRA_USE_CASE,
  BUSCAR_PRECO_VIGENTE_USE_CASE,
  BUSCAR_SAFRA_USE_CASE,
  CRIAR_SAFRA_USE_CASE,
  DEFINIR_PRECO_SAFRA_USE_CASE,
  ENCERRAR_SAFRA_USE_CASE,
  INICIAR_SAFRA_USE_CASE,
  LISTAR_PRECOS_SAFRA_USE_CASE,
  LISTAR_SAFRAS_USE_CASE,
} from '../../../producao.tokens'

@ApiTags('Produção — Safras')
@ApiBearerAuth('JWT')
@Controller('producao/safras')
export class SafrasController {
  constructor(
    @Inject(CRIAR_SAFRA_USE_CASE) private readonly criar: ICriarSafraUseCase,
    @Inject(LISTAR_SAFRAS_USE_CASE) private readonly listar: IListarSafrasUseCase,
    @Inject(BUSCAR_SAFRA_USE_CASE) private readonly buscar: IBuscarSafraUseCase,
    @Inject(ATUALIZAR_SAFRA_USE_CASE) private readonly atualizar: IAtualizarSafraUseCase,
    @Inject(INICIAR_SAFRA_USE_CASE) private readonly iniciar: IIniciarSafraUseCase,
    @Inject(ENCERRAR_SAFRA_USE_CASE) private readonly encerrar: IEncerrarSafraUseCase,
    @Inject(DEFINIR_PRECO_SAFRA_USE_CASE) private readonly definirPreco: IDefinirPrecoSafraUseCase,
    @Inject(LISTAR_PRECOS_SAFRA_USE_CASE) private readonly listarPrecosUseCase: IListarPrecosSafraUseCase,
    @Inject(BUSCAR_PRECO_VIGENTE_USE_CASE) private readonly buscarPrecoUseCase: IBuscarPrecoVigenteUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar safra' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criar_(@Body() dto: CriarSafraDto) {
    return this.toResponse(
      await this.criar.execute({
        nome: dto.nome,
        floradaId: dto.floradaId,
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      }),
    )
  }

  @ApiOperation({ summary: 'Listar safras' })
  @Get()
  async listar_() {
    const lista = await this.listar.execute()
    return lista.map(s => this.toResponse(s))
  }

  @ApiOperation({ summary: 'Buscar safra por ID' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async buscar_(@Param('id') id: string) {
    return this.toResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Atualizar dados da safra (nome, dataFim)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async atualizar_(@Param('id') id: string, @Body() dto: AtualizarSafraDto) {
    return this.toResponse(
      await this.atualizar.execute(id, {
        nome: dto.nome,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
      }),
    )
  }

  @ApiOperation({ summary: 'Iniciar safra (PLANEJADA → EM_ANDAMENTO)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/iniciar')
  async iniciar_(@Param('id') id: string) {
    return this.toResponse(await this.iniciar.execute(id))
  }

  @ApiOperation({ summary: 'Encerrar safra (EM_ANDAMENTO → ENCERRADA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/encerrar')
  async encerrar_(@Param('id') id: string) {
    return this.toResponse(await this.encerrar.execute(id))
  }

  @ApiOperation({ summary: 'Listar preços de matéria-prima da safra' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id/precos')
  async listarPrecos(@Param('id') safraId: string) {
    const lista = await this.listarPrecosUseCase.execute(safraId)
    return lista.map(p => this.toPrecoResponse(p))
  }

  @ApiOperation({ summary: 'Definir/atualizar preço de tipo de matéria-prima para a safra (RN28)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @Post(':id/precos')
  async definirPreco_(@Param('id') safraId: string, @Body() dto: DefinirPrecoSafraDto) {
    return this.toPrecoResponse(await this.definirPreco.execute({ ...dto, safraId }))
  }

  @ApiOperation({ summary: 'Buscar preço vigente de tipo de matéria-prima (safra ou fallback global)' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'tipoMateriaPrimaId', type: String })
  @Get(':id/precos/vigente')
  async buscarPreco_(
    @Param('id') safraId: string,
    @Query('tipoMateriaPrimaId') tipoMateriaPrimaId: string,
  ) {
    const preco = await this.buscarPrecoUseCase.execute(tipoMateriaPrimaId, safraId)
    return { preco }
  }

  private toResponse(s: Safra) {
    return { id: s.id, nome: s.nome, floradaId: s.floradaId, floradaNome: s.floradaNome, dataInicio: s.dataInicio, dataFim: s.dataFim, status: s.status }
  }

  private toPrecoResponse(p: PrecoSafra) {
    return { id: p.id, tipoMateriaPrimaId: p.tipoMateriaPrimaId, safraId: p.safraId, preco: p.preco }
  }
}
