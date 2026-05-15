import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator'
import { TipoVenda } from '@apa/shared'

export class RegistrarVendaDto {
  @ApiPropertyOptional({ example: 'uuid-da-campanha' })
  @IsOptional()
  @IsUUID()
  campanhaId?: string

  @ApiProperty({ enum: TipoVenda })
  @IsEnum(TipoVenda)
  tipo!: TipoVenda

  @ApiProperty({ example: 10.5 })
  @IsNumber()
  @IsPositive()
  volume!: number

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @IsPositive()
  valor!: number

  @ApiProperty({ example: '2025-05-01' })
  @IsDateString()
  data!: string

  @ApiPropertyOptional({ example: 'uuid-do-associado' })
  @IsOptional()
  @IsUUID()
  associadoId?: string
}
