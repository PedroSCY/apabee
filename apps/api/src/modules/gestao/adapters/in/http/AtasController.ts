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
  Request,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import {
  Ata,
  IAdicionarParticipanteUseCase,
  ICriarAtaUseCase,
  IDespublicarAtaUseCase,
  IListarAtasUseCase,
  IListarParticipantesAtaUseCase,
  IPublicarAtaUseCase,
  IRemoverParticipanteUseCase,
  ParticipanteAta,
} from '@apa/core'
import {
  ADICIONAR_PARTICIPANTE_USE_CASE,
  CRIAR_ATA_USE_CASE,
  DESPUBLICAR_ATA_USE_CASE,
  LISTAR_ATAS_USE_CASE,
  LISTAR_PARTICIPANTES_ATA_USE_CASE,
  PUBLICAR_ATA_USE_CASE,
  REMOVER_PARTICIPANTE_USE_CASE,
} from '../../../gestao.tokens'
import { CriarAtaDto, AdicionarParticipanteDto } from './dto/CriarAtaDto'

@ApiTags('Gestão — Atas')
@ApiBearerAuth('JWT')
@Controller('gestao/atas')
export class AtasController {
  constructor(
    @Inject(CRIAR_ATA_USE_CASE) private readonly criarAta: ICriarAtaUseCase,
    @Inject(LISTAR_ATAS_USE_CASE) private readonly listarAtas: IListarAtasUseCase,
    @Inject(PUBLICAR_ATA_USE_CASE) private readonly publicarAta: IPublicarAtaUseCase,
    @Inject(DESPUBLICAR_ATA_USE_CASE) private readonly despublicarAta: IDespublicarAtaUseCase,
    @Inject(ADICIONAR_PARTICIPANTE_USE_CASE) private readonly adicionarParticipante: IAdicionarParticipanteUseCase,
    @Inject(REMOVER_PARTICIPANTE_USE_CASE) private readonly removerParticipante: IRemoverParticipanteUseCase,
    @Inject(LISTAR_PARTICIPANTES_ATA_USE_CASE) private readonly listarParticipantes: IListarParticipantesAtaUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar ata de reunião (ADMIN)', description: 'Cria uma nova ata. Se publicada=true, disponibiliza imediatamente para os associados.' })
  @ApiResponse({ status: 201, description: 'Ata criada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão (requer ADMIN).' })
  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criar(@Body() dto: CriarAtaDto, @Request() req: { user: { sub: string } }) {
    const ata = await this.criarAta.execute({
      titulo: dto.titulo,
      conteudo: dto.conteudo,
      autorId: req.user.sub,
      dataReuniao: new Date(dto.dataReuniao),
      publicada: dto.publicada,
      participantesIds: dto.participantesIds,
    })
    return this.toAtaResponse(ata)
  }

  @ApiOperation({ summary: 'Listar atas', description: 'Admin vê todas as atas (publicadas e rascunhos). Associado vê apenas as publicadas.' })
  @ApiResponse({ status: 200, description: 'Lista de atas.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @Get()
  async listar(@Request() req: { user: { role: string } }) {
    const apenasPublicadas = req.user.role !== RoleUsuario.ADMIN
    const lista = await this.listarAtas.execute(apenasPublicadas)
    return lista.map((a) => this.toAtaResponse(a))
  }

  @ApiOperation({ summary: 'Publicar ata (ADMIN)', description: 'Torna a ata visível para todos os associados.' })
  @ApiParam({ name: 'id', description: 'UUID da ata' })
  @ApiResponse({ status: 200, description: 'Ata publicada.' })
  @ApiResponse({ status: 404, description: 'Ata não encontrada.' })
  @Patch(':id/publicar')
  @Roles(RoleUsuario.ADMIN)
  async publicar(@Param('id') id: string) {
    return this.toAtaResponse(await this.publicarAta.execute(id))
  }

  @ApiOperation({ summary: 'Despublicar ata (ADMIN)', description: 'Volta a ata para rascunho — deixa de ser visível para associados.' })
  @ApiParam({ name: 'id', description: 'UUID da ata' })
  @ApiResponse({ status: 200, description: 'Ata despublicada.' })
  @ApiResponse({ status: 404, description: 'Ata não encontrada.' })
  @Patch(':id/despublicar')
  @Roles(RoleUsuario.ADMIN)
  async despublicar(@Param('id') id: string) {
    return this.toAtaResponse(await this.despublicarAta.execute(id))
  }

  @ApiOperation({ summary: 'Listar participantes de uma ata' })
  @ApiParam({ name: 'id', description: 'UUID da ata' })
  @ApiResponse({ status: 200, description: 'Lista de participantes.' })
  @ApiResponse({ status: 404, description: 'Ata não encontrada.' })
  @Get(':id/participantes')
  async listarParticipantesAta(@Param('id') id: string) {
    const lista = await this.listarParticipantes.execute(id)
    return lista.map((p) => this.toParticipanteResponse(p))
  }

  @ApiOperation({ summary: 'Adicionar participante à ata (ADMIN)' })
  @ApiParam({ name: 'id', description: 'UUID da ata' })
  @ApiResponse({ status: 201, description: 'Participante adicionado.' })
  @ApiResponse({ status: 404, description: 'Ata ou associado não encontrado.' })
  @Post(':id/participantes')
  @Roles(RoleUsuario.ADMIN)
  async adicionarParticipanteAta(
    @Param('id') ataId: string,
    @Body() dto: AdicionarParticipanteDto,
  ) {
    return this.toParticipanteResponse(await this.adicionarParticipante.execute(ataId, dto.associadoId))
  }

  @ApiOperation({ summary: 'Remover participante da ata (ADMIN)' })
  @ApiParam({ name: 'ataId', description: 'UUID da ata' })
  @ApiParam({ name: 'participanteId', description: 'UUID do registro de participação' })
  @ApiNoContentResponse({ description: 'Participante removido.' })
  @ApiResponse({ status: 404, description: 'Participante não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':ataId/participantes/:participanteId')
  @Roles(RoleUsuario.ADMIN)
  async removerParticipanteAta(@Param('participanteId') participanteId: string) {
    await this.removerParticipante.execute(participanteId)
  }

  private toAtaResponse(a: Ata) {
    return {
      id: a.id,
      titulo: a.titulo,
      conteudo: a.conteudo,
      autorId: a.autorId,
      dataReuniao: a.dataReuniao,
      publicada: a.publicada,
      criadoEm: a.criadoEm,
    }
  }

  private toParticipanteResponse(p: ParticipanteAta) {
    return {
      id: p.id,
      ataId: p.ataId,
      associadoId: p.associadoId,
    }
  }
}
