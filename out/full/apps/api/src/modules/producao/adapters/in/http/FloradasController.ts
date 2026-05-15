import { Body, Controller, Get, Inject, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import { Florada, ICriarFloradaUseCase, IListarFlораdasUseCase } from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarFloradaDto } from './dto'
import { CRIAR_FLORADA_USE_CASE, LISTAR_FLORADAS_USE_CASE } from '../../../producao.tokens'

@ApiTags('Produção — Floradas')
@ApiBearerAuth('JWT')
@Controller('producao/floradas')
export class FloradasController {
  constructor(
    @Inject(CRIAR_FLORADA_USE_CASE) private readonly criar: ICriarFloradaUseCase,
    @Inject(LISTAR_FLORADAS_USE_CASE) private readonly listar: IListarFlораdasUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar florada' })
  @ApiResponse({ status: 201 })
  @Roles(RoleUsuario.ADMIN)
  @Post()
  async criar_(@Body() dto: CriarFloradaDto) {
    return this.toResponse(await this.criar.execute(dto))
  }

  @ApiOperation({ summary: 'Listar floradas' })
  @Get()
  async listar_() {
    const lista = await this.listar.execute()
    return lista.map(f => this.toResponse(f))
  }

  private toResponse(f: Florada) {
    return { id: f.id, nome: f.nome, descricao: f.descricao, ativa: f.ativa, criadoEm: f.criadoEm }
  }
}
