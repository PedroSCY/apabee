import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { RoleUsuario } from '@apa/shared'
import {
  Associado,
  IAprovarAssociadoPendenteUseCase,
  IAtivarUsuarioUseCase,
  IBuscarAssociadoUseCase,
  IBuscarAssociadoPorUsuarioUseCase,
  ICriarAssociadoUseCase,
  ICriarAssociadoPendenteUseCase,
  ICriarUsuarioUseCase,
  IDesativarUsuarioUseCase,
  IExcluirAssociadoUseCase,
  IListarAssociadosUseCase,
  IAtualizarAssociadoUseCase,
  IAtualizarUsuarioUseCase,
  Usuario,
} from '@apa/core'
import { Roles } from '../../../../../shared/guards'
import { AprovarAssociadoPendenteDto, AtualizarAssociadoDto, AtualizarSenhaDto, AtualizarUsuarioDto, CriarAssociadoDto, CriarAssociadoPendenteDto, CriarUsuarioDto } from './dto'
import { AtualizarSenhaUseCase } from '../../../application/use-cases'
import {
  APROVAR_ASSOCIADO_PENDENTE_USE_CASE,
  ATIVAR_USUARIO_USE_CASE,
  ATUALIZAR_ASSOCIADO_USE_CASE,
  ATUALIZAR_SENHA_USE_CASE,
  ATUALIZAR_USUARIO_USE_CASE,
  BUSCAR_ASSOCIADO_USE_CASE,
  BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE,
  CRIAR_ASSOCIADO_USE_CASE,
  CRIAR_ASSOCIADO_PENDENTE_USE_CASE,
  CRIAR_USUARIO_USE_CASE,
  DESATIVAR_USUARIO_USE_CASE,
  EXCLUIR_ASSOCIADO_USE_CASE,
  LISTAR_ASSOCIADOS_USE_CASE,
} from '../../../identidade.tokens'

