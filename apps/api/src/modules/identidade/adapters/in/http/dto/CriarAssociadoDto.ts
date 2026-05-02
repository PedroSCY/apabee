import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'

export class CriarAssociadoDto {
  @IsUUID()
  usuarioId!: string

  @IsOptional()
  @IsDateString()
  dataIngresso?: string

  @IsOptional()
  @IsString()
  observacoes?: string
}
