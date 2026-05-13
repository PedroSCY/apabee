import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegistrarParticipacaoDto {
  @ApiProperty()
  @IsUUID()
  associadoId!: string

  @ApiPropertyOptional({ example: 10.5, description: 'Volume produzido — obrigatório para lotes PRODUCAO' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  volume?: number

  @ApiPropertyOptional({ example: 1000.0, description: 'Valor investido — obrigatório para lotes AQUISICAO' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorInvestido?: number
}