@ApiTags('Identidade')
@ApiBearerAuth('JWT')
@Controller('identidade')
@Roles(RoleUsuario.ADMIN)
export class IdentidadeController {
  constructor(
    @Inject(CRIAR_USUARIO_USE_CASE)
    private readonly criarUsuario: ICriarUsuarioUseCase,
    @Inject(CRIAR_ASSOCIADO_USE_CASE)
    private readonly criarAssociado: ICriarAssociadoUseCase,
    @Inject(CRIAR_ASSOCIADO_PENDENTE_USE_CASE)
    private readonly criarAssociadoPendente: ICriarAssociadoPendenteUseCase,
    @Inject(APROVAR_ASSOCIADO_PENDENTE_USE_CASE)
    private readonly aprovarAssociadoPendente: IAprovarAssociadoPendenteUseCase,
    @Inject(LISTAR_ASSOCIADOS_USE_CASE)
    private readonly listarAssociados: IListarAssociadosUseCase,
    @Inject(BUSCAR_ASSOCIADO_USE_CASE)
    private readonly buscarAssociado: IBuscarAssociadoUseCase,
    @Inject(ATIVAR_USUARIO_USE_CASE)
    private readonly ativarUsuario: IAtivarUsuarioUseCase,
    @Inject(DESATIVAR_USUARIO_USE_CASE)
    private readonly desativarUsuario: IDesativarUsuarioUseCase,
    @Inject(ATUALIZAR_ASSOCIADO_USE_CASE)
    private readonly atualizarAssociado: IAtualizarAssociadoUseCase,
    @Inject(ATUALIZAR_USUARIO_USE_CASE)
    private readonly atualizarUsuario: IAtualizarUsuarioUseCase,
    @Inject(ATUALIZAR_SENHA_USE_CASE)
    private readonly atualizarSenha: AtualizarSenhaUseCase,
    @Inject(EXCLUIR_ASSOCIADO_USE_CASE)
    private readonly excluirAssociado: IExcluirAssociadoUseCase,
    @Inject(BUSCAR_ASSOCIADO_POR_USUARIO_USE_CASE)
    private readonly buscarAssociadoPorUsuario: IBuscarAssociadoPorUsuarioUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar usuário', description: 'Cria o usuário no banco e a credencial no Supabase Auth.' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão (requer ADMIN).' })
  @Post('usuarios')
  @HttpCode(HttpStatus.CREATED)
  async criarUsuarioHandler(@Body() dto: CriarUsuarioDto) {
    const usuario = await this.criarUsuario.execute(dto)
    return this.toUsuarioResponse(usuario)
  }

  @ApiOperation({ summary: 'Solicitar associação (pendente)', description: 'Cria um usuário sem senha e um Associado com status PENDENTE. Acesso liberado somente após aprovação.' })
  @ApiResponse({ status: 201, description: 'Solicitação registrada. Associado aguarda aprovação.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @Post('associados/pendentes')
  @HttpCode(HttpStatus.CREATED)
  async criarAssociadoPendenteHandler(@Body() dto: CriarAssociadoPendenteDto) {
    const associado = await this.criarAssociadoPendente.execute({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      observacoes: dto.observacoes,
    })
    return this.toAssociadoResponse(associado)
  }

  @ApiOperation({ summary: 'Aprovar associado pendente', description: 'Define a senha, libera o acesso no Supabase e ativa o Associado.' })
  @ApiParam({ name: 'id', description: 'UUID do associado pendente' })
  @ApiResponse({ status: 200, description: 'Associado aprovado e ativado.' })
  @ApiResponse({ status: 400, description: 'Associado não está com status PENDENTE.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado.' })
  @Post('associados/:id/aprovar')
  async aprovarAssociadoPendenteHandler(@Param('id') id: string, @Body() dto: AprovarAssociadoPendenteDto) {
    const associado = await this.aprovarAssociadoPendente.execute({
      associadoId: id,
      senha: dto.senha,
      dataIngresso: dto.dataIngresso ? new Date(dto.dataIngresso) : undefined,
    })
    return this.toAssociadoResponse(associado)
  }

  @ApiOperation({ summary: 'Vincular associado', description: 'Vincula um usuário existente como associado da APA.' })
  @ApiResponse({ status: 201, description: 'Associado criado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 409, description: 'Usuário já é associado.' })
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

  @ApiOperation({ summary: 'Perfil do usuário logado (ASSOCIADO e ADMIN)' })
  @ApiResponse({ status: 200, description: 'Perfil do associado logado.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado para este usuário.' })
  @Roles(RoleUsuario.ADMIN, RoleUsuario.ASSOCIADO)
  @Get('me')
  async meuPerfilHandler(@Req() req: { user: { sub: string } }) {
    const associado = await this.buscarAssociadoPorUsuario.execute(req.user.sub)
    if (!associado) throw new NotFoundException('Perfil de associado não encontrado.')
    return this.toAssociadoResponse(associado)
  }

  @ApiOperation({ summary: 'Listar associados', description: 'Retorna todos os associados com dados do usuário vinculado.' })
  @ApiResponse({ status: 200, description: 'Lista de associados.' })
  @Get('associados')
  async listarAssociadosHandler() {
    const lista = await this.listarAssociados.execute()
    return lista.map((a) => this.toAssociadoResponse(a))
  }

  @ApiOperation({ summary: 'Ativar usuário', description: 'Remove o ban no Supabase Auth e marca o usuário como ativo.' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiNoContentResponse({ description: 'Usuário ativado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Patch('usuarios/:id/ativar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async ativarUsuarioHandler(@Param('id') id: string) {
    await this.ativarUsuario.execute({ usuarioId: id })
  }

  @ApiOperation({ summary: 'Desativar usuário', description: 'Aplica ban permanente no Supabase Auth e marca o usuário como inativo.' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiNoContentResponse({ description: 'Usuário desativado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Patch('usuarios/:id/desativar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async desativarUsuarioHandler(@Param('id') id: string) {
    await this.desativarUsuario.execute({ usuarioId: id })
  }

  @ApiOperation({ summary: 'Excluir associado' })
  @ApiParam({ name: 'id', description: 'UUID do associado' })
  @ApiNoContentResponse({ description: 'Associado excluído.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado.' })
  @ApiResponse({ status: 409, description: 'Usuário possui atas ou documentos de autoria.' })
  @Delete('associados/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluirAssociadoHandler(@Param('id') id: string) {
    await this.excluirAssociado.execute(id)
  }

  @ApiOperation({ summary: 'Buscar associado por ID' })
  @ApiParam({ name: 'id', description: 'UUID do associado' })
  @ApiResponse({ status: 200, description: 'Dados do associado.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado.' })
  @Get('associados/:id')
  async buscarAssociadoHandler(@Param('id') id: string) {
    const associado = await this.buscarAssociado.execute(id)
    return this.toAssociadoResponse(associado)
  }

  @ApiOperation({ summary: 'Atualizar dados do associado' })
  @ApiParam({ name: 'id', description: 'UUID do associado' })
  @ApiResponse({ status: 200, description: 'Associado atualizado.' })
  @ApiResponse({ status: 404, description: 'Associado não encontrado.' })
  @Patch('associados/:id')
  async atualizarAssociadoHandler(@Param('id') id: string, @Body() dto: AtualizarAssociadoDto) {
    const associado = await this.atualizarAssociado.execute({
      associadoId: id,
      status: dto.status,
      dataIngresso: dto.dataIngresso ? new Date(dto.dataIngresso) : undefined,
      observacoes: dto.observacoes,
    })
    return this.toAssociadoResponse(associado)
  }

  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Patch('usuarios/:id')
  async atualizarUsuarioHandler(@Param('id') id: string, @Body() dto: AtualizarUsuarioDto) {
    const usuario = await this.atualizarUsuario.execute({
      usuarioId: id,
      nome: dto.nome,
      email: dto.email,
      role: dto.role,
    })
    return this.toUsuarioResponse(usuario)
  }

  @ApiOperation({ summary: 'Redefinir senha do usuário (admin)' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiNoContentResponse({ description: 'Senha redefinida.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @Patch('usuarios/:id/senha')
  @HttpCode(HttpStatus.NO_CONTENT)
  async atualizarSenhaHandler(@Param('id') id: string, @Body() dto: AtualizarSenhaDto) {
    await this.atualizarSenha.execute({ usuarioId: id, senha: dto.senha })
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
      usuario: {
        id: a.usuario.id,
        nome: a.usuario.nome,
        email: a.usuario.email,
        role: a.usuario.role,
        ativo: a.usuario.ativo,
        criadoEm: a.usuario.criadoEm,
      },
      dataIngresso: a.dataIngresso,
      observacoes: a.observacoes,
      status: a.status,
    }
  }
}
