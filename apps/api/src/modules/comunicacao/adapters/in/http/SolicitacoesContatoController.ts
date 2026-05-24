import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { RoleUsuario, TipoSolicitacaoContato, StatusSolicitacaoContato } from '@apa/shared'
import {
  IAtualizarStatusSolicitacaoContatoUseCase,
  ICriarSolicitacaoContatoUseCase,
  IExcluirSolicitacaoContatoUseCase,
  IListarSolicitacoesContatoUseCase,
  SolicitacaoContato,
} from '@apa/core'
import { Public, Roles } from '../../../../../shared/guards'
import {
  ATUALIZAR_STATUS_SOLICITACAO_CONTATO_USE_CASE,
  CRIAR_SOLICITACAO_CONTATO_USE_CASE,
  EXCLUIR_SOLICITACAO_CONTATO_USE_CASE,
  LISTAR_SOLICITACOES_CONTATO_USE_CASE,
} from '../../../comunicacao.tokens'

class CriarSolicitacaoContatoDto {
  @IsEnum(TipoSolicitacaoContato) tipo!: TipoSolicitacaoContato
  @IsString() @MinLength(2) @MaxLength(100) nome!: string
  @IsEmail() email!: string
  @IsOptional() @IsString() @MaxLength(20) telefone?: string
  @IsString() @MinLength(10) @MaxLength(2000) mensagem!: string
  @IsOptional() @IsString() @MaxLength(200) localizacao?: string
  @IsOptional() @IsString() @MaxLength(100) municipio?: string
}

class AtualizarStatusDto {
  @IsEnum(StatusSolicitacaoContato) status!: StatusSolicitacaoContato
}

@ApiTags('Contato — Solicitações')
@ApiBearerAuth('JWT')
@Controller('contato/solicitacoes')
export class SolicitacoesContatoController {
  constructor(
    @Inject(CRIAR_SOLICITACAO_CONTATO_USE_CASE) private readonly criar: ICriarSolicitacaoContatoUseCase,
    @Inject(LISTAR_SOLICITACOES_CONTATO_USE_CASE) private readonly listar: IListarSolicitacoesContatoUseCase,
    @Inject(ATUALIZAR_STATUS_SOLICITACAO_CONTATO_USE_CASE) private readonly atualizarStatus: IAtualizarStatusSolicitacaoContatoUseCase,
    @Inject(EXCLUIR_SOLICITACAO_CONTATO_USE_CASE) private readonly excluir: IExcluirSolicitacaoContatoUseCase,
  ) {}

  @ApiOperation({ summary: 'Enviar solicitação de contato (público)', description: 'Não requer autenticação. Tipos: CONTATO (dúvidas gerais), COLETA (venda de mel), INTEGRACAO (solicitação de associação).' })
  @ApiResponse({ status: 201, description: 'Solicitação registrada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criarHandler(@Body() dto: CriarSolicitacaoContatoDto) {
    const s = await this.criar.execute(dto)
    return this.toResponse(s)
  }

  @ApiOperation({ summary: 'Listar solicitações de contato (ADMIN)', description: 'Filtrável por status. Inclui solicitações de associação (tipo INTEGRACAO).' })
  @ApiQuery({ name: 'status', enum: StatusSolicitacaoContato, enumName: 'StatusSolicitacaoContato', required: false })
  @ApiResponse({ status: 200, description: 'Lista de solicitações.' })
  @Roles(RoleUsuario.ADMIN)
  @Get()
  async listarHandler(@Query('status') status?: StatusSolicitacaoContato) {
    const lista = await this.listar.execute(status)
    return lista.map((s) => this.toResponse(s))
  }

  @ApiOperation({ summary: 'Atualizar status da solicitação (ADMIN)', description: 'Permite marcar como EM_ANALISE, RESPONDIDA ou ARQUIVADA.' })
  @ApiParam({ name: 'id', description: 'UUID da solicitação' })
  @ApiResponse({ status: 200, description: 'Status atualizado.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  @Roles(RoleUsuario.ADMIN)
  @Patch(':id/status')
  async atualizarStatusHandler(@Param('id') id: string, @Body() dto: AtualizarStatusDto) {
    const s = await this.atualizarStatus.execute(id, dto.status)
    return this.toResponse(s)
  }

  @ApiOperation({ summary: 'Excluir solicitação (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID da solicitação' })
  @ApiNoContentResponse({ description: 'Solicitação excluída.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  @Roles(RoleUsuario.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirHandler(@Param('id') id: string) {
    await this.excluir.execute(id)
  }

  private toResponse(s: SolicitacaoContato) {
    return {
      id: s.id,
      tipo: s.tipo,
      status: s.status,
      nome: s.nome,
      email: s.email,
      telefone: s.telefone,
      mensagem: s.mensagem,
      localizacao: s.localizacao,
      municipio: s.municipio,
      criadoEm: s.criadoEm,
    }
  }
}
