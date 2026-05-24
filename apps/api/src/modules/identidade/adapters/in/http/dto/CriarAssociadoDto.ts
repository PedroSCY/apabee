import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'

/** DTO para vincular um usuário existente como associado */
export class CriarAssociadoDto {
  /** UUID do usuário já criado */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID do usuário já criado' })
  @IsUUID()
  usuarioId!: string

  /** Data de ingresso na APA (ISO 8601). Opcional */
  @ApiPropertyOptional({ example: '2024-01-15', description: 'Data de ingresso na APA (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dataIngresso?: string

  /** CPF do associado (somente dígitos) */
  @ApiPropertyOptional({ example: '12345678901', description: 'CPF sem pontuação' })
  @IsOptional()
  @IsString()
  cpf?: string

  /** Observações sobre o associado */
  @ApiPropertyOptional({ example: 'Apicultor com 5 anos de experiência na região' })
  @IsOptional()
  @IsString()
  observacoes?: string
}
