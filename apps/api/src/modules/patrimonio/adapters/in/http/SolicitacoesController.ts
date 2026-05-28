import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { RoleUsuario, StatusSolicitacaoPatrimonio, TipoPatrimonio } from '@apa/shared'
import {
  IAprovarSolicitacaoUseCase,
  IBuscarAssociadoPorUsuarioUseCase,
  ICriarSolicitacaoUseCase,
  IListarSolicitacoesUseCase,
  IRejeitarSolicitacaoUseCase,
  SolicitacaoPatrimonio,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import {
  APROVAR_SOLICITACAO_USE_CASE,
  CRIAR_SOLICITACAO_USE_CASE,
  LISTAR_SOLICITACOES_USE_CASE,
  REJEITAR_SOLICITACAO_USE_CASE,
} from '../../../patrimonio.tokens'
import { BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE } from '../../../../identidade/identidade.tokens'
import { CriarSolicitacaoDto } from './dto'
import { SolicitacaoPatrimonioResponse } from './dto/response.types'

@ApiTags('Patrimônio — Solicitações')
@ApiBearerAuth('JWT')
@Controller('patrimonio/solicitacoes')
export class SolicitacoesController {
  constructor(
    @Inject(CRIAR_SOLICITACAO_USE_CASE) private readonly criar: ICriarSolicitacaoUseCase,
    @Inject(LISTAR_SOLICITACOES_USE_CASE) private readonly listar: IListarSolicitacoesUseCase,
    @Inject(APROVAR_SOLICITACAO_USE_CASE) private readonly aprovar: IAprovarSolicitacaoUseCase,
    @Inject(REJEITAR_SOLICITACAO_USE_CASE) private readonly rejeitar: IRejeitarSolicitacaoUseCase,
    @Inject(BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE)
    private readonly buscarAssociadoPorUsuario: IBuscarAssociadoPorUsuarioUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar solicitação de uso de patrimônio (associado)' })
  @Post()
  async criarHandler(
    @Body() dto: CriarSolicitacaoDto,
    @Request() req: { user: { sub: string; associadoId?: string } },
  ): Promise<SolicitacaoPatrimonioResponse> {
    const associadoId = await this.resolveAssociadoId(req.user)
    const input =
      dto.tipoPatrimonio === TipoPatrimonio.EQUIPAMENTO
        ? { tipoPatrimonio: TipoPatrimonio.EQUIPAMENTO as const, patrimonioId: dto.patrimonioId!, associadoId, justificativa: dto.justificativa }
        : { tipoPatrimonio: TipoPatrimonio.INSUMO as const, tipoInsumoId: dto.tipoInsumoId!, quantidade: dto.quantidade!, associadoId, justificativa: dto.justificativa }
    const s = await this.criar.execute(input)
    return this.toResponse(s)
  }

  @ApiOperation({ summary: 'Listar solicitações (admin: todas; associado: próprias)' })
  @ApiQuery({ name: 'status', enum: StatusSolicitacaoPatrimonio, enumName: 'StatusSolicitacaoPatrimonio', required: false })
  @Get()
  async listarHandler(
    @Query('status') status?: StatusSolicitacaoPatrimonio,
    @Request() req?: { user: { sub: string; role: string; associadoId?: string } },
  ): Promise<SolicitacaoPatrimonioResponse[]> {
    const user = req!.user
    if (user.role === RoleUsuario.ADMIN) {
      const lista = await this.listar.execute({ status })
      return lista.map((s) => this.toResponse(s))
    }
    const associadoId = await this.resolveAssociadoId(user)
    const lista = await this.listar.execute({ associadoId })
    return lista.map((s) => this.toResponse(s))
  }

  @ApiOperation({ summary: 'Aprovar solicitação (admin)' })
  @ApiNoContentResponse()
  @Patch(':id/aprovar')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleUsuario.ADMIN)
  async aprovarHandler(@Param('id') id: string): Promise<SolicitacaoPatrimonioResponse> {
    const s = await this.aprovar.execute(id)
    return this.toResponse(s)
  }

  @ApiOperation({ summary: 'Rejeitar solicitação (admin)' })
  @Patch(':id/rejeitar')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleUsuario.ADMIN)
  async rejeitarHandler(@Param('id') id: string): Promise<SolicitacaoPatrimonioResponse> {
    const s = await this.rejeitar.execute(id)
    return this.toResponse(s)
  }

  private async resolveAssociadoId(user: { sub: string; associadoId?: string }): Promise<string> {
    if (user.associadoId) return user.associadoId
    const associado = await this.buscarAssociadoPorUsuario.execute(user.sub)
    if (!associado) throw new ForbiddenException('Perfil de associado não encontrado.')
    return associado.id
  }

  private toResponse(s: SolicitacaoPatrimonio): SolicitacaoPatrimonioResponse {
    return {
      id: s.id,
      tipoPatrimonio: s.tipoPatrimonio,
      patrimonioId: s.patrimonioId,
      tipoInsumoId: s.tipoInsumoId,
      quantidade: s.quantidade,
      associadoId: s.associadoId,
      justificativa: s.justificativa,
      status: s.status,
      criadoEm: s.criadoEm,
      resolvidoEm: s.resolvidoEm,
    }
  }
}
