import { IsBoolean, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class AtualizarParticipacaoDto {
  @ApiPropertyOptional({ example: 10.5, description: 'Volume produzido (lotes PRODUCAO)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  volume?: number

  @ApiPropertyOptional({ example: 1000.0, description: 'Valor investido (lotes AQUISICAO)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorInvestido?: number

  @ApiPropertyOptional({ example: 33.33, description: 'Percentual manual (override do cálculo automático)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentual?: number

  @ApiPropertyOptional({ description: 'Define se o percentual foi ajustado manualmente' })
  @IsOptional()
  @IsBoolean()
  percentualManual?: boolean
}
