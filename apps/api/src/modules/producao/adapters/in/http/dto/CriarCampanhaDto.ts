import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DestinatarioCampanha, TipoLote } from '@apa/shared'

export class CriarCampanhaDto {
  @ApiProperty({ example: 'Campanha Mel Laranjeira 2025' })
  @IsString()
  @MinLength(3)
  nome!: string

  @ApiProperty({ enum: TipoLote })
  @IsEnum(TipoLote)
  tipo!: TipoLote

  @ApiPropertyOptional({ enum: DestinatarioCampanha, description: 'Apenas para campanhas de AQUISICAO' })
  @IsOptional()
  @IsEnum(DestinatarioCampanha)
  destinatario?: DestinatarioCampanha

  @ApiPropertyOptional({ example: 'uuid-da-safra' })
  @IsOptional()
  @IsUUID()
  safraId?: string

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  dataInicio!: string

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string

  @ApiPropertyOptional({ example: 5000, description: 'Obrigatório para campanhas de AQUISICAO' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorMeta?: number

  @ApiPropertyOptional({ example: '2025-10-01' })
  @IsOptional()
  @IsDateString()
  prazoContribuicao?: string

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorMinimo?: number

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorMaximo?: number
}
