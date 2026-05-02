import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CriarCredencialInput, IProvedorAuth } from '@apa/core'

@Injectable()
export class SupabaseProvedorAuth implements IProvedorAuth {
  private readonly client: SupabaseClient

  constructor(config: ConfigService) {
    this.client = createClient(
      config.get<string>('SUPABASE_PROJECT_URL')!,
      config.get<string>('SUPABASE_SERVICE_KEY')!,
    )
  }

  async criarCredencial({ email, role, nome, telefone }: CriarCredencialInput): Promise<{ id: string }> {
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      email_confirm: false,
      app_metadata: { role },
      user_metadata: { nome, telefone },
    })
    if (error || !data.user) {
      throw new InternalServerErrorException(`Auth: ${error?.message ?? 'erro desconhecido'}`)
    }
    return { id: data.user.id }
  }

  async ativarAcesso(id: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(id, {
      ban_duration: 'none',
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }

  async revogarAcesso(id: string): Promise<void> {
    const { error } = await this.client.auth.admin.updateUserById(id, {
      ban_duration: '876000h',
    })
    if (error) throw new InternalServerErrorException(`Auth: ${error.message}`)
  }
}
