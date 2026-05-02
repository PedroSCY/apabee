import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator'

export class CriarAssociadoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID do usuário já criado' })
  @IsUUID()
  usuarioId!: string

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Data de ingresso na APA (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dataIngresso?: string

  @ApiPropertyOptional({ example: 'Apicultor com 5 anos de experiência na região' })
  @IsOptional()
  @IsString()
  observacoes?: string
}
