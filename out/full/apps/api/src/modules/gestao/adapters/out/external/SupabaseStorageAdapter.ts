import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { IStoragePort } from '@apa/core'

const BUCKET = 'documentos'

@Injectable()
export class SupabaseStorageAdapter implements IStoragePort {
  private readonly client: SupabaseClient

  constructor(config: ConfigService) {
    this.client = createClient(
      config.get<string>('SUPABASE_PROJECT_URL')!,
      config.get<string>('SUPABASE_SERVICE_KEY')!,
    )
  }

  async obterUrlAssinada(caminho: string, expiracaoSegundos = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(caminho, expiracaoSegundos)
    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException(`Storage: ${error?.message ?? 'erro ao gerar URL'}`)
    }
    return data.signedUrl
  }

  async excluir(caminho: string): Promise<void> {
    const { error } = await this.client.storage.from(BUCKET).remove([caminho])
    if (error) throw new InternalServerErrorException(`Storage: ${error.message}`)
  }
}
