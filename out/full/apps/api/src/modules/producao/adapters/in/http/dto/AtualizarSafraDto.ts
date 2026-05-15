import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString } from 'class-validator'

export class AtualizarSafraDto {
  @ApiPropertyOptional({ example: 'Laranjeira 2025 — Ajuste' })
  @IsOptional()
  @IsString()
  nome?: string

  @ApiPropertyOptional({ example: '2025-07-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string
}
