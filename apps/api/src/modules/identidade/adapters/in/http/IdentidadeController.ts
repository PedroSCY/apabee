import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { RoleUsuario } from '@apa/shared'
import {
  Associado,
  IAtivarUsuarioUseCase,
  ICriarAssociadoUseCase,
  ICriarUsuarioUseCase,
  IDesativarUsuarioUseCase,
  IListarAssociadosUseCase,
  Usuario,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { CriarAssociadoDto, CriarUsuarioDto } from './dto'
import {
  ATIVAR_USUARIO_USE_CASE,
  CRIAR_ASSOCIADO_USE_CASE,
  CRIAR_USUARIO_USE_CASE,
  DESATIVAR_USUARIO_USE_CASE,
  LISTAR_ASSOCIADOS_USE_CASE,
} from '../../../identidade.tokens'

@Controller('identidade')
@Roles(RoleUsuario.ADMIN)
export class IdentidadeController {
  constructor(
    @Inject(CRIAR_USUARIO_USE_CASE)
    private readonly criarUsuario: ICriarUsuarioUseCase,
    @Inject(CRIAR_ASSOCIADO_USE_CASE)
    private readonly criarAssociado: ICriarAssociadoUseCase,
    @Inject(LISTAR_ASSOCIADOS_USE_CASE)
    private readonly listarAssociados: IListarAssociadosUseCase,
    @Inject(ATIVAR_USUARIO_USE_CASE)
    private readonly ativarUsuario: IAtivarUsuarioUseCase,
    @Inject(DESATIVAR_USUARIO_USE_CASE)
    private readonly desativarUsuario: IDesativarUsuarioUseCase,
  ) {}

  @Post('usuarios')
  @HttpCode(HttpStatus.CREATED)
  async criarUsuarioHandler(@Body() dto: CriarUsuarioDto) {
    const usuario = await this.criarUsuario.execute(dto)
    return this.toUsuarioResponse(usuario)
  }

  @Post('associados')
  @HttpCode(HttpStatus.CREATED)
  async criarAssociadoHandler(@Body() dto: CriarAssociadoDto) {
    const associado = await this.criarAssociado.execute({
      usuarioId: dto.usuarioId,
      dataIngresso: dto.dataIngresso ? new Date(dto.dataIngresso) : undefined,
      observacoes: dto.observacoes,
    })
    return this.toAssociadoResponse(associado)
  }

  @Get('associados')
  async listarAssociadosHandler() {
    const lista = await this.listarAssociados.execute()
    return lista.map((a) => this.toAssociadoResponse(a))
  }

  @Patch('usuarios/:id/ativar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ativarUsuarioHandler(@Param('id') id: string) {
    await this.ativarUsuario.execute({ usuarioId: id })
  }

  @Patch('usuarios/:id/desativar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desativarUsuarioHandler(@Param('id') id: string) {
    await this.desativarUsuario.execute({ usuarioId: id })
  }

  private toUsuarioResponse(u: Usuario) {
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      ativo: u.ativo,
      criadoEm: u.criadoEm,
    }
  }

  private toAssociadoResponse(a: Associado) {
    return {
      id: a.id,
      nome: a.nome,
      email: a.email,
      dataIngresso: a.dataIngresso,
      observacoes: a.observacoes,
    }
  }
}
