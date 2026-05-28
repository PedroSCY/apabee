import { Controller, Get, HttpCode, Inject, Param, Patch, Query, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import {
  IListarNotificacoesUseCase,
  IContarNaoLidasUseCase,
  IMarcarLidaUseCase,
  IMarcarTodasLidasUseCase,
  Notificacao,
} from '@apa/core'
import {
  LISTAR_NOTIFICACOES_USE_CASE,
  CONTAR_NAO_LIDAS_USE_CASE,
  MARCAR_LIDA_USE_CASE,
  MARCAR_TODAS_LIDAS_USE_CASE,
} from '../../../notificacao.tokens'
import { ContarNaoLidasResponse, NotificacaoResponse } from './dto/response.types'

type JwtUser = { sub: string; role: string }

@ApiTags('Notificações')
@ApiBearerAuth('JWT')
@Controller('notificacoes')
@Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
export class NotificacoesController {
  constructor(
    @Inject(LISTAR_NOTIFICACOES_USE_CASE)
    private readonly listar: IListarNotificacoesUseCase,
    @Inject(CONTAR_NAO_LIDAS_USE_CASE)
    private readonly contar: IContarNaoLidasUseCase,
    @Inject(MARCAR_LIDA_USE_CASE)
    private readonly marcarLida: IMarcarLidaUseCase,
    @Inject(MARCAR_TODAS_LIDAS_USE_CASE)
    private readonly marcarTodas: IMarcarTodasLidasUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  @Get()
  async listar_(@Req() req: { user: JwtUser }, @Query('limit') limit?: string): Promise<NotificacaoResponse[]> {
    const notificacoes = await this.listar.execute(req.user.sub, limit ? Number(limit) : 50)
    return notificacoes.map(n => this.toResponse(n))
  }

  @ApiOperation({ summary: 'Contagem de notificações não lidas' })
  @ApiResponse({ status: 200 })
  @Get('nao-lidas/count')
  async contarNaoLidas(@Req() req: { user: JwtUser }): Promise<ContarNaoLidasResponse> {
    const count = await this.contar.execute(req.user.sub)
    return { count }
  }

  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 204 })
  @Patch('marcar-todas-lidas')
  @HttpCode(204)
  async marcarTodasLidas_(@Req() req: { user: JwtUser }) {
    await this.marcarTodas.execute(req.user.sub)
  }

  @ApiOperation({ summary: 'Marcar uma notificação como lida' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada.' })
  @Patch(':id/lida')
  @HttpCode(200)
  async marcarLida_(@Req() req: { user: JwtUser }, @Param('id') id: string): Promise<NotificacaoResponse | null> {
    const notificacao = await this.marcarLida.execute(id, req.user.sub)
    if (!notificacao) return null
    return this.toResponse(notificacao)
  }

  private toResponse(n: Notificacao): NotificacaoResponse {
    return {
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      corpo: n.corpo,
      dadosExtras: n.dadosExtras,
      lida: n.lida,
      criadoEm: n.criadoEm,
    }
  }
}
