import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  IAtualizarSafraUseCase,
  IBuscarSafraUseCase,
  ICriarSafraUseCase,
  IDeletarSafraUseCase,
  IEncerrarSafraUseCase,
  IIniciarSafraUseCase,
  IListarSafrasUseCase,
  Safra,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AtualizarSafraDto, CriarSafraDto } from './dto'
import { SafraResponse } from './dto/response.types'
import {
  ATUALIZAR_SAFRA_USE_CASE,
  BUSCAR_SAFRA_USE_CASE,
  CRIAR_SAFRA_USE_CASE,
  DELETAR_SAFRA_USE_CASE,
  ENCERRAR_SAFRA_USE_CASE,
  INICIAR_SAFRA_USE_CASE,
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
    @Inject(DELETAR_SAFRA_USE_CASE) private readonly deletar: IDeletarSafraUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar safra' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criar_(@Body() dto: CriarSafraDto): Promise<SafraResponse> {
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
  async listar_(): Promise<SafraResponse[]> {
    const lista = await this.listar.execute()
    return lista.map(s => this.toResponse(s))
  }

  @ApiOperation({ summary: 'Buscar safra por ID' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  async buscar_(@Param('id') id: string): Promise<SafraResponse> {
    return this.toResponse(await this.buscar.execute(id))
  }

  @ApiOperation({ summary: 'Atualizar dados da safra (nome, dataFim)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async atualizar_(@Param('id') id: string, @Body() dto: AtualizarSafraDto): Promise<SafraResponse> {
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
  async iniciar_(@Param('id') id: string): Promise<SafraResponse> {
    return this.toResponse(await this.iniciar.execute(id))
  }

  @ApiOperation({ summary: 'Encerrar safra (EM_ANDAMENTO → ENCERRADA)' })
  @ApiParam({ name: 'id', type: String })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/encerrar')
  async encerrar_(@Param('id') id: string): Promise<SafraResponse> {
    return this.toResponse(await this.encerrar.execute(id))
  }

  @ApiOperation({ summary: 'Excluir safra (apenas PLANEJADA, sem campanhas ou colheitas vinculadas)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Safra excluída.' })
  @Roles(RoleUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletar_(@Param('id') id: string) {
    await this.deletar.execute(id)
  }

  private toResponse(s: Safra): SafraResponse {
    return { id: s.id, nome: s.nome, floradaId: s.floradaId, floradaNome: s.floradaNome, dataInicio: s.dataInicio, dataFim: s.dataFim, status: s.status }
  }
}
