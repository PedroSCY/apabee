import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Roles } from '../../../../../shared/guards'
import { RoleUsuario } from '@apa/shared'
import { Cliente, EnderecoEntrega } from '@apa/core'
import {
  AtualizarClienteUseCase,
  CriarEnderecoUseCase,
  AtualizarEnderecoUseCase,
  CriarOuSincronizarClienteUseCase,
  DefinirEnderecoPrincipalUseCase,
  ListarClientesUseCase,
  ListarEnderecosClienteUseCase,
  ObterClienteUseCase,
  RemoverEnderecoUseCase,
} from '../../../application/use-cases'
import {
  ATUALIZAR_CLIENTE_USE_CASE,
  ATUALIZAR_ENDERECO_USE_CASE,
  CRIAR_ENDERECO_USE_CASE,
  CRIAR_OU_SINCRONIZAR_CLIENTE_USE_CASE,
  DEFINIR_ENDERECO_PRINCIPAL_USE_CASE,
  LISTAR_CLIENTES_USE_CASE,
  LISTAR_ENDERECOS_USE_CASE,
  OBTER_CLIENTE_USE_CASE,
  REMOVER_ENDERECO_USE_CASE,
} from '../../../loja.tokens'
import {
  ClienteResponse,
  EnderecoEntregaResponse,
  SincronizarClienteResponse,
} from './dto/response.types'

function mapCliente(c: Cliente): ClienteResponse {
  return {
    id: c.id,
    nome: c.nome,
    email: c.email,
    telefone: c.telefone,
    fotoUrl: c.fotoUrl,
    criadoEm: c.criadoEm,
    atualizadoEm: c.atualizadoEm,
  }
}

function mapEndereco(e: EnderecoEntrega): EnderecoEntregaResponse {
  return {
    id: e.id,
    clienteId: e.clienteId,
    apelido: e.apelido,
    logradouro: e.logradouro,
    numero: e.numero,
    complemento: e.complemento,
    bairro: e.bairro,
    cidade: e.cidade,
    estado: e.estado,
    cep: e.cep,
    principal: e.principal,
  }
}

@ApiTags('Loja — Clientes')
@Controller()
export class ClienteLojaController {
  constructor(
    @Inject(CRIAR_OU_SINCRONIZAR_CLIENTE_USE_CASE)
    private readonly syncCliente: CriarOuSincronizarClienteUseCase,
    @Inject(OBTER_CLIENTE_USE_CASE)
    private readonly obterCliente: ObterClienteUseCase,
    @Inject(ATUALIZAR_CLIENTE_USE_CASE)
    private readonly atualizarCliente: AtualizarClienteUseCase,
    @Inject(LISTAR_ENDERECOS_USE_CASE)
    private readonly listarEnderecos: ListarEnderecosClienteUseCase,
    @Inject(CRIAR_ENDERECO_USE_CASE)
    private readonly criarEndereco: CriarEnderecoUseCase,
    @Inject(ATUALIZAR_ENDERECO_USE_CASE)
    private readonly atualizarEndereco: AtualizarEnderecoUseCase,
    @Inject(REMOVER_ENDERECO_USE_CASE)
    private readonly removerEndereco: RemoverEnderecoUseCase,
    @Inject(DEFINIR_ENDERECO_PRINCIPAL_USE_CASE)
    private readonly definirPrincipal: DefinirEnderecoPrincipalUseCase,
    @Inject(LISTAR_CLIENTES_USE_CASE)
    private readonly listarClientes: ListarClientesUseCase,
  ) {}

  /**
   * Sincroniza o cliente Google OAuth com o banco da loja.
   *
   * [C4] Endpoint anteriormente @Public() com decodificação manual do JWT (sem verificação
   * de assinatura). Agora protegido por @Roles(CLIENTE): o JwtAuthGuard verifica a assinatura
   * via JWKS antes de atingir este handler — qualquer tentativa de forjar um JWT é bloqueada.
   *
   * O JwtStrategy inclui auto-sync (Layer 3): para usuários novos, o cliente já estará no banco
   * ao chegar aqui (idempotente). Para re-logins, fast-return imediato.
   *
   * user_metadata (nome, fotoUrl) ainda é decodificado do header mas apenas após o
   * JwtAuthGuard confirmar a assinatura — os bytes são os mesmos do payload verificado.
   */
  @Roles(RoleUsuario.CLIENTE)
  @Post('loja/auth/sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Request() req: any,
    @Headers('authorization') authorization: string,
  ): Promise<SincronizarClienteResponse> {
    // sub e email vêm de req.user — validados pelo JwtAuthGuard + JWKS (assinatura verificada)
    const userId: string = req.user.sub
    const email: string = req.user.email

    // user_metadata: decodificado do token JÁ verificado — seguro porque a assinatura foi confirmada
    let nome = email
    let fotoUrl: string | undefined
    try {
      const base64Payload = authorization.slice(7).split('.')[1] ?? ''
      const rawPayload = JSON.parse(
        Buffer.from(base64Payload, 'base64url').toString('utf-8'),
      ) as Record<string, unknown>
      const meta = (rawPayload['user_metadata'] ?? {}) as Record<string, unknown>
      nome = ((meta['full_name'] ?? meta['name'] ?? email) as string)
      fotoUrl = (meta['avatar_url'] ?? meta['picture']) as string | undefined
    } catch {
      /* user_metadata indisponível — usa email como nome */
    }

    const result = await this.syncCliente.execute({ userId, nome, email, fotoUrl })
    return { cliente: mapCliente(result.cliente), isNew: result.isNew }
  }

  @Roles(RoleUsuario.CLIENTE)
  @Get('loja/clientes/me')
  async me(@Request() req: any): Promise<ClienteResponse> {
    const cliente = await this.obterCliente.execute(req.user.sub)
    return mapCliente(cliente)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Patch('loja/clientes/me')
  async atualizar(
    @Request() req: any,
    @Body() body: { nome?: string; telefone?: string },
  ): Promise<ClienteResponse> {
    const cliente = await this.atualizarCliente.execute({ clienteId: req.user.sub, ...body })
    return mapCliente(cliente)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Get('loja/clientes/me/enderecos')
  async listarEnds(@Request() req: any): Promise<EnderecoEntregaResponse[]> {
    const enderecos = await this.listarEnderecos.execute(req.user.sub)
    return enderecos.map(mapEndereco)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Post('loja/clientes/me/enderecos')
  async criarEnd(@Request() req: any, @Body() body: any): Promise<EnderecoEntregaResponse> {
    const endereco = await this.criarEndereco.execute({ clienteId: req.user.sub, ...body })
    return mapEndereco(endereco)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Patch('loja/clientes/me/enderecos/:id')
  async atualizarEnd(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<EnderecoEntregaResponse> {
    const endereco = await this.atualizarEndereco.execute({ id, clienteId: req.user.sub, ...body })
    return mapEndereco(endereco)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Delete('loja/clientes/me/enderecos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerEnd(@Request() req: any, @Param('id') id: string): Promise<void> {
    await this.removerEndereco.execute(id, req.user.sub)
  }

  @Roles(RoleUsuario.CLIENTE)
  @Patch('loja/clientes/me/enderecos/:id/principal')
  async definirPrincipalEnd(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<EnderecoEntregaResponse> {
    const endereco = await this.definirPrincipal.execute(id, req.user.sub)
    return mapEndereco(endereco)
  }

  @Roles(RoleUsuario.ADMIN)
  @Get('loja/admin/clientes')
  async listar(): Promise<ClienteResponse[]> {
    const clientes = await this.listarClientes.execute()
    return clientes.map(mapCliente)
  }
}
