import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CriarCredencialInput, IProvedorAuth } from '@apa/core'

@Injectable()
/** Adaptador para autenticação via Supabase Auth (Admin API) */
export class SupabaseProvedorAuth implements IProvedorAuth {
  private readonly client: SupabaseClient

  constructor(config: ConfigService) {
    this.client = createClient(
      config.get<string>('SUPABASE_PROJECT_URL')!,
      config.get<string>('SUPABASE_SERVICE_KEY')!,
    )
  }

  /** Cria uma credencial de usuário no Supabase Auth */
  async criarCredencial({ email, role, nome, telefone, senha, enviarEmail = true }: CriarCredencialInput): Promise<{ id: string }> {
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { nome, telefone },
      ...(senha ? { password: senha } : {}),
    })
    if (error || !data.user) {
      throw new InternalServerErrorException(`Auth: ${error?.message ?? 'erro desconhecido'}`)
    }

    // Envia link de recovery apenas se explicitamente permitido e sem senha definida
    if (!senha && enviarEmail) {
      await this.client.auth.admin.generateLink({ type: 'recovery', email })
    }

    return { id: data.user.id }
  }

  /** Remove o ban do usuário no Supabase Auth (libera acesso) */
  async ativarAcesso(id: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(id, {
      ban_duration: 'none',
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  /** Aplica ban permanente ao usuário no Supabase Auth */
  async revogarAcesso(id: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(id, {
      ban_duration: '876000h',
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  /** Define/redefine a senha de um usuário no Supabase Auth */
  async definirSenha(usuarioId: string, senha: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(usuarioId, {
      password: senha,
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  /** Remove a credencial de um usuário no Supabase Auth */
  async removerCredencial(usuarioId: string): Promise<void> {
    const { error } = await this.client.auth.admin.deleteUser(usuarioId)
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  /** Atualiza os metadados (app_metadata) de um usuário no Supabase Auth */
  async atualizarMetadata(usuarioId: string, metadata: Record<string, unknown>): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(usuarioId, {
      app_metadata: metadata,
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  /** Define app_metadata.role = CLIENTE para um usuário Google OAuth recém-sincronizado */
  async definirRoleCliente(usuarioId: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(usuarioId, {
      app_metadata: { role: 'CLIENTE' },
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }
}
