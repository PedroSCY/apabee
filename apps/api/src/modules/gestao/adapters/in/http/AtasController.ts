import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import {
  ICriarAtaUseCase,
  IListarAtasUseCase,
  IPublicarAtaUseCase,
  IDespublicarAtaUseCase,
  IAdicionarParticipanteUseCase,
  IRemoverParticipanteUseCase,
  IListarParticipantesAtaUseCase,
} from '@apa/core'
import {
  CRIAR_ATA_USE_CASE,
  LISTAR_ATAS_USE_CASE,
  PUBLICAR_ATA_USE_CASE,
  DESPUBLICAR_ATA_USE_CASE,
  ADICIONAR_PARTICIPANTE_USE_CASE,
  REMOVER_PARTICIPANTE_USE_CASE,
  LISTAR_PARTICIPANTES_ATA_USE_CASE,
} from '../../../gestao.tokens'
import { CriarAtaDto, AdicionarParticipanteDto } from './dto/CriarAtaDto'

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

  @Post()
  @Roles(RoleUsuario.ADMIN)
  async criar(@Body() dto: CriarAtaDto, @Request() req: { user: { sub: string } }) {
    return this.criarAta.execute({
      titulo: dto.titulo,
      conteudo: dto.conteudo,
      autorId: req.user.sub,
      dataReuniao: new Date(dto.dataReuniao),
      publicada: dto.publicada,
      participantesIds: dto.participantesIds,
    })
  }

  @Get()
  async listar(@Request() req: { user: { role: string } }) {
    const apenasPublicadas = req.user.role !== RoleUsuario.ADMIN
    return this.listarAtas.execute(apenasPublicadas)
  }

  @Patch(':id/publicar')
  @Roles(RoleUsuario.ADMIN)
  async publicar(@Param('id') id: string) {
    return this.publicarAta.execute(id)
  }

  @Patch(':id/despublicar')
  @Roles(RoleUsuario.ADMIN)
  async despublicar(@Param('id') id: string) {
    return this.despublicarAta.execute(id)
  }

  @Get(':id/participantes')
  async listarParticipantesAta(@Param('id') id: string) {
    return this.listarParticipantes.execute(id)
  }

  @Post(':id/participantes')
  @Roles(RoleUsuario.ADMIN)
  async adicionarParticipanteAta(
    @Param('id') ataId: string,
    @Body() dto: AdicionarParticipanteDto,
  ) {
    return this.adicionarParticipante.execute(ataId, dto.associadoId)
  }

  @Delete(':ataId/participantes/:participanteId')
  @Roles(RoleUsuario.ADMIN)
  async removerParticipanteAta(@Param('participanteId') participanteId: string) {
    return this.removerParticipante.execute(participanteId)
  }
}
