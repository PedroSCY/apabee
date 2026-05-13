import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'
import { StatusAssociado } from '@apa/shared'

export class AtualizarAssociadoDto {
  @ApiPropertyOptional({ enum: StatusAssociado })
  @IsOptional()
  @IsEnum(StatusAssociado)
  status?: StatusAssociado

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  dataIngresso?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string
}
