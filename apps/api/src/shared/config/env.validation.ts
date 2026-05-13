import { plainToInstance } from 'class-transformer'
import { IsNumber, IsString, IsUrl, Max, Min, validateSync } from 'class-validator'

/** Esquema validado das variáveis de ambiente obrigatórias. */
class EnvVars {
  @IsNumber()
  @Min(1024)
  @Max(65535)
  PORT: number = 3000

  @IsString()
  DATABASE_URL!: string

  @IsUrl({ require_tld: false })
  SUPABASE_PROJECT_URL!: string

  @IsString()
  SUPABASE_SERVICE_KEY!: string

  @IsString()
  JWT_SECRET!: string
}

/** Valida e transforma as variáveis de ambiente segundo o esquema EnvVars. */
export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true })
  const errors = validateSync(validated, { skipMissingProperties: false })
  if (errors.length > 0) {
    const messages = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('\n')
    throw new Error(`Variáveis de ambiente inválidas:\n${messages}`)
  }
  return validated
}
