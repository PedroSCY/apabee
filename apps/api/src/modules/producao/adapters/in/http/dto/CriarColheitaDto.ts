import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CriarColheitaDto {
  @ApiProperty()
  @IsUUID()
  associadoId!: string

  @ApiProperty()
  @IsUUID()
  tipoMateriaPrimaId!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  equipamentoId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  campanhaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  safraId?: string

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @IsPositive()
  volume!: number

  @ApiProperty({ example: '2025-06-01' })
  @IsDateString()
  dataColheita!: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string
}
