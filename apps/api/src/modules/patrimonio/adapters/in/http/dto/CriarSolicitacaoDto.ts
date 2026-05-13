import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator'
import { TipoPatrimonio } from '@apa/shared'

export class CriarSolicitacaoDto {
  @ApiProperty({ enum: TipoPatrimonio, description: 'Tipo do patrimônio' })
  @IsEnum(TipoPatrimonio)
  tipoPatrimonio!: TipoPatrimonio

  @ApiPropertyOptional({ description: 'ID do equipamento (quando tipoPatrimonio = EQUIPAMENTO)' })
  @IsOptional()
  @IsUUID()
  patrimonioId?: string

  @ApiPropertyOptional({ description: 'ID do tipo de insumo (quando tipoPatrimonio = INSUMO)' })
  @IsOptional()
  @IsUUID()
  tipoInsumoId?: string

  @ApiPropertyOptional({ description: 'Quantidade de unidades solicitadas (quando tipoPatrimonio = INSUMO)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number

  @ApiPropertyOptional({ description: 'Justificativa (máx. 500 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  justificativa?: string
}
