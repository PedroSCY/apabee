import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { TipoPatrimonio } from '@apa/shared'

export class CriarSolicitacaoDto {
  @ApiProperty({ description: 'ID do equipamento ou insumo solicitado' })
  @IsString()
  patrimonioId!: string

  @ApiProperty({ enum: TipoPatrimonio, description: 'Tipo do patrimônio' })
  @IsEnum(TipoPatrimonio)
  tipoPatrimonio!: TipoPatrimonio

  @ApiPropertyOptional({ description: 'Justificativa da solicitação (máx. 500 caracteres)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  justificativa?: string
}
