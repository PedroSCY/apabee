import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { TipoPatrimonio } from '@apa/shared'

export class AtribuirPatrimonioDto {
  @ApiProperty({ example: 'uuid-do-equipamento-ou-insumo' })
  @IsString()
  @IsNotEmpty()
  patrimonioId!: string

  @ApiProperty({ enum: TipoPatrimonio, example: TipoPatrimonio.EQUIPAMENTO })
  @IsEnum(TipoPatrimonio)
  tipoPatrimonio!: TipoPatrimonio

  @ApiProperty({ example: 'uuid-do-associado' })
  @IsString()
  @IsNotEmpty()
  associadoId!: string

  @ApiPropertyOptional({ example: 'Utilização no apiário da Fazenda Boa Vista' })
  @IsOptional()
  @IsString()
  observacao?: string

  @ApiPropertyOptional({ example: '2025-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string
}
